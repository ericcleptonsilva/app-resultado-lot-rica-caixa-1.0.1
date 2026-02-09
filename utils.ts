// Helper function to get cryptographically secure random integer in range [min, max]
export function getRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('Min cannot be greater than Max');
  }

  const range = max - min + 1;
  const maxUint32 = 0xFFFFFFFF;
  // Calculate the largest multiple of range less than or equal to maxUint32
  // This is used for rejection sampling to avoid modulo bias
  const limit = maxUint32 - (maxUint32 % range);
  const buffer = new Uint32Array(1);

  let randomValue;
  do {
    crypto.getRandomValues(buffer);
    randomValue = buffer[0];
  } while (randomValue >= limit);

  return min + (randomValue % range);
}

// Fisher-Yates Shuffle using secure random number generator
export function secureShuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
