import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { checkHits, isWinningGame } from "./lotteryUtils";
// --- Configurações ---

interface LotteryConfig {
  name: string;
  color: string;
  balls: number;
  draw: number;
  betLength: number;
  awards: number[];
  startZero?: boolean;
  textColor?: string;
}

const LOTTERIES: Record<string, LotteryConfig> = {
  megasena: { name: "Mega-Sena", color: "#209869", balls: 60, draw: 6, betLength: 6, awards: [4, 5, 6] },
  lotofacil: { name: "Lotofácil", color: "#930089", balls: 25, draw: 15, betLength: 15, awards: [11, 12, 13, 14, 15] },
  quina: { name: "Quina", color: "#260085", balls: 80, draw: 5, betLength: 5, awards: [2, 3, 4, 5] },
  lotomania: { name: "Lotomania", color: "#f78100", balls: 100, draw: 20, betLength: 50, startZero: true, awards: [15, 16, 17, 18, 19, 20, 0] },
  timemania: { name: "Timemania", color: "#00ff04", textColor: "#333", balls: 80, draw: 7, betLength: 10, awards: [3, 4, 5, 6, 7] },
  diadesorte: { name: "Dia de Sorte", color: "#cb852b", balls: 31, draw: 7, betLength: 7, awards: [4, 5, 6, 7] },
};

const CAIXA_API_BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

// --- Estilos ---

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    minHeight: "100vh",
    backgroundColor: "#fff",
    boxShadow: "0 0 20px rgba(0,0,0,0.05)",
    paddingBottom: "80px", // Aumentado para não cobrir o anúncio fixo
  },
  header: (color: string) => ({
    backgroundColor: color,
    padding: "25px 20px",
    color: "white",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
    transition: "background-color 0.3s ease",
    textAlign: "center" as const,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  }),
  title: {
    margin: "0 0 15px 0",
    fontSize: "28px",
    fontWeight: "800",
  },
  select: {
    padding: "12px 20px",
    borderRadius: "30px",
    border: "none",
    fontSize: "16px",
    width: "100%",
    maxWidth: "320px",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#333",
    outline: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  tabBar: {
    display: "flex",
    justifyContent: "space-evenly",
    padding: "15px 10px",
    backgroundColor: "white",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid #f0f0f0",
  },
  tab: (active: boolean, color: string) => ({
    padding: "10px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    backgroundColor: active ? `${color}15` : "transparent",
    color: active ? color : "#888",
    fontWeight: active ? "700" : "500",
    border: "none",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    fontSize: "12px",
    gap: "4px",
  }),
  icon: {
    fontSize: "24px",
    marginBottom: "2px",
  },
  content: {
    padding: "20px",
    animation: "fadeIn 0.5s ease",
  },
  ball: (color: string, isMatch = false, isMiss = false, size = "40px") => ({
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: isMatch ? color : isMiss ? "#f0f0f0" : color,
    color: isMatch ? "white" : isMiss ? "#ccc" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    margin: "4px",
    fontSize: parseInt(size) * 0.4 + "px",
    boxShadow: isMiss ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
    border: isMatch ? "3px solid #FFD700" : "none",
    transform: isMatch ? "scale(1.1)" : "scale(1)",
    transition: "transform 0.2s",
  }),
  selectableBall: (selected: boolean, color: string) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: selected ? `2px solid ${color}` : "1px solid #e0e0e0",
    backgroundColor: selected ? color : "white",
    color: selected ? "white" : "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    margin: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    userSelect: "none" as const,
    boxShadow: selected ? `0 3px 8px ${color}60` : "none",
    padding: 0,
    appearance: "none" as const,
  }),
  ballsContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "20px",
    border: "1px solid #f5f5f5",
  },
  winnerCard: (color: string) => ({
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: `0 4px 15px ${color}40`,
    marginBottom: "20px",
    border: `2px solid ${color}`,
    position: "relative" as const,
  }),
  button: (color: string, disabled = false, outline = false) => ({
    backgroundColor: disabled ? "#ccc" : outline ? "transparent" : color,
    color: disabled ? "white" : outline ? color : "white",
    border: outline ? `2px solid ${color}` : "none",
    padding: "12px 20px",
    borderRadius: "12px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flex: 1,
    boxShadow: (disabled || outline) ? "none" : "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.1s active",
  }),
  statItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  statLabel: {
    width: "30px",
    fontWeight: "bold" as const,
    color: "#555",
  },
  statBarBg: {
    flex: 1,
    height: "10px",
    backgroundColor: "#eee",
    borderRadius: "5px",
    margin: "0 10px",
    overflow: "hidden",
  },
  statBarFill: (percentage: number, color: string) => ({
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: color,
    borderRadius: "5px",
  }),
  statValue: {
    width: "40px",
    textAlign: "right" as const,
    fontSize: "12px",
    color: "#888",
  },
  badge: {
    backgroundColor: "#eee",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#666",
    marginTop: "10px",
    display: "inline-block",
  },
  infoText: {
    color: "#666",
    lineHeight: "1.5",
    fontSize: "14px",
    textAlign: "center" as const,
  },
  aiBox: {
    background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    padding: "20px",
    borderRadius: "16px",
    color: "white",
    marginTop: "20px",
    textAlign: "center" as const,
    boxShadow: "0 4px 15px rgba(253, 160, 133, 0.4)",
  },
  summaryBox: (color: string) => ({
    backgroundColor: `${color}10`,
    border: `1px solid ${color}30`,
    borderRadius: "16px",
    padding: "15px",
    marginBottom: "20px",
  }),
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  gridContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    margin: "10px -5px",
  },
  // --- Estilos de Anúncios ---
  adBannerFixed: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    backgroundColor: "#f7f7f7",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },
  adBannerInline: {
    width: "100%",
    maxWidth: "100%",
    height: "100px", // Altura padrão banner mobile grande
    backgroundColor: "#f0f0f0",
    border: "1px dashed #ccc",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    margin: "20px 0",
    overflow: "hidden",
  },
  adLabel: {
    fontSize: "10px",
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  adContent: {
    color: "#bbb",
    fontWeight: "bold" as const,
    fontSize: "14px",
  }
};

// --- Tipos ---

interface LotteryResult {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  acumulado: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  valorEstimadoProximoConcurso: number;
}

interface Stat {
  number: string;
  count: number;
}

interface Game {
  id: number;
  numbers: string[];
  hits?: number;
  createdAt?: string;
  targetContest?: number;
}

// --- Componente de Anúncio ---
const AdBanner = ({ fixed = false }: { fixed?: boolean }) => {
  return (
    <div style={fixed ? styles.adBannerFixed : styles.adBannerInline}>
      <span style={styles.adLabel}>Publicidade</span>
      <div style={styles.adContent}>
        {fixed ? "Espaço Banner 320x50" : "Espaço Anúncio Responsivo"}
      </div>
    </div>
  );
};

// --- Componente Principal ---

const App = () => {
  const [currentLottery, setCurrentLottery] = useState("megasena");
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results"); // 'results', 'games', 'stats'
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null);
  
  // Meus Jogos
  const [myGames, setMyGames] = useState<Game[]>([]);
  // Novo estado para seleção visual
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  
  // Estatísticas
  const [stats, setStats] = useState<Stat[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsLoadedFor, setStatsLoadedFor] = useState("");

  // IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{numbers: string[], message: string} | null>(null);

  const resultsCache = useRef<Record<string, LotteryResult>>({});
  const statsCache = useRef<Record<string, Stat[]>>({});

  const themeColor = LOTTERIES[currentLottery as keyof typeof LOTTERIES].color;
  const config = LOTTERIES[currentLottery as keyof typeof LOTTERIES];

  // Carregar jogos salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`games_${currentLottery}`);
    if (saved) {
      setMyGames(JSON.parse(saved));
    } else {
      setMyGames([]);
    }
    // Resetar seleção ao mudar loteria
    setSelectedNumbers([]);
    setAiPrediction(null);
    if (statsCache.current[currentLottery]) {
      setStats(statsCache.current[currentLottery]);
      setStatsLoadedFor(currentLottery);
    } else {
      setStats([]);
      setStatsLoadedFor("");
    }
    fetchResult(currentLottery);
  }, [currentLottery]);

  // Salvar jogos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(`games_${currentLottery}`, JSON.stringify(myGames));
  }, [myGames, currentLottery]);

  const fetchResult = async (lottery: string) => {
    if (resultsCache.current[lottery]) {
      setResult(resultsCache.current[lottery]);
      return;
    }

    setLoading(true);
    try {
      // URL oficial da Caixa
      const response = await fetch(`${CAIXA_API_BASE_URL}/${lottery}`);
      if (!response.ok) throw new Error("Falha na API da Caixa");
      const data = await response.json();
      resultsCache.current[lottery] = data;
      setResult(data);
    } catch (error) {
      console.error("Erro ao buscar resultado:", error);
      alert("Erro ao conectar com a API oficial da Caixa. Verifique sua conexão ou restrições de rede (CORS).");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryForStats = async () => {
    if (!result) return;
    if (statsLoadedFor === currentLottery) return;

    if (statsCache.current[currentLottery]) {
      setStats(statsCache.current[currentLottery]);
      setStatsLoadedFor(currentLottery);
      return;
    }

    setLoadingStats(true);
    const historyCounts: Record<string, number> = {};
    const promises: Promise<any>[] = [];
    
    // Buscar últimos 10 concursos
    const currentContest = result.numero;
    const numberOfDrawsToFetch = 10;

    for (let i = 0; i < numberOfDrawsToFetch; i++) {
      const contestNumber = currentContest - i;
      if (contestNumber <= 0) break;
      // Endpoint para concursos específicos na API oficial
      promises.push(
        fetch(`${CAIXA_API_BASE_URL}/${currentLottery}/${contestNumber}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
    }

    try {
      const responses = await Promise.all(promises);
      
      responses.forEach((data: any) => {
        if (data && data.listaDezenas) {
          (data.listaDezenas as string[]).forEach((num) => {
            historyCounts[num] = (historyCounts[num] || 0) + 1;
          });
        }
      });

      const sortedStats = Object.entries(historyCounts)
        .map(([number, count]) => ({ number, count }))
        .sort((a, b) => b.count - a.count); // Mais frequentes primeiro

      setStats(sortedStats);
      setStatsLoadedFor(currentLottery);
      statsCache.current[currentLottery] = sortedStats;
    } catch (error) {
      console.error("Erro ao calcular estatísticas", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleGenerateAiPrediction = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: config.name,
          betLength: config.betLength,
          balls: config.balls,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha na resposta do servidor");
      }

      const data = await response.json();
      
      if (data.text) {
        const json = JSON.parse(data.text);
        setAiPrediction(json);
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("A IA está recarregando suas energias cósmicas. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- Lógica do Quadro de Números ---

  const handleToggleNumber = (num: string) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      } else {
        if (prev.length >= config.betLength) {
          return prev; // Máximo atingido
        }
        return [...prev, num].sort((a, b) => parseInt(a) - parseInt(b));
      }
    });
  };

  const handleRandomize = () => {
    // Gerar números aleatórios para preencher o que falta
    const needed = config.betLength - selectedNumbers.length;
    if (needed <= 0) return;

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
    const randomPick = shuffled.slice(0, needed);
    
    setSelectedNumbers(prev => [...prev, ...randomPick].sort((a, b) => parseInt(a) - parseInt(b)));
  };

  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };

  const handleAddGame = () => {
    if (selectedNumbers.length !== config.betLength) {
      alert(`Para ${config.name}, selecione exatamente ${config.betLength} números.`);
      return;
    }

    const newGame: Game = { 
      id: Date.now(), 
      numbers: [...selectedNumbers],
      createdAt: new Date().toLocaleDateString('pt-BR'),
      targetContest: result ? result.numero : undefined
    };

    setMyGames(prev => [...prev, newGame]);
    setSelectedNumbers([]);
  };

  const handleDeleteGame = (id: number) => {
    setMyGames(prev => prev.filter(g => g.id !== id));
  };

  // --- Renderização ---

  const renderBall = (num: string, userGameNumbers: string[] | null = null, size: string = "40px") => {
    let isMatch = false;
    let isMiss = false;

    if (userGameNumbers && result && result.listaDezenas) {
      const isResult = result.listaDezenas.includes(num as string);
      const isUserPick = userGameNumbers.includes(num as string);
      
      if (isUserPick && isResult) isMatch = true;
      if (isUserPick && !isResult) isMiss = true;
    }

    return (
      <div key={num} style={styles.ball(themeColor, isMatch, isMiss, size)}>
        {num}
      </div>
    );
  };

  const renderGamesTab = () => {
    const totalGames = myGames.length;
    let totalWins = 0;
    const winDistribution: Record<number, number> = {};

    myGames.forEach(g => {
      const hits = checkHits(g.numbers, result?.listaDezenas);
      if (isWinningGame(hits, config.awards)) {
        totalWins++;
        winDistribution[hits] = (winDistribution[hits] || 0) + 1;
      }
    });

    // Gerar grid de números para seleção
    const start = config.startZero ? 0 : 1;
    const end = config.startZero ? 99 : config.balls;
    const gridNumbers = [];
    for (let i = start; i <= end; i++) {
        gridNumbers.push(i.toString().padStart(2, '0'));
    }

    return (
      <div>
        {/* Card de Novo Jogo com Grid */}
        <div style={styles.card}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
             <h3 style={{marginTop: 0, color: themeColor, marginBottom: "5px"}}>Faça seu Jogo</h3>
             <span style={{fontSize: "12px", color: "#666", fontWeight: "bold"}}>
               {selectedNumbers.length} / {config.betLength}
             </span>
          </div>
          
          <p style={{fontSize: "13px", color: "#666", marginBottom: "10px"}}>
             Selecione os números abaixo.
          </p>

          <div style={styles.gridContainer}>
            {gridNumbers.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleToggleNumber(num)}
                aria-label={`Selecionar número ${num}`}
                aria-pressed={selectedNumbers.includes(num)}
                style={styles.selectableBall(selectedNumbers.includes(num), themeColor)}
              >
                {num}
              </button>
            ))}
          </div>

          <div style={{display: "flex", gap: "10px", marginTop: "15px"}}>
             <button 
               style={styles.button(themeColor, false, true)}
               onClick={handleClearSelection}
               disabled={selectedNumbers.length === 0}
             >
               Limpar
             </button>
             <button 
               style={{...styles.button("#f6d365", selectedNumbers.length >= config.betLength), color: "#333"}}
               onClick={handleRandomize}
               disabled={selectedNumbers.length >= config.betLength}
             >
               <span className="material-icons" style={{fontSize: "18px"}}>auto_fix_high</span> Surpresinha
             </button>
             <button 
               style={styles.button(themeColor, selectedNumbers.length !== config.betLength)}
               onClick={handleAddGame}
             >
               <span className="material-icons" style={{fontSize: "18px"}}>add_circle</span> Salvar
             </button>
          </div>
        </div>

        {/* Resumo da Conferência */}
        {result && myGames.length > 0 && (
          <div style={styles.summaryBox(themeColor)}>
            <h4 style={{marginTop: 0, marginBottom: "10px", color: themeColor}}>
              Conferência (Conc. {result.numero})
            </h4>
            <div style={styles.summaryRow}>
              <span>Jogos Registrados:</span>
              <strong>{totalGames}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Jogos Premiados:</span>
              <strong style={{color: totalWins > 0 ? themeColor : "#666"}}>{totalWins}</strong>
            </div>
            {Object.keys(winDistribution).length > 0 && (
               <div style={{marginTop: "10px", borderTop: "1px dashed #ccc", paddingTop: "5px"}}>
                 {Object.entries(winDistribution).map(([hits, count]) => (
                   <div key={hits} style={{fontSize: "14px", color: "#555"}}>
                     {count} jogo(s) com <strong>{hits} acertos</strong>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        <h3 style={{marginLeft: "10px"}}>Meus Jogos Salvos</h3>
        {myGames.length === 0 && (
          <p style={styles.infoText}>Nenhum jogo salvo para {config.name}. Marque os números acima para adicionar.</p>
        )}

        {myGames.slice().reverse().map(game => { // Reverse para mostrar os mais novos primeiro
          const hits = checkHits(game.numbers, result?.listaDezenas);
          const isWinner = isWinningGame(hits, config.awards);
          
          return (
            <div key={game.id} style={isWinner ? styles.winnerCard(themeColor) : styles.card}>
              {isWinner && (
                <div style={{
                  position: "absolute", top: "-10px", right: "20px", 
                  backgroundColor: themeColor, color: "white", 
                  padding: "4px 10px", borderRadius: "10px", 
                  fontSize: "12px", fontWeight: "bold"
                }}>
                  PREMIADO
                </div>
              )}
              
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "5px"}}>
                 <span style={{fontWeight: "bold", color: "#555"}}>Jogo #{game.id.toString().slice(-4)}</span>
                 <span style={{
                   fontWeight: "bold", 
                   color: isWinner ? themeColor : "#999",
                   fontSize: isWinner ? "18px" : "14px"
                 }}>
                   {result ? `${hits} acertos` : "..."}
                 </span>
              </div>
              
              <div style={{fontSize: "12px", color: "#888", marginBottom: "10px", display: "flex", justifyContent: "space-between"}}>
                 <span>Criado em: {game.createdAt || "Data desconhecida"}</span>
                 {game.targetContest && <span>Conc. Alvo: {game.targetContest}</span>}
              </div>

              <div style={{display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "5px"}}>
                {game.numbers.map(num => renderBall(num, game.numbers, "32px"))}
              </div>
              
              <div style={{textAlign: "right", marginTop: "10px"}}>
                {deletingGameId === game.id ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#555" }}>Tem certeza?</span>
                    <button
                      onClick={() => {
                        handleDeleteGame(game.id);
                        setDeletingGameId(null);
                      }}
                      style={{
                        backgroundColor: "#ff4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}
                      aria-label="Confirmar exclusão"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setDeletingGameId(null)}
                      style={{
                        backgroundColor: "transparent",
                        color: "#666",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                      aria-label="Cancelar exclusão"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingGameId(game.id)}
                    aria-label={`Remover jogo ${game.id}`}
                    style={{background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "12px", textDecoration: "underline"}}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header(themeColor)}>
        <h1 style={styles.title}>Loterias & IA</h1>
        <select 
          style={styles.select}
          value={currentLottery}
          aria-label="Selecione a loteria"
          onChange={(e) => setCurrentLottery(e.target.value)}
        >
          {Object.entries(LOTTERIES).map(([key, val]) => (
            <option key={key} value={key}>{val.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button 
          style={styles.tab(activeTab === 'results', themeColor)} 
          onClick={() => setActiveTab('results')}
        >
          <span className="material-icons" style={styles.icon}>casino</span>
          Resultado
        </button>
        <button 
          style={styles.tab(activeTab === 'games', themeColor)} 
          onClick={() => setActiveTab('games')}
        >
          <span className="material-icons" style={styles.icon}>playlist_add_check</span>
          Meus Jogos
        </button>
        <button 
          style={styles.tab(activeTab === 'stats', themeColor)} 
          onClick={() => {
            setActiveTab('stats');
            fetchHistoryForStats();
          }}
        >
          <span className="material-icons" style={styles.icon}>bar_chart</span>
          Estatísticas
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        
        {loading && (
          <div style={{textAlign: "center", padding: "40px"}}>
            <span className="material-icons" style={{fontSize: "40px", color: "#ccc", animation: "spin 1s linear infinite"}}>refresh</span>
            <p>Buscando dados na Caixa...</p>
          </div>
        )}

        {!loading && result && activeTab === 'results' && (
          <>
            <div style={styles.card}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
                <span style={{fontWeight: "bold", fontSize: "18px"}}>CONCURSO {result.numero}</span>
                <span style={{color: "#666", fontSize: "14px"}}>{result.dataApuracao}</span>
              </div>
              
              <div style={styles.ballsContainer}>
                {result.listaDezenas && result.listaDezenas.map(num => renderBall(num))}
              </div>

              <div style={{textAlign: "center", marginTop: "15px"}}>
                {result.acumulado ? 
                  <span style={{color: themeColor, fontWeight: "bold", padding: "5px 10px", borderRadius: "10px", backgroundColor: `${themeColor}20`}}>ACUMULOU!</span> : 
                  <span style={{color: "#666"}}>Saiu ganhador!</span>
                }
                <div style={styles.badge}>
                   Próx: {result.dataProximoConcurso}
                </div>
              </div>
            </div>

            {/* Espaço de Anúncio Inline */}
            <AdBanner />

            {/* IA Section */}
            <div style={styles.aiBox}>
              <h3 style={{margin: "0 0 10px 0"}}>Palpite Místico da IA ✨</h3>
              {!aiPrediction ? (
                <button 
                  style={{
                    backgroundColor: "white", 
                    color: "#fda085", 
                    border: "none", 
                    padding: "10px 20px", 
                    borderRadius: "20px", 
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                  onClick={handleGenerateAiPrediction}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Consultando os astros..." : "Gerar Palpite Inteligente"}
                </button>
              ) : (
                <div>
                  <p style={{fontStyle: "italic", marginBottom: "15px"}}>"{aiPrediction.message}"</p>
                  <div style={{display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap"}}>
                    {aiPrediction.numbers.map(n => (
                      <div key={n} style={{
                        width: "35px", height: "35px", borderRadius: "50%", 
                        backgroundColor: "rgba(255,255,255,0.9)", color: "#d97b4f",
                        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                      }}>
                        {n}
                      </div>
                    ))}
                  </div>
                  <button 
                    style={{
                      background: "transparent", border: "1px solid white", color: "white",
                      marginTop: "15px", padding: "5px 15px", borderRadius: "15px", cursor: "pointer"
                    }}
                    onClick={() => setAiPrediction(null)}
                  >
                    Gerar Outro
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && activeTab === 'games' && renderGamesTab()}

        {!loading && activeTab === 'stats' && (
          <div>
            <div style={styles.card}>
              <h3 style={{marginTop: 0, color: themeColor}}>Números Quentes 🔥</h3>
              <p style={{fontSize: "14px", color: "#666"}}>Baseado nos últimos 10 concursos.</p>
              
              {loadingStats ? (
                <div style={{textAlign: "center", padding: "20px"}}>
                  <span className="material-icons" style={{animation: "spin 1s infinite"}}>autorenew</span>
                  <p>Analisando histórico...</p>
                </div>
              ) : stats.length > 0 ? (
                <div style={{marginTop: "20px"}}>
                  {stats.slice(0, 10).map((stat, index) => {
                    // Calcular porcentagem relativa ao maior valor para a barra
                    const max = stats[0].count;
                    const percent = (stat.count / max) * 100;
                    return (
                      <div key={stat.number} style={styles.statItem}>
                        <div style={styles.statLabel}>{stat.number}</div>
                        <div style={styles.statBarBg}>
                          <div style={styles.statBarFill(percent, themeColor)}></div>
                        </div>
                        <div style={styles.statValue}>{stat.count}x</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>Não foi possível carregar estatísticas no momento.</p>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* Banner de Rodapé Fixo */}
      <AdBanner fixed={true} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);