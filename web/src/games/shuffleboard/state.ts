import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ShuffleboardSettings {
  rounds: "3" | "5" | "7";
}

// Lane length = 100 units. Scoring zones: 60-75 = 1pt, 75-88 = 2pt, 88-100 = 3pt. Off end = 0.
// Opponent's discs at same position negate yours (only player's uncovered discs score).

export interface Disc {
  owner: "player" | "bot";
  position: number; // 0-100; 0 = behind start line, 100 = far end
  active: boolean;
}

export interface Round {
  discs: Disc[];
  playerScore: number;
  botScore: number;
}

export interface ShuffleboardState {
  settings: ShuffleboardSettings;
  rngSeed: number;
  totalRounds: number;
  currentRound: number;
  discIndex: number;       // 0-7: 4 player + 4 bot per round (alternating)
  playerTotalScore: number;
  botTotalScore: number;
  currentDiscs: Disc[];
  angle: number;           // 0..1, ideal=0.5
  power: number;           // 0..1, ideal=0.75
  phase: "aim" | "result" | "round-over" | "done";
  lastResult: string;
  rounds: Round[];
}

export type ShuffleboardAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "slide" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function slideDisc(angle: number, power: number, seed: number): number {
  const rng = mulberry32(seed);
  const angleDev = (angle - 0.5) * 20; // lateral dev in units
  const powerDev = (power - 0.75);
  const distance = 85 + powerDev * 80 + (rng() - 0.5) * 15;
  const lateral = angleDev + (rng() - 0.5) * 8;
  // If lateral is too large disc misses the lane (treated as off)
  if (Math.abs(lateral) > 12) return 0;
  return Math.max(0, Math.min(105, distance));
}

function botSlide(seed: number): number {
  const rng = mulberry32(seed);
  const base = 80 + rng() * 18;
  return Math.max(0, Math.min(105, base));
}

function discScore(pos: number): number {
  if (pos > 100 || pos < 60) return 0;
  if (pos >= 88) return 3;
  if (pos >= 75) return 2;
  return 1;
}

function roundScores(discs: Disc[]): [number, number] {
  // Cancellation: if opponent has a disc in a zone, it cancels the closest disc
  const playerDiscs = discs.filter((d) => d.owner === "player" && d.active);
  const botDiscs = discs.filter((d) => d.owner === "bot" && d.active);

  // Simple: only discs ahead of all opponent discs score (closest disc to end)
  const allSorted = [...discs.filter((d) => d.active)].sort((a, b) => b.position - a.position);
  let pScore = 0;
  let bScore = 0;
  let leadOwner: "player" | "bot" | null = null;

  for (const disc of allSorted) {
    if (leadOwner === null) {
      leadOwner = disc.owner;
    }
    if (disc.owner === leadOwner) {
      const pts = discScore(disc.position);
      if (leadOwner === "player") pScore += pts;
      else bScore += pts;
    } else {
      break; // stop when we hit opponent's best disc
    }
  }

  // Suppress unused variables
  void playerDiscs;
  void botDiscs;

  return [pScore, bScore];
}

export function initialState(seed: number, settings: ShuffleboardSettings): ShuffleboardState {
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds: parseInt(settings.rounds, 10),
    currentRound: 1,
    discIndex: 0,
    playerTotalScore: 0,
    botTotalScore: 0,
    currentDiscs: [],
    angle: 0.5,
    power: 0.75,
    phase: "aim",
    lastResult: "",
    rounds: [],
  };
}

export function reducer(state: ShuffleboardState, action: ShuffleboardAction): ShuffleboardState {
  if (state.phase === "done") return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "slide" && state.phase === "aim") {
    // Player slides, then bot immediately slides in return
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const newSeed = nextSeed(seed2);

    const playerPos = slideDisc(state.angle, state.power, seed1);
    const botPos = botSlide(seed2);

    const pDisc: Disc = { owner: "player", position: playerPos, active: playerPos > 0 && playerPos <= 100 };
    const bDisc: Disc = { owner: "bot", position: botPos, active: botPos > 0 && botPos <= 100 };

    const newDiscs = [...state.currentDiscs, pDisc, bDisc];
    const newDiscIndex = state.discIndex + 2;

    let lastResult = `You: ${playerPos.toFixed(1)} | Bot: ${botPos.toFixed(1)}`;
    if (playerPos > 100) lastResult += " (your disc off end!)";
    if (botPos > 100) lastResult += " (bot's disc off end!)";

    const roundComplete = newDiscIndex >= 8; // 4 pairs = 8 discs

    if (roundComplete) {
      const [pScore, bScore] = roundScores(newDiscs);
      const newPlayerTotal = state.playerTotalScore + pScore;
      const newBotTotal = state.botTotalScore + bScore;
      const gameOver = state.currentRound >= state.totalRounds;
      const round: Round = { discs: newDiscs, playerScore: pScore, botScore: bScore };

      return {
        ...state,
        rngSeed: newSeed,
        currentDiscs: newDiscs,
        discIndex: newDiscIndex,
        playerTotalScore: newPlayerTotal,
        botTotalScore: newBotTotal,
        lastResult: `Round ${state.currentRound}: You ${pScore} — Bot ${bScore}. ${lastResult}`,
        rounds: [...state.rounds, round],
        phase: gameOver ? "done" : "round-over",
      };
    }

    return {
      ...state,
      rngSeed: newSeed,
      currentDiscs: newDiscs,
      discIndex: newDiscIndex,
      lastResult,
      phase: "result",
    };
  }

  if (action.type === "next") {
    if (state.phase === "result") return { ...state, phase: "aim" };
    if (state.phase === "round-over") {
      return {
        ...state,
        currentRound: state.currentRound + 1,
        discIndex: 0,
        currentDiscs: [],
        phase: "aim",
        lastResult: "",
      };
    }
  }

  return state;
}

export function isTerminal(state: ShuffleboardState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.playerTotalScore * 100 + (state.playerTotalScore > state.botTotalScore ? 500 : 0) };
}
