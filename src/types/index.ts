/**
 * Kempaga — TypeScript Interfaces
 * Modelos de dados da API
 */

// ==================== USER ====================
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: 'customer' | 'agent' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  bi_number: string;
  image_url: string | null;
  full_name: string;
  wallet?: Wallet;
  created_at?: string;
  updated_at?: string;
}

export interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  image_url: string | null;
}

// ==================== WALLET ====================
export interface Wallet {
  id: number;
  user_id: number;
  balance: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== TRANSACTION ====================
export interface Transaction {
  id: number;
  trx_id: string;
  user_id: number;
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  transaction_type: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'request';
  amount: string;
  charge: string;
  net_amount: string;
  balance_after: string;
  sender_id: number | null;
  receiver_id: number | null;
  note: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  sender?: UserSearchResult;
  receiver?: UserSearchResult;
  entries?: TransactionEntry[];
}

export interface TransactionEntry {
  id: number;
  transaction_id: number;
  wallet_id: number;
  amount: string;
  entry_type: 'credit' | 'debit';
  wallet?: Wallet;
}

// ==================== MONEY REQUEST ====================
export interface MoneyRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: string;
  note: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  sender?: UserSearchResult;
  receiver?: UserSearchResult;
}

// ==================== API RESPONSES ====================
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ==================== FILTER TYPES ====================
export interface TransactionFilters {
  type?: 'send' | 'receive' | 'deposit' | 'withdraw';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_type?: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'request';
  page?: number;
}

export interface MoneyRequestFilters {
  filter?: 'sent' | 'received';
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  page?: number;
}
