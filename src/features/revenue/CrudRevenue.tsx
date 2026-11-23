import { FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ConfirmModal, EmptyState, Field, Header, ListRow, SelectField } from '@/components/ui';
import { DESCRICAO_MAX, REVENUE_TYPES } from '@/types';
import { formatCurrency, isoToBR, maskDate } from '@/utils/format';
import { useRevenueForm, useRevenues } from './UseRevenue';

const TYPE_OPTIONS = Object.entries(REVENUE_TYPES).map(([value, v]) => ({
  value, label: v.label, icon: v.icon, color: v.color,
}));

/** Tela "Receitas" (lista) */
export function RevenueList() {
  const r = useRevenues();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Receitas" onBack={r.goBack} onAdd={r.goAdd} />
      <FlatList
        data={r.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshing={r.loading}
        onRefresh={r.reload}
        ListEmptyComponent={
          r.loading ? undefined : <EmptyState icon="arrow-down-circle-outline" title="Nenhuma receita" message="Toque no + para registrar sua primeira receita." />
        }
        renderItem={({ item }) => {
          const src = REVENUE_TYPES[item.tipo] ?? REVENUE_TYPES.outros;
          return (
            <ListRow
              icon={src.icon}
              color={src.color}
              title={item.nome}
              subtitle={formatCurrency(item.valor)}
              caption={`${src.label} • ${isoToBR(item.data)}`}
              onEdit={() => r.goEdit(item.id)}
              onDelete={() => r.askDelete(item)}
            />
          );
        }}
      />
      <ConfirmModal
        visible={!!r.toDelete}
        title="Excluir receita?"
        message={`"${r.toDelete?.nome ?? ''}" será removida. Essa ação não pode ser desfeita.`}
        busy={r.deleting}
        onConfirm={r.confirmDelete}
        onCancel={r.cancelDelete}
      />
    </SafeAreaView>
  );
}

/** Tela "Adicionar/Editar Receita" */
export function RevenueForm({ id }: { id?: string }) {
  const f = useRevenueForm(id);
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title={f.isEditing ? 'Editar Receita' : 'Adicionar Receita'} onBack={f.goBack} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label="Nome" placeholder="Ex: Salário de novembro" value={f.form.nome} onChangeText={f.setField('nome')} error={f.errors.nome} maxLength={60} />
        <Field label="Valor (R$)" placeholder="Ex: 2.500,00" keyboardType="decimal-pad" value={f.form.valor} onChangeText={f.setField('valor')} error={f.errors.valor} />
        <SelectField
          label="Tipo"
          placeholder="Selecione o tipo"
          value={f.form.tipo}
          onChange={f.setTipo}
          options={TYPE_OPTIONS}
          error={f.errors.tipo}
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
          placeholder="Ex: Pagamento mensal da empresa"
          value={f.form.descricao}
          onChangeText={f.setField('descricao')}
          error={f.errors.descricao}
          maxLength={DESCRICAO_MAX}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
          counter={`${f.form.descricao.length}/${DESCRICAO_MAX}`}
        />
        <Button title={f.isEditing ? 'Salvar Alterações' : 'Salvar Receita'} onPress={f.submit} loading={f.saving} disabled={!f.loaded} style={{ marginTop: 6 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  form: { padding: 20 },
});
