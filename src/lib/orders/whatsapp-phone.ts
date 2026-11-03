export const WHATSAPP_PHONE_COUNTRIES = [
  { name: 'Bénin', callingCode: '+229' },
  { name: 'Burkina Faso', callingCode: '+226' },
  { name: 'Cameroun', callingCode: '+237' },
  { name: 'Côte d’Ivoire', callingCode: '+225' },
  { name: 'France', callingCode: '+33' },
  { name: 'Gabon', callingCode: '+241' },
  { name: 'Ghana', callingCode: '+233' },
  { name: 'Guinée', callingCode: '+224' },
  { name: 'Mali', callingCode: '+223' },
  { name: 'Niger', callingCode: '+227' },
  { name: 'Nigeria', callingCode: '+234' },
  { name: 'Sénégal', callingCode: '+221' },
  { name: 'Togo', callingCode: '+228' },
] as const;

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizeWhatsappPhone(
  input: string,
  callingCode: string
): string | null {
  const trimmedInput = input.trim();
  if (!trimmedInput) return null;

  const digits = trimmedInput.replace(/\D/g, '');
  const normalized = trimmedInput.startsWith('+')
    ? `+${digits}`
    : `${callingCode}${digits.replace(/^0+/, '')}`;

  return E164_PATTERN.test(normalized) ? normalized : null;
}
