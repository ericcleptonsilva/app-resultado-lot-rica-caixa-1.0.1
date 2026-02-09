import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from './index';

// Mock fetch to avoid network requests
global.fetch = vi.fn();

// Mock window.alert
window.alert = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock successful fetch response for initial load
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        numero: 2500,
        dataApuracao: '01/01/2023',
        listaDezenas: ['01', '02', '03', '04', '05', '06'],
        acumulado: true,
        proximoConcurso: 2501,
        dataProximoConcurso: '05/01/2023',
        valorEstimadoProximoConcurso: 10000000
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows alert when trying to save game with insufficient numbers', async () => {
    render(<App />);

    // Switch to "Meus Jogos" tab
    const gamesTab = screen.getByRole('button', { name: /Meus Jogos/i });
    fireEvent.click(gamesTab);

    // Wait for the games section to be visible
    await waitFor(() => {
      expect(screen.getByText('Faça seu Jogo')).toBeInTheDocument();
    });

    // Select fewer numbers than required (Mega-Sena requires 6)
    // Find balls in the selection grid. They are clickable divs with numbers.
    // Since we are in the games tab, we can find them by text.
    // Use getAllByText because balls might appear in result card too if rendered
    const ball1 = screen.getAllByText('01').find(el => el.tagName === 'DIV' && el.innerHTML === '01');
    const ball2 = screen.getAllByText('02').find(el => el.tagName === 'DIV' && el.innerHTML === '02');

    if (ball1) fireEvent.click(ball1);
    if (ball2) fireEvent.click(ball2);

    // Click "Salvar" button
    const saveButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveButton);

    // Verify alert was called
    expect(window.alert).toHaveBeenCalledWith('Para Mega-Sena, selecione exatamente 6 números.');
  });

  it('adds a new game when correct number of balls are selected', async () => {
    render(<App />);

    // Switch to "Meus Jogos" tab
    const gamesTab = screen.getByRole('button', { name: /Meus Jogos/i });
    fireEvent.click(gamesTab);

    // Wait for games section
    await waitFor(() => {
      expect(screen.getByText('Faça seu Jogo')).toBeInTheDocument();
    });

    // Select 6 numbers for Mega-Sena
    const numbersToSelect = ['01', '02', '03', '04', '05', '06'];

    for (const num of numbersToSelect) {
      // Find the ball div in the grid.
      // We look for divs with the number as text.
      const balls = screen.getAllByText(num).filter(el => el.tagName === 'DIV' && el.innerHTML === num);
      // The clickable one should be the one in the grid.
      // Assuming only one such div is present initially or just click the first one found.
      if (balls.length > 0) {
        fireEvent.click(balls[0]);
      }
    }

    // Verify count updated
    expect(screen.getByText('6 / 6')).toBeInTheDocument();

    // Click "Salvar"
    const saveButton = screen.getByRole('button', { name: /Salvar/i });
    fireEvent.click(saveButton);

    // Verify game is added
    // "Meus Jogos Salvos" section should now contain the game
    await waitFor(() => {
      expect(screen.getAllByText(/Jogo #/).length).toBeGreaterThan(0);
    });

    // Verify balls are deselected (count resets to 0/6)
    expect(screen.getByText('0 / 6')).toBeInTheDocument();

    // Verify alert was NOT called
    expect(window.alert).not.toHaveBeenCalled();
  });
});
