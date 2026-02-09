import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock fetch
global.fetch = vi.fn();

const mockMegaSenaResult = {
  numero: 2600,
  dataApuracao: "01/01/2023",
  listaDezenas: ["01", "02", "03", "04", "05", "06"],
  acumulado: true,
  proximoConcurso: 2601,
  dataProximoConcurso: "04/01/2023",
  valorEstimadoProximoConcurso: 10000000
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for fetch
    (global.fetch as any).mockImplementation((url: any) => {
        const urlStr = url.toString();
        if (urlStr.includes('/api/megasena')) {
            return Promise.resolve({
                ok: true,
                json: async () => mockMegaSenaResult,
            });
        }
        return Promise.resolve({
            ok: false,
            status: 404,
        });
    });
  });

  it('renders without crashing and shows initial lottery', async () => {
    render(<App />);
    expect(screen.getByText('Loterias & IA')).toBeInTheDocument();

    // Wait for data load to avoid act warnings
    await waitFor(() => {
        expect(screen.getByText('CONCURSO 2600')).toBeInTheDocument();
    });

    // Use getAllByText because "Mega-Sena" appears in the select option and potentially elsewhere
    const options = screen.getAllByText('Mega-Sena');
    expect(options.length).toBeGreaterThan(0);
  });

  it('fetches and displays lottery results', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('CONCURSO 2600')).toBeInTheDocument();
    });

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('06')).toBeInTheDocument();
    expect(screen.getByText('ACUMULOU!')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(<App />);

    // Initial tab is Results
    await waitFor(() => {
        expect(screen.getByText('CONCURSO 2600')).toBeInTheDocument();
    });

    // Switch to My Games
    const gamesTab = screen.getByText('Meus Jogos');
    fireEvent.click(gamesTab);

    expect(screen.getByText('Faça seu Jogo')).toBeInTheDocument();
    expect(screen.queryByText('CONCURSO 2600')).not.toBeInTheDocument();

    // Switch to Stats
    const statsTab = screen.getByText('Estatísticas');

    // Mock stats fetch (it fetches previous contests)
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ listaDezenas: ["10", "20", "30", "40", "50", "60"] })
    });

    fireEvent.click(statsTab);

    expect(screen.getByText('Números Quentes 🔥')).toBeInTheDocument();
  });

  it('allows selecting numbers and saving a game', async () => {
     render(<App />);

     // Wait for initial load
     await waitFor(() => {
        expect(screen.getByText('CONCURSO 2600')).toBeInTheDocument();
     });

     // Switch to My Games
     fireEvent.click(screen.getByText('Meus Jogos'));

     // Verify we are in the game tab
     expect(screen.getByText('Faça seu Jogo')).toBeInTheDocument();

     // Select 6 numbers (Mega-Sena defaults)
     // Note: Since '01' is also in the result (if displayed), we need to be careful.
     // But in 'games' tab, result card is hidden.
     // However, `renderGamesTab` renders grid numbers.

     const numbersToSelect = ['01', '02', '03', '04', '05', '06'];

     numbersToSelect.forEach(num => {
         const element = screen.getByText(num);
         fireEvent.click(element);
     });

     // Click Save
     // There is a 'Salvar' button.
     const saveButton = screen.getByText('Salvar');
     fireEvent.click(saveButton);

     // Check if game appears in list
     // The game list shows "Jogo #..."
     await waitFor(() => {
         expect(screen.getAllByText(/Jogo #/i).length).toBeGreaterThan(0);
     });

     // Since we selected the winning numbers (01-06) and the result is mocked as winning (01-06),
     // we should see "6 acertos" and "PREMIADO"
     // "6 acertos" appears in the game card and in the summary box
     expect(screen.getAllByText('6 acertos').length).toBeGreaterThan(0);
     expect(screen.getByText('PREMIADO')).toBeInTheDocument();
  });
});
