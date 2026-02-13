/**
 * Calculates the number of hits in a game based on the winning numbers.
 *
 * @param {string[]} gameNumbers - The numbers chosen by the user.
 * @param {string[] | undefined} winningNumbers - The official winning numbers.
 * @returns {number} The count of matching numbers.
 */
export function checkHits(gameNumbers: string[], winningNumbers: string[] | undefined): number;

/**
 * Checks if the number of hits qualifies as a winning game based on the lottery's awards config.
 *
 * @param {number} hits - The number of matching numbers.
 * @param {number[] | undefined} awards - The list of hit counts that qualify for an award.
 * @returns {boolean} True if the game is a winner.
 */
export function isWinningGame(hits: number, awards: number[] | undefined): boolean;

/**
 * Generates a "smart" pick based on statistical rules (Gail Howard):
 * 1. Sum in the middle 70% range.
 * 2. Balanced Even/Odd (40%-60% even).
 * 3. No sequences of 3+ consecutive numbers.
 *
 * @param {number} totalBalls - Total number of balls in the lottery (e.g., 60).
 * @param {number} betLength - Number of balls to pick (e.g., 6).
 * @returns {string[]} An array of sorted strings representing the numbers.
 */
export function generateSmartPick(totalBalls: number, betLength: number): string[];
