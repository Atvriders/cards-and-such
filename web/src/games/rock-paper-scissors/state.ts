import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type RPSChoice = "rock" | "paper" | "scissors";
export type RoundResult = "win" | "loss" | "draw";

export interface RPSSettings {
  rounds: "3" | "5" | "7";
  botStyle: "random" | "pattern";
}

export interface RoundRecord {
  player: RPSChoice;
  bot: RPSChoice;
  result: RoundResult;
}

export interface RPSState {
  settings: RPSSettings;
  rngSeed: number;
  maxRounds: number;
  roundsPlayed: number;
  playerWins: number;
  botWins: number;
  draws: number;
  history: RoundRecord[];
  playerHistory: RPSChoice[];
  chosen: RPSChoice | null;
  lastResult: RoundResult | null;
  lastBotChoice: RPSChoice | null;
  gameOver: boolean;
  winner: "player" | "bot" | "draw" | null;
}

export type RPSAction =
  | { type: "choose"; choice: RPSChoice }
  | { type: "restart" };

const BEATS: Record<RPSChoice, RPSChoice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

function beats(a: RPSChoice, b: RPSChoice): boolean {
  return BEATS[a] === b;
}

function roundResult(player: RPSChoice, bot: RPSChoice): RoundResult {
  if (player === bot) return "draw";
  return beats(player, bot) ? "win" : "loss";
}

/** Pattern-aware bot: looks at player's last 3 picks and counters the most frequent. */
function patternBotChoice(playerHistory: RPSChoice[], rng: () => number): RPSChoice {
  const choices: RPSChoice[] = ["rock", "paper", "scissors"];
  const recent = playerHistory.slice(-3);
  if (recent.length < 2) {
    return choices[Math.floor(rng() * 3)]!;
  }
  const counts: Record<RPSChoice, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const c of recent) counts[c]++;
  // Find most common
  let best: RPSChoice = "rock";
  for (const c of choices) {
    if (counts[c]! > counts[best]!) best = c;
  }
  // Counter it — pick what beats `best`
  const counter = choices.find((c) => BEATS[c] === best)!;
  return counter;
}

function randomBotChoice(rng: () => number): RPSChoice {
  const choices: RPSChoice[] = ["rock", "paper", "scissors"];
  return choices[Math.floor(rng() * 3)]!;
}

export function initialState(seed: number, settings: RPSSettings): RPSState {
  return {
    settings,
    rngSeed: seed,
    maxRounds: parseInt(settings.rounds, 10),
    roundsPlayed: 0,
    playerWins: 0,
    botWins: 0,
    draws: 0,
    history: [],
    playerHistory: [],
    chosen: null,
    lastResult: null,
    lastBotChoice: null,
    gameOver: false,
    winner: null,
  };
}

export function reducer(state: RPSState, action: RPSAction): RPSState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (action.type === "choose") {
    if (state.gameOver) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const player = action.choice;
    const newPlayerHistory = [...state.playerHistory, player];
    const bot =
      state.settings.botStyle === "pattern"
        ? patternBotChoice(state.playerHistory, rng)
        : randomBotChoice(rng);

    const result = roundResult(player, bot);
    const record: RoundRecord = { player, bot, result };

    const playerWins = state.playerWins + (result === "win" ? 1 : 0);
    const botWins = state.botWins + (result === "loss" ? 1 : 0);
    const draws = state.draws + (result === "draw" ? 1 : 0);
    const roundsPlayed = state.roundsPlayed + 1;

    const needed = Math.ceil(state.maxRounds / 2);
    const gameOver =
      playerWins >= needed || botWins >= needed || roundsPlayed >= state.maxRounds;

    let winner: RPSState["winner"] = null;
    if (gameOver) {
      if (playerWins > botWins) winner = "player";
      else if (botWins > playerWins) winner = "bot";
      else winner = "draw";
    }

    return {
      ...state,
      rngSeed: nextSeed,
      roundsPlayed,
      playerWins,
      botWins,
      draws,
      history: [...state.history, record],
      playerHistory: newPlayerHistory,
      chosen: player,
      lastResult: result,
      lastBotChoice: bot,
      gameOver,
      winner,
    };
  }

  return state;
}

export function isTerminal(state: RPSState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "player") return { score: 100 + state.playerWins * 20 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
