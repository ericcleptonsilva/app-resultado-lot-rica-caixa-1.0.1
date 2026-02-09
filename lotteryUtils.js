/**
 * Calculates the number of hits in a game based on the winning numbers.
 *
 * @param {string[]} gameNumbers - The numbers chosen by the user.
 * @param {string[] | undefined} winningNumbers - The official winning numbers.
 * @returns {number} The count of matching numbers.
 */
export const checkHits = (gameNumbers, winningNumbers) => {
  if (!winningNumbers || !Array.isArray(winningNumbers)) return 0;
  if (!gameNumbers || !Array.isArray(gameNumbers)) return 0;
  const hits = gameNumbers.filter(n => winningNumbers.includes(n));
  return hits.length;
};

/**
 * Checks if the number of hits qualifies as a winning game based on the lottery's awards config.
 *
 * @param {number} hits - The number of matching numbers.
 * @param {number[] | undefined} awards - The list of hit counts that qualify for an award.
 * @returns {boolean} True if the game is a winner.
 */
export const isWinningGame = (hits, awards) => {
  if (!awards || !Array.isArray(awards)) return false;
  return awards.includes(hits);
};
