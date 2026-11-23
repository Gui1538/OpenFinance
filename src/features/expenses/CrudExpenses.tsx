import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ConfirmModal, EmptyState, Field, Header, ListRow, SelectField } from '@/components/ui';
import { colors } from '@/theme';
import { DESCRICAO_MAX, EXPENSE_TYPES } from '@/types';
import { formatCurrency, isoToBR, maskDate } from '@/utils/format';
import { useExpenseForm, useExpenses } from './UseExpenses';

/** Tela "Despesas" (lista) */
export function ExpensesList() {
  const x = useExpenses();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Despesas" onBack={x.goBack} onAdd={x.goAdd} />
      <FlatList
        data={x.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshing={x.loading}
        onRefresh={x.reload}
        ListEmptyComponent={
          x.loading ? undefined : <EmptyState icon="card-outline" title="Nenhuma despesa" message="Toque no + para registrar sua primeira despesa." />
        }
        renderItem={({ item }) => {
          const cat = x.categoryById.get(item.categoriaId);
          return (
            <ListRow
              icon={cat?.icone ?? 'help'}
              color={cat?.cor ?? colors.muted}
              title={item.nome}
              subtitle={formatCurrency(item.valor)}
              caption={`${cat?.nome ?? 'Sem categoria'} • ${EXPENSE_TYPES[item.tipo]?.label ?? item.tipo} • ${isoToBR(item.data)}`}
              onEdit={() => x.goEdit(item.id)}
              onDelete={() => x.askDelete(item)}
            />
          );
        }}
      />
      <ConfirmModal
        visible={!!x.toDelete}
        title="Excluir despesa?"
        message={`"${x.toDelete?.nome ?? ''}" será removida. Essa ação não pode ser desfeita.`}
        busy={x.deleting}
        onConfirm={x.confirmDelete}
        onCancel={x.cancelDelete}
      />
    </SafeAreaView>
  );
}

/** Tela "Adicionar/Editar Despesa" */
export function ExpenseForm({ id }: { id?: string }) {
  const f = useExpenseForm(id);
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title={f.isEditing ? 'Editar Despesa' : 'Adicionar Despesa'} onBack={f.goBack} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Nome" placeholder="Ex: Supermercado" value={f.form.nome} onChangeText={f.setField('nome')} error={f.errors.nome} maxLength={60} />
        <Field label="Valor (R$)" placeholder="Ex: 150,00" keyboardType="decimal-pad" value={f.form.valor} onChangeText={f.setField('valor')} error={f.errors.valor} />
        <SelectField
          label="Categoria"
          placeholder="Selecione uma categoria"
          value={f.form.categoriaId}
          onChange={f.setField('categoriaId')}
          error={f.errors.categoriaId}
          options={f.categories.map((c) => ({ value: c.id, label: c.nome, icon: c.icone, color: c.cor }))}
          emptyText="Você ainda não tem categorias. Crie uma primeiro."
        />
        {f.categories.length === 0 ? (
          <TouchableOpacity onPress={f.goNewCategory} style={{ marginBottom: 14 }}>
            <Text style={styles.link}>+ Criar categoria</Text>
          </TouchableOpacity>
        ) : null}
        <SelectField
          label="Tipo"
          placeholder="Fixa ou variável"
          value={f.form.tipo}
          onChange={f.setTipo}
          error={f.errors.tipo}
          options={Object.entries(EXPENSE_TYPES).map(([value, t]) => ({ value, label: `${t.label} — ${t.hint}` }))}
        />
        <Field
          label="Data"
          placeholder="dd/mm/aaaa"
          keyboardType="numeric"
          value={f.form.data}
          onChangeText={(t) => f.setField('data')(maskDate(t))}
          error={f.errors.data}
          rightIcon="calendar-outline"
          maxLength={10}
        />
        <Field
          label="Descrição"
          placeholder="Ex: Compras da semana no mercado"
          value={f.form.descricao}
          onChangeText={f.setField('descricao')}
          error={f.errors.descricao}
          maxLength={DESCRICAO_MAX}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
          counter={`${f.form.descricao.length}/${DESCRICAO_MAX}`}
        />
        <Button title={f.isEditing ? 'Salvar Alterações' : 'Salvar Despesa'} onPress={f.submit} loading={f.saving} disabled={!f.loaded} style={{ marginTop: 6 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  form: { padding: 20 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
