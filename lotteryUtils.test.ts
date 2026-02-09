import { describe, it, expect } from 'vitest';
import { generateRandomNumbers, LotteryConfig } from './lotteryUtils';

describe('generateRandomNumbers', () => {
  const baseConfig: LotteryConfig = {
    name: 'Test Lottery',
    color: '#000000',
    balls: 10,
    draw: 5,
    betLength: 5,
    awards: [3, 4, 5],
  };

  it('should generate correct amount of needed numbers', () => {
    const selected = ['01', '02'];
    const result = generateRandomNumbers(baseConfig, selected);
    expect(result).toHaveLength(3);
    const combined = [...selected, ...result];
    expect(combined).toHaveLength(5);
  });

  it('should return empty array if no numbers needed', () => {
    const selected = ['01', '02', '03', '04', '05'];
    const result = generateRandomNumbers(baseConfig, selected);
    expect(result).toEqual([]);
  });

  it('should return empty array if current selection exceeds betLength', () => {
    const selected = ['01', '02', '03', '04', '05', '06'];
    const result = generateRandomNumbers(baseConfig, selected);
    expect(result).toEqual([]);
  });

  it('should not generate duplicates with existing selection', () => {
    // If balls=5 and betLength=5, and we have 3 selected,
    // it MUST pick the remaining 2.
    const config: LotteryConfig = {
        ...baseConfig,
        balls: 5,
        betLength: 5,
        draw: 5
    };
    const selected = ['01', '02', '03'];
    const result = generateRandomNumbers(config, selected);

    expect(result).toHaveLength(2);
    // Since available are 01,02,03,04,05 and 01-03 are selected,
    // result MUST be 04 and 05 (order may vary)
    expect(result).toContain('04');
    expect(result).toContain('05');

    result.forEach(num => {
      expect(selected).not.toContain(num);
    });
  });

  it('should handle startZero: true (00-99)', () => {
    // startZero usually implies range 00-99 (Lotomania style)
    const config: LotteryConfig = {
      ...baseConfig,
      startZero: true,
      balls: 100,
      betLength: 20,
      draw: 20
    };
    const result = generateRandomNumbers(config, []);

    expect(result).toHaveLength(20);
    result.forEach(num => {
      const n = parseInt(num);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(99);
      // Ensure '00' is possible if it's in range (0 is '00')
      if (n === 0) expect(num).toBe('00');
    });
  });

  it('should handle startZero: false (01-balls)', () => {
    const config: LotteryConfig = {
      ...baseConfig,
      startZero: false,
      balls: 10,
      betLength: 5,
      draw: 5
    };
    const result = generateRandomNumbers(config, []);

    expect(result).toHaveLength(5);
    result.forEach(num => {
      const n = parseInt(num);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
      expect(num).not.toBe('00');
    });
  });

  it('should generate unique numbers within the result', () => {
     // Generate many numbers to increase chance of collision if logic was wrong
     const config: LotteryConfig = {
         ...baseConfig,
         balls: 50,
         betLength: 50,
         draw: 50
     };
     const result = generateRandomNumbers(config, []);
     const unique = new Set(result);
     expect(unique.size).toBe(result.length);
     expect(result.length).toBe(50);
  });
});
