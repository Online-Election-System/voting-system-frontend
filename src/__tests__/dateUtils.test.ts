import { simpleDateToDate, dateToSimpleDate, formatSimpleDate } from '../app/election-commission/elections/utils/date-utils';

describe('date-utils helper functions', () => {
  describe('simpleDateToDate', () => {
    it('converts valid SimpleDate to Date', () => {
      const jsDate = simpleDateToDate({ year: 2024, month: 2, day: 29 });
      expect(jsDate).toBeInstanceOf(Date);
      expect(jsDate?.getFullYear()).toBe(2024);
      expect(jsDate?.getMonth()).toBe(1); // Feb is index 1
      expect(jsDate?.getDate()).toBe(29);
    });

    it('returns undefined for invalid input', () => {
      expect(simpleDateToDate(undefined)).toBeUndefined();
      expect(simpleDateToDate({ year: '2024' } as any)).toBeUndefined();
    });
  });

  describe('dateToSimpleDate', () => {
    it('converts Date to SimpleDate', () => {
      const simple = dateToSimpleDate(new Date(2025, 0, 1)); // Jan 1 2025
      expect(simple).toEqual({ year: 2025, month: 1, day: 1 });
    });

    it('returns undefined for invalid Date', () => {
      // Invalid date
      expect(dateToSimpleDate(new Date('invalid'))).toBeUndefined();
      expect(dateToSimpleDate(undefined)).toBeUndefined();
    });
  });

  describe('formatSimpleDate', () => {
    it('formats valid SimpleDate', () => {
      expect(formatSimpleDate({ year: 2030, month: 12, day: 25 })).toBe('25/12/2030');
    });

    it('handles undefined or malformed inputs', () => {
      expect(formatSimpleDate()).toBe('Date not set');
      expect(formatSimpleDate({} as any)).toBe('Date not set');
    });
  });
});
