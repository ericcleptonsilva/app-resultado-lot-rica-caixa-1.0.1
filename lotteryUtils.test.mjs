import test from 'node:test';
import assert from 'node:assert';
import { checkHits, isWinningGame } from './lotteryUtils.js';

test('checkHits - calculates correct number of hits', (t) => {
  // --- Standard Scenarios ---
  // Case 1: Some matches
  assert.strictEqual(checkHits(['01', '02', '03'], ['01', '03', '05']), 2, 'Should count 2 hits');

  // Case 2: No matches
  assert.strictEqual(checkHits(['01', '02'], ['03', '04']), 0, 'Should count 0 hits');

  // Case 3: All matches
  assert.strictEqual(checkHits(['10', '20'], ['10', '20', '30']), 2, 'Should count 2 hits (subset match)');

  // Case 4: Full match
  assert.strictEqual(checkHits(['10', '20', '30'], ['10', '20', '30']), 3, 'Should count 3 hits (full match)');

  // --- Edge Cases ---
  // Case 5: Empty game
  assert.strictEqual(checkHits([], ['01', '02']), 0, 'Empty game should yield 0 hits');

  // Case 6: Empty winning numbers
  assert.strictEqual(checkHits(['01', '02'], []), 0, 'Empty winning numbers should yield 0 hits');

  // Case 7: Undefined winning numbers
  assert.strictEqual(checkHits(['01', '02'], undefined), 0, 'Undefined winning numbers should yield 0 hits');

  // Case 8: Null winning numbers
  assert.strictEqual(checkHits(['01', '02'], null), 0, 'Null winning numbers should yield 0 hits');

  // Case 9: Undefined game numbers
  assert.strictEqual(checkHits(undefined, ['01', '02']), 0, 'Undefined game numbers should yield 0 hits');

  // Case 10: Null game numbers
  assert.strictEqual(checkHits(null, ['01', '02']), 0, 'Null game numbers should yield 0 hits');

  // Case 11: Non-array inputs (Robustness check)
  assert.strictEqual(checkHits('not-array', ['01']), 0, 'String game input should yield 0 hits');
  assert.strictEqual(checkHits(['01'], 'not-array'), 0, 'String winning input should yield 0 hits');
  assert.strictEqual(checkHits(123, ['01']), 0, 'Number game input should yield 0 hits');
  assert.strictEqual(checkHits(['01'], 123), 0, 'Number winning input should yield 0 hits');
  assert.strictEqual(checkHits({}, ['01']), 0, 'Object game input should yield 0 hits');

  // Case 12: Duplicate numbers in input (Documenting behavior: duplicates are counted)
  // If game is ['01', '01'] and winning is ['01'], current implementation yields 2 hits.
  // This test ensures we are aware of this behavior.
  assert.strictEqual(checkHits(['01', '01'], ['01', '02']), 2, 'Duplicate inputs are currently counted multiple times');

  // Case 13: Type mismatch (string vs number)
  // Input numbers as strings vs winning numbers as numbers. Strict equality fails.
  // This is expected behavior in JS/TS without coercion.
  assert.strictEqual(checkHits(['1', '2'], [1, 2]), 0, 'String vs Number mismatch results in 0 hits');

  // Case 14: Polymorphism (Number vs Number)
  // Verify that the function works correctly if inputs are numbers (not just strings).
  assert.strictEqual(checkHits([1, 2, 3], [1, 3, 5]), 2, 'Number vs Number match should work correctly');

  // Case 15: Mixed types in input arrays
  // Verify behavior with mixed types.
  assert.strictEqual(checkHits(['1', 2, '3'], [1, '2', '3']), 1, 'Mixed types: "3" matches "3". 2 (number) does not match "2" (string).');
});

test('checkHits - Performance / Large Arrays', (t) => {
  // Simulating Lotomania extreme case (50 bets vs 20 draws) repeated many times
  const gameNumbers = Array.from({ length: 50 }, (_, i) => i.toString());
  const winningNumbers = Array.from({ length: 20 }, (_, i) => (i * 2).toString()); // evens match

  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    checkHits(gameNumbers, winningNumbers);
  }
  const end = performance.now();

  // Just ensure it doesn't crash or take absurdly long (e.g. > 1s for 10k checks is fine, usually < 50ms)
  assert.ok((end - start) < 1000, 'Performance check: 10k iterations took less than 1s');
});

test('isWinningGame - verifies winning condition based on awards', (t) => {
  const standardAwards = [4, 5, 6]; // Typical Mega-Sena
  const lotomaniaAwards = [15, 16, 17, 18, 19, 20, 0]; // Lotomania (0 hits wins)

  const scenarios = [
    // Standard Lottery (Mega-Sena)
    { hits: 4, awards: standardAwards, expected: true, desc: '4 hits in Mega-Sena (winner)' },
    { hits: 5, awards: standardAwards, expected: true, desc: '5 hits in Mega-Sena (winner)' },
    { hits: 6, awards: standardAwards, expected: true, desc: '6 hits in Mega-Sena (winner)' },
    { hits: 3, awards: standardAwards, expected: false, desc: '3 hits in Mega-Sena (loser)' },
    { hits: 0, awards: standardAwards, expected: false, desc: '0 hits in Mega-Sena (loser)' },

    // Lotomania (Zero hits wins)
    { hits: 0, awards: lotomaniaAwards, expected: true, desc: '0 hits in Lotomania (winner)' },
    { hits: 15, awards: lotomaniaAwards, expected: true, desc: '15 hits in Lotomania (winner)' },
    { hits: 14, awards: lotomaniaAwards, expected: false, desc: '14 hits in Lotomania (loser)' },

    // Edge Cases
    { hits: -1, awards: standardAwards, expected: false, desc: 'Negative hits (impossible but handled)' },
    { hits: 100, awards: standardAwards, expected: false, desc: 'Excessive hits (handled)' },
    { hits: 4.5, awards: standardAwards, expected: false, desc: 'Float hits (handled)' },

    // Config Issues
    { hits: 4, awards: [], expected: false, desc: 'Empty awards list' },
    { hits: 4, awards: undefined, expected: false, desc: 'Undefined awards list' },
    { hits: 4, awards: null, expected: false, desc: 'Null awards list' },
    { hits: 4, awards: 'not-array', expected: false, desc: 'Invalid awards type' },
  ];

  scenarios.forEach(({ hits, awards, expected, desc }) => {
    assert.strictEqual(isWinningGame(hits, awards), expected, desc);
  });
});

test('Real-world Lottery Configurations', (t) => {
  // Configurations mirrored from index.tsx
  const configs = {
    megasena: { awards: [4, 5, 6] },
    lotofacil: { awards: [11, 12, 13, 14, 15] },
    quina: { awards: [2, 3, 4, 5] },
    lotomania: { awards: [15, 16, 17, 18, 19, 20, 0] },
    timemania: { awards: [3, 4, 5, 6, 7] },
    diadesorte: { awards: [4, 5, 6, 7] },
  };

  // Verify key scenarios for each
  // Mega-Sena
  assert.strictEqual(isWinningGame(6, configs.megasena.awards), true, 'Mega-Sena: 6 hits wins');
  assert.strictEqual(isWinningGame(3, configs.megasena.awards), false, 'Mega-Sena: 3 hits loses');

  // Lotofácil
  assert.strictEqual(isWinningGame(15, configs.lotofacil.awards), true, 'Lotofácil: 15 hits wins');
  assert.strictEqual(isWinningGame(11, configs.lotofacil.awards), true, 'Lotofácil: 11 hits wins');
  assert.strictEqual(isWinningGame(10, configs.lotofacil.awards), false, 'Lotofácil: 10 hits loses');

  // Quina
  assert.strictEqual(isWinningGame(5, configs.quina.awards), true, 'Quina: 5 hits wins');
  assert.strictEqual(isWinningGame(2, configs.quina.awards), true, 'Quina: 2 hits wins');
  assert.strictEqual(isWinningGame(1, configs.quina.awards), false, 'Quina: 1 hits loses');

  // Lotomania
  assert.strictEqual(isWinningGame(20, configs.lotomania.awards), true, 'Lotomania: 20 hits wins');
  assert.strictEqual(isWinningGame(0, configs.lotomania.awards), true, 'Lotomania: 0 hits wins');
  assert.strictEqual(isWinningGame(14, configs.lotomania.awards), false, 'Lotomania: 14 hits loses');

  // Timemania
  assert.strictEqual(isWinningGame(7, configs.timemania.awards), true, 'Timemania: 7 hits wins');
  assert.strictEqual(isWinningGame(3, configs.timemania.awards), true, 'Timemania: 3 hits wins');
  assert.strictEqual(isWinningGame(2, configs.timemania.awards), false, 'Timemania: 2 hits loses');

  // Dia de Sorte
  assert.strictEqual(isWinningGame(7, configs.diadesorte.awards), true, 'Dia de Sorte: 7 hits wins');
  assert.strictEqual(isWinningGame(4, configs.diadesorte.awards), true, 'Dia de Sorte: 4 hits wins');
  assert.strictEqual(isWinningGame(3, configs.diadesorte.awards), false, 'Dia de Sorte: 3 hits loses');
});
