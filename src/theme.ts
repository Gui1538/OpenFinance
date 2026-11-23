export const colors = {
  primary: '#0F7B3A',
  primaryDark: '#0B5D2C',
  primaryLight: '#E3F4E8',
  bg: '#F6F9F7',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
