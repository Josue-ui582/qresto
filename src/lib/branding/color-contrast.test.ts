import { describe, expect, it } from 'vitest';
import { getAccessibleForeground } from './color-contrast';

describe('brand color contrast', () => {
  it('selects a readable foreground for light and dark brand colors', () => {
    expect(getAccessibleForeground('#ffffff')).toBe('#000000');
    expect(getAccessibleForeground('#123456')).toBe('#ffffff');
  });

  it('rejects malformed color values', () => {
    expect(getAccessibleForeground('amber')).toBeNull();
    expect(getAccessibleForeground('#fff')).toBeNull();
  });
});
