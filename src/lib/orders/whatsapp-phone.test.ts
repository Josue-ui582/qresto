import { describe, expect, it } from 'vitest';
import { normalizeWhatsappPhone, whatsappLinkDigits } from './whatsapp-phone';

describe('normalizeWhatsappPhone', () => {
  it('normalizes a local Beninese number to E.164', () => {
    expect(normalizeWhatsappPhone('97 00 11 22', '+229')).toBe('+22997001122');
  });

  describe('whatsappLinkDigits', () => {
    it('prepares local and international restaurant phones for wa.me', () => {
      expect(whatsappLinkDigits('97 00 11 22')).toBe('22997001122');
      expect(whatsappLinkDigits('+229 97 00 11 22')).toBe('22997001122');
      expect(whatsappLinkDigits('22997001122')).toBe('22997001122');
    });

    it('returns null when the restaurant phone is not a valid contact number', () => {
      expect(whatsappLinkDigits(null)).toBeNull();
      expect(whatsappLinkDigits('123')).toBeNull();
    });
  });

  it('removes a local trunk prefix before adding the country calling code', () => {
    expect(normalizeWhatsappPhone('097001122', '+229')).toBe('+22997001122');
  });

  it('preserves a valid international number entered with a plus sign', () => {
    expect(normalizeWhatsappPhone('+33 6 12 34 56 78', '+229')).toBe('+33612345678');
  });

  it('rejects numbers outside E.164 length and format constraints', () => {
    expect(normalizeWhatsappPhone('123', '+229')).toBeNull();
    expect(normalizeWhatsappPhone('+00012345678', '+229')).toBeNull();
    expect(normalizeWhatsappPhone('+1234567890123456', '+229')).toBeNull();
  });
});
