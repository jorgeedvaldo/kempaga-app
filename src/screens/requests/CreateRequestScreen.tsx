/**
 * CreateRequestScreen — Criar um pedido de dinheiro
 * Fluxo: Pesquisar utilizador → Inserir valor → Criar pedido
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { userService } from '@/services/userService';
import { requestService } from '@/services/requestService';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import LoadingOverlay from '@/components/LoadingOverlay';
import type { UserSearchResult } from '@/types';

const CreateRequestScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'search' | 'amount'>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (text.length < 3) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const { users } = await userService.searchUsers(text);
          setSearchResults(users.filter((u) => u.id !== user?.id));
        } catch (error) {
          console.warn('Erro na pesquisa:', error);
        } finally {
          setSearching(false);
        }
      }, 500);
    },
    [user?.id]
  );

  const handleSend = async () => {
    if (!selectedUser) return;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      Alert.alert('Erro', 'Insira um valor válido (mínimo 1 AOA)');
      return;
    }
    setSending(true);
    try {
      await requestService.createRequest(selectedUser.id, numAmount, note || undefined);
      Alert.alert(
        'Pedido Enviado! ✅',
        `Pedido de ${formatCurrency(numAmount)} AOA enviado para ${selectedUser.first_name}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'search') navigation.goBack();
            else setStep('search');
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          Pedir Dinheiro
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {step === 'search' ? (
        <>
          <View
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fontFamily.medium }]}
              placeholder="Pesquisar utilizador..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              autoCapitalize="none"
            />
          </View>

          {searching ? (
            <ActivityIndicator size="small" color={colors.brandPurple} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setSelectedUser(item); setStep('amount'); }}
                  activeOpacity={0.7}
                >
                  <Avatar imageUrl={item.image_url} name={`${item.first_name} ${item.last_name}`} size={44} showBorder={false} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text style={[{ color: colors.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.sm }]}>
                      {item.phone}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: spacing['2xl'] }}
            />
          )}
        </>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.amountContainer, { paddingBottom: Math.max(insets.bottom, spacing['2xl']) }]}
        >
          {selectedUser && (
            <View style={styles.selectedUser}>
              <Avatar imageUrl={selectedUser.image_url} name={`${selectedUser.first_name} ${selectedUser.last_name}`} size={56} showBorder />
              <Text style={[styles.selectedName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
                {selectedUser.first_name} {selectedUser.last_name}
              </Text>
            </View>
          )}

          <View style={styles.amountRow}>
            <TextInput
              style={[styles.amountInput, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
            <Text style={[styles.currency, { color: colors.textMuted, fontFamily: fontFamily.bold }]}>AOA</Text>
          </View>

          <View
            style={[styles.noteInput, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.noteTextInput, { color: colors.textPrimary, fontFamily: fontFamily.medium }]}
              placeholder="Razão do pedido (opcional)"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              maxLength={500}
            />
          </View>

          <View style={{ marginTop: 'auto' }}>
            <Button title="Enviar Pedido" onPress={handleSend} loading={sending} />
          </View>
        </KeyboardAvoidingView>
      )}

      <LoadingOverlay visible={sending} message="A criar pedido..." />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.lg, paddingVertical: spacing.sm },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  userName: { fontSize: fontSize.lg },
  amountContainer: { flex: 1, padding: spacing['2xl'] },
  selectedUser: { alignItems: 'center', marginBottom: spacing['3xl'] },
  selectedName: { fontSize: fontSize.xl, marginTop: spacing.md },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  amountInput: { fontSize: 48, textAlign: 'center', minWidth: 100 },
  currency: { fontSize: fontSize['2xl'], marginLeft: spacing.sm },
  noteInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing['3xl'],
  },
  noteTextInput: { flex: 1, fontSize: fontSize.lg, paddingVertical: spacing.sm },
});

export default CreateRequestScreen;
