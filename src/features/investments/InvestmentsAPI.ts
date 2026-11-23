import { localDB } from '@/services/database';

export type QuoteKind = 'currency' | 'crypto' | 'stock';

export interface Quote {
  code: string;
  name: string;
  kind: QuoteKind;
  /** preço em reais */
  price: number;
  /** variação do dia em % */
  changePct: number;
}

export interface QuotesSnapshot {
  quotes: Quote[];
  fetchedAt: number;
  /** códigos que não vieram da API nesta atualização */
  failed: string[];
}

const CACHE_KEY = 'market.quotes.v1';
const TIMEOUT_MS = 10000;

// AwesomeAPI (gratuita, sem chave): moedas e criptomoedas em reais.
const AWESOME_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL';
const AWESOME_META: Record<string, { code: string; name: string; kind: QuoteKind }> = {
  USDBRL: { code: 'USD', name: 'Dólar (USD)', kind: 'currency' },
  EURBRL: { code: 'EUR', name: 'Euro (EUR)', kind: 'currency' },
  BTCBRL: { code: 'BTC', name: 'Bitcoin', kind: 'crypto' },
  ETHBRL: { code: 'ETH', name: 'Ethereum', kind: 'crypto' },
};

// brapi.dev: ações da B3. Esses 4 tickers funcionam sem token; para outros, defina EXPO_PUBLIC_BRAPI_TOKEN.
export const STOCK_TICKERS = ['PETR4', 'VALE3', 'ITUB4', 'MGLU3'];
const BRAPI_TOKEN = process.env.EXPO_PUBLIC_BRAPI_TOKEN;

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : NaN;
};

async function fetchAwesome(): Promise<Quote[]> {
  const json = (await getJson(AWESOME_URL)) as Record<string, { bid?: string; pctChange?: string }>;
  const out: Quote[] = [];
  for (const [key, meta] of Object.entries(AWESOME_META)) {
    const item = json[key];
    const price = num(item?.bid);
    if (!item || Number.isNaN(price)) continue;
    out.push({ ...meta, price, changePct: num(item.pctChange) || 0 });
  }
  return out;
}

async function fetchStock(ticker: string): Promise<Quote> {
  const token = BRAPI_TOKEN ? `?token=${encodeURIComponent(BRAPI_TOKEN)}` : '';
  const json = (await getJson(`https://brapi.dev/api/quote/${ticker}${token}`)) as {
    results?: { symbol?: string; shortName?: string; longName?: string; regularMarketPrice?: number; regularMarketChangePercent?: number }[];
  };
  const r = json.results?.[0];
  const price = num(r?.regularMarketPrice);
  if (!r || Number.isNaN(price)) throw new Error(`Sem cotação para ${ticker}`);
  return {
    code: r.symbol ?? ticker,
    name: r.shortName ?? r.longName ?? ticker,
    kind: 'stock',
    price,
    changePct: num(r.regularMarketChangePercent) || 0,
  };
}

/** Busca moedas, criptos e ações. Falhas parciais não derrubam o resultado. */
export async function fetchQuotes(): Promise<QuotesSnapshot> {
  const [awesome, ...stocks] = await Promise.allSettled([fetchAwesome(), ...STOCK_TICKERS.map(fetchStock)]);

  const quotes: Quote[] = [];
  const failed: string[] = [];

  if (awesome.status === 'fulfilled') quotes.push(...awesome.value);
  const missing = Object.values(AWESOME_META).map((m) => m.code).filter((c) => !quotes.some((q) => q.code === c));
  failed.push(...missing);

  stocks.forEach((s, i) => {
    if (s.status === 'fulfilled') quotes.push(s.value);
    else failed.push(STOCK_TICKERS[i]);
  });

  if (quotes.length === 0) throw new Error('Não foi possível obter as cotações. Verifique sua conexão.');

  const snapshot: QuotesSnapshot = { quotes, fetchedAt: Date.now(), failed };
  await localDB.setCache(CACHE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

/** Última cotação salva no SQLite (para mostrar offline). */
export async function loadCachedQuotes(): Promise<QuotesSnapshot | null> {
  try {
    const raw = await localDB.getCache(CACHE_KEY);
    return raw ? (JSON.parse(raw) as QuotesSnapshot) : null;
  } catch {
    return null;
  }
}
