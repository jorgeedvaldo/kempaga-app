/**
 * SendMoneyScreen — Enviar dinheiro para outro utilizador
 * Fluxo: Pesquisar → Inserir valor → Confirmar → Enviar
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme, fontFamily, fontSize, spacing, borderRadius } from '@/theme';
import { userService } from '@/services/userService';
import { transactionService } from '@/services/transactionService';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import LoadingOverlay from '@/components/LoadingOverlay';
import type { UserSearchResult } from '@/types';

type Step = 'search' | 'amount' | 'confirm';

const SendMoneyScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pesquisa com debounce
  const handleSearch = useCallback((text: string) => {
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
        // Filtrar o próprio utilizador dos resultados
        setSearchResults(users.filter((u) => u.id !== user?.id));
      } catch (error) {
        console.warn('Erro na pesquisa:', error);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, [user?.id]);

  const selectUser = (u: UserSearchResult) => {
    setSelectedUser(u);
    setStep('amount');
  };

  const goToConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      Alert.alert('Erro', 'Insira um valor válido (mínimo 1 AOA)');
      return;
    }
    setStep('confirm');
  };

  const handleSend = async () => {
    if (!selectedUser) return;
    setSending(true);
    try {
      const numAmount = parseFloat(amount);
      await transactionService.sendMoney(selectedUser.id, numAmount, note || undefined);
      await refreshUser();
      Alert.alert(
        'Sucesso! ✅',
        `${formatCurrency(numAmount)} AOA enviados para ${selectedUser.first_name} ${selectedUser.last_name}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const renderSearchStep = () => (
    <>
      {/* Barra de pesquisa */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.textPrimary, fontFamily: fontFamily.medium },
          ]}
          placeholder="Pesquisar por nome, email ou telefone..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Resultados */}
      {searching ? (
        <ActivityIndicator size="small" color={colors.brandPurple} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.userRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => selectUser(item)}
              activeOpacity={0.7}
            >
              <Avatar imageUrl={item.image_url} name={`${item.first_name} ${item.last_name}`} size={44} showBorder={false} />
              <View style={styles.userRowText}>
                <Text style={[styles.userRowName, { color: colors.textPrimary, fontFamily: fontFamily.semiBold }]}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={[styles.userRowEmail, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
                  {item.phone}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            query.length >= 3 && !searching ? (
              <Text style={[styles.noResults, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
                Nenhum utilizador encontrado
              </Text>
            ) : null
          }
        />
      )}
    </>
  );

  const renderAmountStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.amountContainer}
    >
      {/* Destinatário selecionado */}
      {selectedUser && (
        <View style={styles.selectedUserCard}>
          <Avatar imageUrl={selectedUser.image_url} name={`${selectedUser.first_name} ${selectedUser.last_name}`} size={56} showBorder />
          <Text style={[styles.selectedUserName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
            {selectedUser.first_name} {selectedUser.last_name}
          </Text>
          <Text style={[styles.selectedUserPhone, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
            {selectedUser.phone}
          </Text>
        </View>
      )}

      {/* Input de valor */}
      <View style={styles.amountInputWrapper}>
        <TextInput
          style={[styles.amountInput, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          autoFocus
        />
        <Text style={[styles.amountCurrency, { color: colors.textMuted, fontFamily: fontFamily.bold }]}>
          AOA
        </Text>
      </View>

      {/* Saldo disponível */}
      <Text style={[styles.balanceInfo, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
        Saldo disponível: {formatCurrency(user?.wallet?.balance || '0')} AOA
      </Text>

      {/* Nota (opcional) */}
      <View
        style={[
          styles.noteInput,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.noteTextInput, { color: colors.textPrimary, fontFamily: fontFamily.medium }]}
          placeholder="Adicionar nota (opcional)"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          maxLength={500}
        />
      </View>

      <View style={styles.amountActions}>
        <Button title="Continuar" onPress={goToConfirm} />
      </View>
    </KeyboardAvoidingView>
  );

  const renderConfirmStep = () => (
    <View style={styles.confirmContainer}>
      <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.confirmLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
          Enviar para
        </Text>
        <View style={styles.confirmUserRow}>
          <Avatar
            imageUrl={selectedUser?.image_url}
            name={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            size={48}
            showBorder={false}
          />
          <View>
            <Text style={[styles.confirmUserName, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
              {selectedUser?.first_name} {selectedUser?.last_name}
            </Text>
            <Text style={[styles.confirmUserPhone, { color: colors.textMuted, fontFamily: fontFamily.regular }]}>
              {selectedUser?.phone}
            </Text>
          </View>
        </View>

        <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

        <Text style={[styles.confirmLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
          Montante
        </Text>
        <Text style={[styles.confirmAmount, { color: colors.brandPurple, fontFamily: fontFamily.bold }]}>
          {formatCurrency(amount)} AOA
        </Text>

        {note ? (
          <>
            <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.confirmLabel, { color: colors.textMuted, fontFamily: fontFamily.medium }]}>
              Nota
            </Text>
            <Text style={[styles.confirmNote, { color: colors.textPrimary, fontFamily: fontFamily.regular }]}>
              {note}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.confirmActions}>
        <Button title="Confirmar Envio" onPress={handleSend} loading={sending} />
        <Button
          title="Cancelar"
          onPress={() => setStep('amount')}
          variant="ghost"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.screenHeader, { borderColor: colors.border, paddingTop: Math.max(insets.top, spacing['5xl']) }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'search') navigation.goBack();
            else if (step === 'amount') setStep('search');
            else setStep('amount');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.textPrimary, fontFamily: fontFamily.bold }]}>
          {step === 'search' ? 'Enviar Dinheiro' : step === 'amount' ? 'Inserir Valor' : 'Confirmar'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {step === 'search' && renderSearchStep()}
      {step === 'amount' && renderAmountStep()}
      {step === 'confirm' && renderConfirmStep()}

      <LoadingOverlay visible={sending} message="A enviar..." />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  screenTitle: { fontSize: fontSize.xl },
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
  resultsList: { paddingHorizontal: spacing['2xl'] },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  userRowText: { flex: 1 },
  userRowName: { fontSize: fontSize.lg },
  userRowEmail: { fontSize: fontSize.sm, marginTop: 2 },
  noResults: { textAlign: 'center', marginTop: spacing['3xl'], fontSize: fontSize.lg },
  amountContainer: { flex: 1, padding: spacing['2xl'] },
  selectedUserCard: { alignItems: 'center', marginBottom: spacing['3xl'] },
  selectedUserName: { fontSize: fontSize.xl, marginTop: spacing.md },
  selectedUserPhone: { fontSize: fontSize.md },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  amountInput: { fontSize: 48, textAlign: 'center', minWidth: 100 },
  amountCurrency: { fontSize: fontSize['2xl'], marginLeft: spacing.sm },
  balanceInfo: { textAlign: 'center', fontSize: fontSize.md, marginBottom: spacing['2xl'] },
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
  amountActions: { marginTop: 'auto' },
  confirmContainer: { flex: 1, padding: spacing['2xl'] },
  confirmCard: {
    padding: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    marginBottom: spacing['3xl'],
  },
  confirmUserRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  confirmLabel: { fontSize: fontSize.sm, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  confirmUserName: { fontSize: fontSize.xl },
  confirmUserPhone: { fontSize: fontSize.md },
  confirmDivider: { height: 1, marginVertical: spacing.lg },
  confirmAmount: { fontSize: fontSize['4xl'] },
  confirmNote: { fontSize: fontSize.lg },
  confirmActions: { marginTop: 'auto', gap: spacing.md },
});

export default SendMoneyScreen;
