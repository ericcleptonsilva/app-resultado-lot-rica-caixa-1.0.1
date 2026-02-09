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

export const LOTTERIES: Record<string, LotteryConfig> = {
  megasena: { name: "Mega-Sena", color: "#209869", balls: 60, draw: 6, betLength: 6, awards: [4, 5, 6] },
  lotofacil: { name: "Lotofácil", color: "#930089", balls: 25, draw: 15, betLength: 15, awards: [11, 12, 13, 14, 15] },
  quina: { name: "Quina", color: "#260085", balls: 80, draw: 5, betLength: 5, awards: [2, 3, 4, 5] },
  lotomania: { name: "Lotomania", color: "#f78100", balls: 100, draw: 20, betLength: 50, startZero: true, awards: [15, 16, 17, 18, 19, 20, 0] },
  timemania: { name: "Timemania", color: "#00ff04", textColor: "#333", balls: 80, draw: 7, betLength: 10, awards: [3, 4, 5, 6, 7] },
  diadesorte: { name: "Dia de Sorte", color: "#cb852b", balls: 31, draw: 7, betLength: 7, awards: [4, 5, 6, 7] },
};
