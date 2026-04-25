import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceFootballSettings {
  quarters: "2" | "4";
}

export type PlayType = "run" | "pass" | "kick";
export type DownResult = "firstDown" | "turnover" | "touchdown" | "fieldGoal" | "miss" | "advance";

export interface DiceFootballState {
  settings: DiceFootballSettings;
  playerScore: number;
  aiScore: number;
  quarter: number;
  totalQuarters: number;
  possession: "player" | "ai";
  down: number;          // 1..4
  yardsToGo: number;
  fieldPosition: number; // 0..99, player's perspective (0 = own end zone)
  lastPlay: string;
  phase: "play" | "kickoff" | "gameOver";
  lastDice: number[];
  seed: number;
}

export type DiceFootballAction =
  | { type: "play"; playType: PlayType }
  | { type: "kickoff" };

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
}

export function initialState(seed: number, settings: DiceFootballSettings): DiceFootballState {
  const totalQuarters = parseInt(settings.quarters, 10);
  return {
    settings,
    playerScore: 0,
    aiScore: 0,
    quarter: 1,
    totalQuarters,
    possession: "player",
    down: 1,
    yardsToGo: 10,
    fieldPosition: 20,
    lastPlay: "Game starts! You receive the kickoff.",
    phase: "play",
    lastDice: [],
    seed,
  };
}

function runPlay(rng: () => number, yards: number): { gained: number; dice: number[] } {
  const dice = rollDice(rng, 2);
  const gained = dice[0]! + dice[1]! - 2 + (yards > 0 ? 0 : -2);
  return { gained: Math.max(-3, gained), dice };
}

function passPlay(rng: () => number): { gained: number; dice: number[]; complete: boolean } {
  const dice = rollDice(rng, 3);
  const sum = dice[0]! + dice[1]! + dice[2]!;
  const complete = sum >= 9;
  const gained = complete ? sum - 4 : 0;
  return { gained, dice, complete };
}

function kickPlay(rng: () => number, pos: number): { made: boolean; dice: number[] } {
  const dice = rollDice(rng, 2);
  const sum = dice[0]! + dice[1]!;
  const made = sum >= 7 && pos >= 30;
  return { made, dice };
}

function aiTurn(state: DiceFootballState): DiceFootballState {
  const rng = mulberry32(state.seed + state.quarter * 100 + state.down * 10 + state.fieldPosition);
  let s = { ...state };
  const aiPos = 99 - s.fieldPosition;

  // AI randomly picks a play
  const r = rng();
  let result: { gained: number; dice: number[] };
  let play = "";
  if (r < 0.4) {
    const { gained, dice } = runPlay(rng, 1);
    result = { gained, dice };
    play = `AI runs for ${gained} yards`;
  } else if (r < 0.75) {
    const { gained, dice, complete } = passPlay(rng);
    result = { gained, dice };
    play = complete ? `AI completes pass for ${gained} yards` : "AI pass incomplete";
  } else if (s.down === 4 && aiPos >= 30) {
    const { made, dice } = kickPlay(rng, aiPos);
    if (made) {
      s = { ...s, aiScore: s.aiScore + 3, lastDice: dice };
      // Turnover on downs (punt)
      return {
        ...s,
        down: 1, yardsToGo: 10, fieldPosition: 80, possession: "player",
        lastPlay: `AI kicks field goal! AI score: ${s.aiScore}. Your ball at your 20.`,
        seed: state.seed + 1,
      };
    }
    result = { gained: 0, dice };
    play = "AI field goal attempt misses";
  } else {
    const { gained, dice } = runPlay(rng, 1);
    result = { gained, dice };
    play = `AI runs for ${gained} yards`;
  }

  const newPos = s.fieldPosition - result.gained;

  if (newPos <= 0) {
    // AI touchdown
    return {
      ...s,
      aiScore: s.aiScore + 7,
      down: 1, yardsToGo: 10, fieldPosition: 20, possession: "player",
      lastPlay: `${play}. AI Touchdown! +7. Your ball at your 20.`,
      lastDice: result.dice,
      seed: state.seed + 1,
    };
  }

  const newYards = s.yardsToGo - result.gained;
  if (newYards <= 0) {
    return {
      ...s,
      fieldPosition: newPos,
      down: 1, yardsToGo: 10,
      lastPlay: `${play}. AI first down!`,
      lastDice: result.dice,
      seed: state.seed + 1,
    };
  }

  if (s.down >= 4) {
    return {
      ...s,
      down: 1, yardsToGo: 10, fieldPosition: 99 - newPos, possession: "player",
      lastPlay: `${play}. Turnover on downs! Your ball.`,
      lastDice: result.dice,
      seed: state.seed + 1,
    };
  }

  return {
    ...s,
    fieldPosition: newPos,
    down: s.down + 1,
    yardsToGo: Math.max(1, newYards),
    lastPlay: `${play}. ${s.down + 1} and ${Math.max(1, newYards)}.`,
    lastDice: result.dice,
    seed: state.seed + 1,
  };
}

function nextQuarter(state: DiceFootballState): DiceFootballState {
  const nextQ = state.quarter + 1;
  if (nextQ > state.totalQuarters) {
    return { ...state, phase: "gameOver", lastPlay: "Game over!" };
  }
  return {
    ...state,
    quarter: nextQ,
    possession: nextQ % 2 === 0 ? "ai" : "player",
    down: 1, yardsToGo: 10, fieldPosition: 20,
    lastPlay: `Quarter ${nextQ} starts!`,
    phase: "play",
  };
}

export function reducer(state: DiceFootballState, action: DiceFootballAction): DiceFootballState {
  if (state.phase === "gameOver") return state;

  const rng = mulberry32(state.seed + state.playerScore * 7 + state.quarter);

  if (state.possession === "ai") {
    // Run AI automatically via "play" action
    if (action.type === "play" || action.type === "kickoff") {
      let s = aiTurn(state);
      // If still AI possession after AI turn, may need quarter change logic
      // For simplicity end of AI turn switches to player
      s = { ...s, seed: s.seed + 1 };
      return s;
    }
    return state;
  }

  if (action.type === "kickoff") {
    return { ...state, phase: "play", lastPlay: "Kickoff received! 1st and 10." };
  }

  if (action.type !== "play") return state;
  const { playType } = action;

  let gained = 0;
  let playDesc = "";
  let dice: number[] = [];
  let turnover = false;
  let scoredTD = false;
  let scoredFG = false;
  let fgMiss = false;

  if (playType === "run") {
    const res = runPlay(rng, state.yardsToGo);
    gained = res.gained;
    dice = res.dice;
    playDesc = `Run for ${gained} yard${Math.abs(gained) !== 1 ? "s" : ""}`;
  } else if (playType === "pass") {
    const res = passPlay(rng);
    gained = res.gained;
    dice = res.dice;
    playDesc = res.complete ? `Pass complete for ${gained} yards` : "Incomplete pass";
  } else {
    // Field goal
    const res = kickPlay(rng, state.fieldPosition);
    dice = res.dice;
    if (res.made) {
      scoredFG = true;
      playDesc = "Field goal is GOOD! +3";
    } else {
      fgMiss = true;
      playDesc = "Field goal attempt missed";
    }
  }

  const newSeed = state.seed + 13;

  if (scoredFG) {
    const ns = { ...state, playerScore: state.playerScore + 3, seed: newSeed, lastDice: dice };
    // AI ball now
    return aiTurn({ ...ns, possession: "ai", down: 1, yardsToGo: 10, fieldPosition: 80, lastPlay: playDesc });
  }

  if (fgMiss) {
    // AI ball
    return aiTurn({ ...state, possession: "ai", down: 1, yardsToGo: 10, fieldPosition: 99 - state.fieldPosition, lastPlay: playDesc, seed: newSeed, lastDice: dice });
  }

  const newPos = state.fieldPosition + gained;
  if (newPos >= 100) {
    scoredTD = true;
    const ns = { ...state, playerScore: state.playerScore + 7, seed: newSeed, lastDice: dice };
    return aiTurn({ ...ns, possession: "ai", down: 1, yardsToGo: 10, fieldPosition: 80, lastPlay: `${playDesc}. TOUCHDOWN! +7` });
  }

  const newYards = state.yardsToGo - gained;
  if (newYards <= 0) {
    // First down
    return {
      ...state,
      fieldPosition: newPos,
      down: 1,
      yardsToGo: 10,
      lastPlay: `${playDesc}. First down!`,
      lastDice: dice,
      seed: newSeed,
    };
  }

  if (state.down >= 4) {
    // Turnover on downs
    turnover = true;
    return aiTurn({
      ...state,
      possession: "ai",
      down: 1, yardsToGo: 10,
      fieldPosition: 99 - newPos,
      lastPlay: `${playDesc}. Turnover on downs!`,
      lastDice: dice,
      seed: newSeed,
    });
  }

  void turnover; void scoredTD;
  return {
    ...state,
    fieldPosition: Math.max(1, newPos),
    down: state.down + 1,
    yardsToGo: Math.max(1, newYards),
    lastPlay: `${playDesc}. ${state.down + 1} and ${Math.max(1, newYards)}.`,
    lastDice: dice,
    seed: newSeed,
  };
}

export function isTerminal(state: DiceFootballState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  const base = state.playerScore > state.aiScore ? 1000 :
               state.playerScore === state.aiScore ? 500 : 100;
  return { score: base };
}
