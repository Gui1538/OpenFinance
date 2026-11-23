import { Ionicons } from '@expo/vector-icons';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ConfirmModal, EmptyState, Field, Header, IconCircle, ListRow, SelectField } from '@/components/ui';
import { colors } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TYPES, DESCRICAO_MAX } from '@/types';
import { useCategories, useCategoryForm } from './UseCategory';

/** Tela "Categorias" (lista) */
export function CategoryList() {
  const c = useCategories();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Categorias" onBack={c.goBack} onAdd={c.goAdd} />
      <FlatList
        data={c.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshing={c.loading}
        onRefresh={c.reload}
        ListEmptyComponent={
          c.loading ? undefined : (
            <EmptyState icon="grid-outline" title="Nenhuma categoria" message="Toque no + para criar sua primeira categoria." />
          )
        }
        renderItem={({ item }) => (
          <ListRow
            icon={item.icone}
            color={item.cor}
            title={item.nome}
            caption={`${CATEGORY_TYPES[item.tipo]?.label ?? item.tipo} • ${item.descricao}`}
            onEdit={() => c.goEdit(item.id)}
            onDelete={() => c.askDelete(item)}
          />
        )}
      />
      <ConfirmModal
        visible={!!c.toDelete}
        title="Excluir categoria?"
        message={`"${c.toDelete?.nome ?? ''}" será removida. Essa ação não pode ser desfeita.`}
        busy={c.deleting}
        onConfirm={c.confirmDelete}
        onCancel={c.cancelDelete}
      />
    </SafeAreaView>
  );
}

/** Tela "Adicionar/Editar Categoria" */
export function CategoryForm({ id }: { id?: string }) {
  const f = useCategoryForm(id);
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title={f.isEditing ? 'Editar Categoria' : 'Adicionar Categoria'} onBack={f.goBack} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Nome" placeholder="Ex: Mercado" value={f.form.nome} onChangeText={f.setField('nome')} error={f.errors.nome} maxLength={30} />
        <SelectField
          label="Tipo"
          placeholder="Essencial ou não essencial"
          value={f.form.tipo}
          onChange={f.setTipo}
          error={f.errors.tipo}
          options={Object.entries(CATEGORY_TYPES).map(([value, t]) => ({ value, label: `${t.label} — ${t.hint}` }))}
        />
        <Field
          label="Descrição"
          placeholder="Ex: Compras do mês, feira e padaria"
          value={f.form.descricao}
          onChangeText={f.setField('descricao')}
          error={f.errors.descricao}
          maxLength={DESCRICAO_MAX}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
          counter={`${f.form.descricao.length}/${DESCRICAO_MAX}`}
        />

        <Text style={styles.label}>Ícone</Text>
        <View style={styles.grid}>
          {CATEGORY_ICONS.map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => f.setField('icone')(name)}
              style={[styles.iconCell, f.form.icone === name && { borderColor: f.form.cor, backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name={name} size={24} color={f.form.icone === name ? f.form.cor : colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Cor</Text>
        <View style={styles.grid}>
          {CATEGORY_COLORS.map((hex) => (
            <TouchableOpacity key={hex} onPress={() => f.setField('cor')(hex)} style={[styles.colorCell, { backgroundColor: hex }]}>
              {f.form.cor === hex ? <Ionicons name="checkmark" size={20} color="#fff" /> : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.preview}>
          <IconCircle icon={f.form.icone} color={f.form.cor} />
          <Text style={styles.previewText}>{f.form.nome.trim() || 'Pré-visualização'}</Text>
        </View>

        <Button title={f.isEditing ? 'Salvar Alterações' : 'Salvar Categoria'} onPress={f.submit} loading={f.saving} disabled={!f.loaded} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  iconCell: {
    width: 52, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.inputBg,
  },
  colorCell: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, backgroundColor: colors.inputBg, marginBottom: 22 },
  previewText: { fontSize: 16, fontWeight: '700', color: colors.text },
});
