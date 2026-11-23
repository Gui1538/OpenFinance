import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StatusDialog } from '@/components/ui';
import { colors } from '@/theme';

export type FeedbackType = 'success' | 'error' | 'info';

export interface FeedbackOptions {
  type: FeedbackType;
  title: string;
  message: string;
  buttonLabel?: string;
  /** chamado quando o usuário fecha a tela de feedback */
  onClose?: () => void;
}

interface FeedbackContextValue {
  showFeedback: (opts: FeedbackOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({ showFeedback: () => undefined });

const LOOK = {
  success: { icon: 'checkmark-circle', tint: colors.success, bg: colors.successLight },
  error: { icon: 'close-circle', tint: colors.danger, bg: colors.dangerLight },
  info: { icon: 'information-circle', tint: colors.warning, bg: colors.warningLight },
} as const;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<FeedbackOptions | null>(null);

  const showFeedback = useCallback((opts: FeedbackOptions) => setCurrent(opts), []);

  const close = () => {
    const cb = current?.onClose;
    setCurrent(null);
    cb?.();
  };

  const value = useMemo(() => ({ showFeedback }), [showFeedback]);
  const look = LOOK[current?.type ?? 'info'];

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <StatusDialog
        visible={!!current}
        icon={look.icon}
        tint={look.tint}
        tintBg={look.bg}
        title={current?.title ?? ''}
        message={current?.message ?? ''}
        buttonLabel={current?.buttonLabel ?? (current?.type === 'error' ? 'Entendi' : 'Ok')}
        onPress={close}
      />
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);
