import test from 'node:test';
import assert from 'node:assert';
import { checkHits, isWinningGame } from './lotteryUtils.js';

test('checkHits - calculates correct number of hits', () => {
  // Case: Some matches
  assert.strictEqual(checkHits(['01', '02', '03'], ['01', '03', '05']), 2);

  // Case: No matches
  assert.strictEqual(checkHits(['01', '02'], ['03', '04']), 0);

  // Case: All matches
  assert.strictEqual(checkHits(['10', '20'], ['10', '20', '30']), 2);

  // Case: Empty game
  assert.strictEqual(checkHits([], ['01', '02']), 0);

  // Case: Empty winning numbers
  assert.strictEqual(checkHits(['01', '02'], []), 0);

  // Case: Undefined winning numbers
  assert.strictEqual(checkHits(['01', '02'], undefined), 0);

  // Case: Null winning numbers
  assert.strictEqual(checkHits(['01', '02'], null), 0);
});

test('isWinningGame - correctly identifies winning hits', () => {
  const awards = [4, 5, 6]; // Typical Mega-Sena awards

  // Case: Winner with 4 hits
  assert.strictEqual(isWinningGame(4, awards), true);

  // Case: Winner with 6 hits
  assert.strictEqual(isWinningGame(6, awards), true);

  // Case: Not a winner with 3 hits
  assert.strictEqual(isWinningGame(3, awards), false);

  // Case: Not a winner with 0 hits
  assert.strictEqual(isWinningGame(0, awards), false);

  // Case: Empty awards
  assert.strictEqual(isWinningGame(4, []), false);

  // Case: Undefined awards
  assert.strictEqual(isWinningGame(4, undefined), false);

  // Case: Lotomania edge case (0 hits can be a winner)
  assert.strictEqual(isWinningGame(0, [15, 16, 17, 18, 19, 20, 0]), true);
});
