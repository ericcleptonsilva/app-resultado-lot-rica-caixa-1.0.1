import { describe, it, expect } from 'vitest';
import { toggleLotteryNumber } from './lotteryLogic';

describe('toggleLotteryNumber', () => {
  it('should add a number to an empty list', () => {
    const current = [];
    const result = toggleLotteryNumber(current, '05', 6);
    expect(result).toEqual(['05']);
  });

  it('should add a number to a list that is not full', () => {
    const current = ['01', '03'];
    const result = toggleLotteryNumber(current, '02', 6);
    expect(result).toEqual(['01', '02', '03']); // Should be sorted
  });

  it('should remove a number if it is already in the list', () => {
    const current = ['01', '02', '03'];
    const result = toggleLotteryNumber(current, '02', 6);
    expect(result).toEqual(['01', '03']);
  });

  it('should not add a number if the list is full', () => {
    const current = ['01', '02', '03', '04', '05', '06'];
    const result = toggleLotteryNumber(current, '07', 6);
    expect(result).toEqual(current);
  });

  it('should sort numbers numerically', () => {
    const current = ['10', '02'];
    const result = toggleLotteryNumber(current, '05', 6);
    expect(result).toEqual(['02', '05', '10']);
  });

  it('should handle string numbers correctly during sort', () => {
    const current = ['100', '2'];
    const result = toggleLotteryNumber(current, '10', 5);
    // '100', '2', '10' sorted numerically -> '2', '10', '100'
    // Note: The implementation uses parseInt(a) - parseInt(b)
    expect(result).toEqual(['2', '10', '100']);
  });
});
