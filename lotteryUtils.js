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
export const generateSmartPick = (totalBalls, betLength) => {
  const maxAttempts = 1000;
  let attempts = 0;

  // Calculate sum range (middle 70%)
  // Min possible sum: 1+2+...+k
  const minSum = (betLength * (betLength + 1)) / 2;
  // Max possible sum: (n) + (n-1) + ... + (n-k+1)
  const maxSum = (betLength * (2 * totalBalls - betLength + 1)) / 2;
  const range = maxSum - minSum;
  const lowerBound = minSum + range * 0.15;
  const upperBound = maxSum - range * 0.15;

  while (attempts < maxAttempts) {
    attempts++;
    const pick = [];
    const available = Array.from({ length: totalBalls }, (_, i) => i + 1);

    // Random selection
    for (let i = 0; i < betLength; i++) {
      const idx = Math.floor(Math.random() * available.length);
      pick.push(available[idx]);
      available.splice(idx, 1);
    }
    pick.sort((a, b) => a - b);

    // 1. Check Sum
    const sum = pick.reduce((acc, curr) => acc + curr, 0);
    if (sum < lowerBound || sum > upperBound) continue;

    // 2. Check Even/Odd Balance (30% - 70%)
    // Allows 2, 3, 4 evens for 6 numbers (0.33, 0.5, 0.66)
    const evens = pick.filter(n => n % 2 === 0).length;
    const evenRatio = evens / betLength;
    if (evenRatio < 0.3 || evenRatio > 0.7) continue;

    // 3. Check Sequences (avoid 3 consecutive)
    let hasSequence = false;
    for (let i = 0; i < pick.length - 2; i++) {
      if (pick[i+1] === pick[i] + 1 && pick[i+2] === pick[i] + 2) {
        hasSequence = true;
        break;
      }
    }
    if (hasSequence) continue;

    // Success! Return padded strings
    return pick.map(n => n.toString().padStart(2, '0'));
  }

  // Fallback to simple random if failing
  const fallback = [];
  const availableFallback = Array.from({ length: totalBalls }, (_, i) => i + 1);
  for (let i = 0; i < betLength; i++) {
    const idx = Math.floor(Math.random() * availableFallback.length);
    fallback.push(availableFallback[idx]);
    availableFallback.splice(idx, 1);
  }
  return fallback.sort((a, b) => a - b).map(n => n.toString().padStart(2, '0'));
};
