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
