/**
 * Kempaga — Funções utilitárias
 */

/**
 * Formata um valor numérico como moeda AOA
 * @example formatCurrency('145500.00') => '145.500,00'
 * @example formatCurrency(145500) => '145.500,00'
 */
export const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0,00';
  
  return num.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formata data ISO para formato legível
 * @example formatDate('2026-04-03T10:30:00.000000Z') => 'Hoje, 10:30'
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('pt-AO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Hoje, ${timeStr}`;
  if (diffDays === 1) return `Ontem, ${timeStr}`;
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Retorna a saudação com base na hora do dia
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

/**
 * Obtém as iniciais do nome completo
 * @example getInitials('Pedro Manuel') => 'PM'
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Extrai mensagem de erro da resposta da API
 */
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstField = Object.keys(errors)[0];
    return errors[firstField][0];
  }
  if (error?.message) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
};
