import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius } from '@/theme';
import type { IconName } from '@/types';

/* ------------------------------ Button ------------------------------ */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }: ButtonProps) {
  const palette = {
    primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  }[variant];
  const off = disabled || loading;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
      style={[s.btn, { backgroundColor: palette.bg, borderColor: palette.border, opacity: off ? 0.6 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={s.row}>
          {icon ? <Ionicons name={icon} size={18} color={palette.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[s.btnText, { color: palette.fg }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ------------------------------ Header ------------------------------ */
interface HeaderProps {
  title: string;
  onBack?: () => void;
  onAdd?: () => void;
  right?: ReactNode;
}

export function Header({ title, onBack, onAdd, right }: HeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.headerSide}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={s.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[s.headerSide, { alignItems: 'flex-end' }]}>
        {onAdd ? (
          <TouchableOpacity onPress={onAdd} style={s.addBtn} accessibilityLabel="Adicionar">
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          right
        )}
      </View>
    </View>
  );
}

/* ------------------------------ Field ------------------------------ */
interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: IconName;
  rightIcon?: IconName;
  onRightPress?: () => void;
  /** texto pequeno à direita abaixo do campo (ex.: contador de caracteres) */
  counter?: string;
}

export function Field({ label, error, counter, icon, rightIcon, onRightPress, style, ...rest }: FieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={[s.inputBox, error ? { borderColor: colors.danger } : null]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.muted} style={{ marginRight: 8 }} /> : null}
        <TextInput
          placeholderTextColor="#9CA3AF"
          style={[s.input, style]}
          {...rest}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} disabled={!onRightPress} hitSlop={10}>
            <Ionicons name={rightIcon} size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      {counter ? <Text style={s.counter}>{counter}</Text> : null}
    </View>
  );
}

/* ---------------------------- SelectField ---------------------------- */
export interface SelectOption {
  value: string;
  label: string;
  icon?: IconName;
  color?: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  emptyText?: string;
}

export function SelectField({ label, placeholder, value, options, onChange, error, emptyText }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity
        style={[s.inputBox, error ? { borderColor: colors.danger } : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {selected?.icon ? <IconCircle icon={selected.icon} color={selected.color ?? colors.primary} size={26} /> : null}
        <Text style={[s.input, { paddingVertical: 14, marginLeft: selected?.icon ? 8 : 0, color: selected ? colors.text : '#9CA3AF' }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </TouchableOpacity>
      {error ? <Text style={s.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.overlay} onPress={() => setOpen(false)}>
          <Pressable style={[s.sheet, { maxHeight: '60%' }]} onPress={() => undefined}>
            <Text style={s.sheetTitle}>{label}</Text>
            {options.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: 'center', paddingVertical: 20 }}>
                {emptyText ?? 'Nenhuma opção disponível.'}
              </Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(o) => o.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.option}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    {item.icon ? <IconCircle icon={item.icon} color={item.color ?? colors.primary} size={32} /> : null}
                    <Text style={[s.optionText, { marginLeft: item.icon ? 12 : 0 }]}>{item.label}</Text>
                    {item.value === value ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                  </TouchableOpacity>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ----------------------------- IconCircle ----------------------------- */
export function IconCircle({ icon, color, size = 44 }: { icon: IconName; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color="#fff" />
    </View>
  );
}

/* ------------------------------ ListRow ------------------------------ */
interface ListRowProps {
  icon: IconName;
  color: string;
  title: string;
  subtitle?: string;
  caption?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ListRow({ icon, color, title, subtitle, caption, onEdit, onDelete }: ListRowProps) {
  return (
    <View style={s.listRow}>
      <IconCircle icon={icon} color={color} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
        {caption ? <Text style={s.rowCaption}>{caption}</Text> : null}
      </View>
      <TouchableOpacity style={s.actionBtn} onPress={onEdit} accessibilityLabel={`Editar ${title}`}>
        <Ionicons name="pencil" size={16} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.dangerLight }]} onPress={onDelete} accessibilityLabel={`Excluir ${title}`}>
        <Ionicons name="trash" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

/* ----------------------------- EmptyState ----------------------------- */
export function EmptyState({ icon, title, message }: { icon: IconName; title: string; message: string }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
      <Ionicons name={icon} size={56} color="#C7D2CB" />
      <Text style={[s.rowTitle, { marginTop: 12 }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>{message}</Text>
    </View>
  );
}

/* ---------------------------- ConfirmModal ---------------------------- */
interface ConfirmProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ visible, title, message, confirmLabel = 'Excluir', busy, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.dialog}>
          <Text style={s.dialogTitle}>{title}</Text>
          <Text style={s.dialogMsg}>{message}</Text>
          <Button title={confirmLabel} variant="danger" onPress={onConfirm} loading={busy} />
          <Button title="Cancelar" variant="ghost" onPress={onCancel} style={{ marginTop: 6 }} />
        </View>
      </View>
    </Modal>
  );
}

/* ----------------------------- StatusDialog ----------------------------- */
/** Cartão central usado nas telas de feedback e no aviso de modo offline. */
export function StatusDialog({
  visible,
  icon,
  tint,
  tintBg,
  title,
  message,
  buttonLabel,
  secondaryLabel,
  onPress,
  onSecondary,
}: {
  visible: boolean;
  icon: IconName;
  tint: string;
  tintBg: string;
  title: string;
  message: string;
  buttonLabel: string;
  secondaryLabel?: string;
  onPress: () => void;
  onSecondary?: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPress}>
      <View style={s.overlay}>
        <View style={s.dialog}>
          <View style={[s.statusIcon, { backgroundColor: tintBg }]}>
            <Ionicons name={icon} size={38} color={tint} />
          </View>
          <Text style={s.dialogTitle}>{title}</Text>
          <Text style={s.dialogMsg}>{message}</Text>
          <Button title={buttonLabel} onPress={onPress} />
          {secondaryLabel && onSecondary ? (
            <Button title={secondaryLabel} variant="ghost" onPress={onSecondary} style={{ marginTop: 6 }} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { height: 50, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnText: { fontSize: 16, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card },
  headerSide: { width: 44 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1,
    borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 12 },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  counter: { color: colors.muted, fontSize: 11, marginTop: 4, textAlign: 'right' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  sheet: { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: radius.lg, padding: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 8, textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  optionText: { flex: 1, fontSize: 15, color: colors.text },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 8 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 },
  rowCaption: { fontSize: 12, color: colors.muted, marginTop: 2 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center' },
  dialog: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: radius.lg, padding: 22 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  dialogMsg: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  statusIcon: { width: 72, height: 72, borderRadius: 36, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
