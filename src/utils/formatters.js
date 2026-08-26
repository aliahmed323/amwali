export function formatMoney(amount) {
  if (amount == null || isNaN(amount)) return '0 د.ع';
  return new Intl.NumberFormat('en-US').format(Math.round(amount)) + ' د.ع';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
}
