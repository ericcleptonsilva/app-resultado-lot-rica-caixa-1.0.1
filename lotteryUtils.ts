export interface LotteryConfig {
  name: string;
  color: string;
  balls: number;
  draw: number;
  betLength: number;
  awards: number[];
  startZero?: boolean;
  textColor?: string;
}

export function generateRandomNumbers(config: LotteryConfig, selectedNumbers: string[]): string[] {
  const needed = config.betLength - selectedNumbers.length;
  if (needed <= 0) return [];

  const available = [];
  // Gerar range disponível
  const start = config.startZero ? 0 : 1;
  const end = config.startZero ? 99 : config.balls;

  for (let i = start; i <= end; i++) {
    const numStr = i.toString().padStart(2, '0');
    if (!selectedNumbers.includes(numStr)) {
      available.push(numStr);
    }
  }

  // Embaralhar e pegar os necessários
  const shuffled = available.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, needed);
}
