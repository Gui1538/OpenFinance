import * as Network from 'expo-network';

export function stateToOnline(s: Network.NetworkState): boolean {
  return !!s.isConnected && s.isInternetReachable !== false;
}

export async function checkOnline(): Promise<boolean> {
  try {
    return stateToOnline(await Network.getNetworkStateAsync());
  } catch {
    return true; // na dúvida, tenta; o sync trata falhas de rede
  }
}

export function watchConnectivity(cb: (online: boolean) => void): () => void {
  const sub = Network.addNetworkStateListener((s) => cb(stateToOnline(s)));
  return () => sub.remove();
}
