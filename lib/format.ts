export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const len = digits.length;

  if (len === 0) return '';

  let result = '(' + digits.slice(0, 2);
  if (len <= 2) return result;

  result += ') ';
  if (len <= 6) return result + digits.slice(2, 6);
  if (len <= 10) return result + digits.slice(2, 6) + '-' + digits.slice(6);

  // 11 dígitos — celular
  return result + digits.slice(2, 7) + '-' + digits.slice(7);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  delivering: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'Pix',
  other: 'Outro',
};

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  table: 'Mesa',
  pickup: 'Retirada no balcão',
  delivery: 'Entrega',
};
