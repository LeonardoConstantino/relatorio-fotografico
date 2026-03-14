/**
 * Utilitários para sanitização e segurança de strings
 */

/**
 * Escapa caracteres HTML para prevenir XSS e quebras de layout
 * Converte <, >, &, ", ' em entidades seguras
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

/**
 * Atalho para template literals seguras (Opcional)
 * Uso: safe`${userContent}`
 */
export function safe(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((prev, curr, i) => {
    const value = values[i];
    const sanitizedValue = Array.isArray(value)
      ? value.join('')
      : escapeHTML(String(value ?? ''));
    return prev + curr + sanitizedValue;
  }, '');
}
