/**
 * MainNavigator — Bottom Tabs + Modal Screens
 * 4 abas: Home, Transações, Pedidos, Perfil
 * Screens modais: SendMoney, TransactionDetail, CreateRequest, EditProfile
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, fontFamily, fontSize, spacing } from '@/theme';

// Tab Screens
import HomeScreen from '@/screens/home/HomeScreen';
import TransactionsScreen from '@/screens/transactions/TransactionsScreen';
import RequestsScreen from '@/screens/requests/RequestsScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

// Modal/Stack Screens
import SendMoneyScreen from '@/screens/wallet/SendMoneyScreen';
import TransactionDetailScreen from '@/screens/transactions/TransactionDetailScreen';
import CreateRequestScreen from '@/screens/requests/CreateRequestScreen';
import ReceivedRequestDetailScreen from '@/screens/requests/ReceivedRequestDetailScreen';
import SentRequestDetailScreen from '@/screens/requests/SentRequestDetailScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';

// ========== TYPES ==========
export type MainStackParamList = {
  MainTabs: undefined;
  SendMoney: undefined;
  TransactionDetail: { transaction: import('@/types').Transaction };
  ReceivedRequestDetail: { request: import('@/types').MoneyRequest };
  SentRequestDetail: { request: import('@/types').MoneyRequest };
  CreateRequest: undefined;
  EditProfile: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  TransactionsTab: undefined;
  RequestsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ========== TAB NAVIGATOR ==========
const TabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(21, 17, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#e2e8f0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.semiBold,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.brandPurple,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TransactionsTab':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'RequestsTab':
              iconName = focused ? 'mail' : 'mail-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsScreen}
        options={{ tabBarLabel: 'Transações' }}
      />
      <Tab.Screen
        name="RequestsTab"
        component={RequestsScreen}
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// ========== MAIN STACK (Tabs + Modals) ==========
const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="SendMoney"
        component={SendMoneyScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Group
        screenOptions={{ animation: 'slide_from_bottom' }}
      >
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="ReceivedRequestDetail" component={ReceivedRequestDetailScreen} />
        <Stack.Screen name="SentRequestDetail" component={SentRequestDetailScreen} />
        <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;
