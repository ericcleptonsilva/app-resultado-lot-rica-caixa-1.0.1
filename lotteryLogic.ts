export const toggleLotteryNumber = (
  currentNumbers: string[],
  numberToToggle: string,
  maxNumbers: number
): string[] => {
  if (currentNumbers.includes(numberToToggle)) {
    return currentNumbers.filter((n) => n !== numberToToggle);
  } else {
    if (currentNumbers.length >= maxNumbers) {
      return currentNumbers;
    }
    return [...currentNumbers, numberToToggle].sort((a, b) => parseInt(a) - parseInt(b));
  }
};
