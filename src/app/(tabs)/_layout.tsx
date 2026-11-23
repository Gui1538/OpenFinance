import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/theme';
import type { IconName } from '@/types';

const TABS: { name: string; title: string; icon: IconName; iconOff: IconName }[] = [
  { name: 'Home', title: 'Início', icon: 'home', iconOff: 'home-outline' },
  { name: 'Expenses', title: 'Despesas', icon: 'card', iconOff: 'card-outline' },
  { name: 'Revenue', title: 'Receitas', icon: 'arrow-down-circle', iconOff: 'arrow-down-circle-outline' },
  { name: 'Category', title: 'Categorias', icon: 'grid', iconOff: 'grid-outline' },
  { name: 'Investimentos', title: 'Cotações', icon: 'trending-up', iconOff: 'trending-up-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? t.icon : t.iconOff} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
