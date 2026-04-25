import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Runner: roll dice to move a runner around a track. Avoid obstacles, collect gems.

export interface DiceRunnerSettings {
  trackLength: "20" | "30" | "50";
}

export type TileType = "safe" | "obstacle" | "gem" | "finish";

export interface DiceRunnerState {
  settings: DiceRunnerSettings;
  rngSeed: number;
  position: number;
  track: readonly TileType[];
  dice: [number, number] | null;
  score: number;
  gems: number;
  health: number;
  over: boolean;
  won: boolean;
  message: string;
}

export type DiceRunnerAction = { type: "roll" };

function buildTrack(seed: number, length: number): { track: TileType[]; nextSeed: number } {
  const track: TileType[] = ["safe"]; // start
  let s = seed;
  const rng = mulberry32(s);
  for (let i = 1; i < length - 1; i++) {
    const v = rng();
    s = Math.floor(rng() * 2 ** 31);
    if (v < 0.2) track.push("obstacle");
    else if (v < 0.4) track.push("gem");
    else track.push("safe");
  }
  track.push("finish");
  return { track, nextSeed: s };
}

export function initialState(seed: number, settings: DiceRunnerSettings): DiceRunnerState {
  const length = parseInt(settings.trackLength, 10);
  const { track, nextSeed } = buildTrack(seed, length);
  return {
    settings,
    rngSeed: nextSeed,
    position: 0,
    track,
    dice: null,
    score: 0,
    gems: 0,
    health: 3,
    over: false,
    won: false,
    message: "Roll the dice to run!",
  };
}

function rollDice(seed: number): { dice: [number, number]; nextSeed: number } {
  const r = mulberry32(seed);
  const d1 = Math.floor(r() * 6) + 1;
  const d2 = Math.floor(r() * 6) + 1;
  const nextSeed = Math.floor(r() * 2 ** 31);
  return { dice: [d1, d2], nextSeed };
}

export function reducer(state: DiceRunnerState, action: DiceRunnerAction): DiceRunnerState {
  if (state.over) return state;

  const { dice, nextSeed } = rollDice(state.rngSeed);
  const steps = dice[0] + dice[1];
  let position = state.position + steps;

  if (position >= state.track.length - 1) {
    position = state.track.length - 1;
  }

  const tile = state.track[position] ?? "safe";
  let health = state.health;
  let gems = state.gems;
  let score = state.score + steps * 10;
  let message = `Rolled ${dice[0]}+${dice[1]}=${steps}. `;

  if (tile === "obstacle") {
    health -= 1;
    message += "Hit an obstacle! -1 HP";
  } else if (tile === "gem") {
    gems += 1;
    score += 50;
    message += "Found a gem! +50pts";
  } else if (tile === "finish") {
    score += 200 + gems * 100;
    message += "Reached the finish! Bonus awarded!";
  } else {
    message += "Safe ground.";
  }

  const over = health <= 0 || tile === "finish";
  const won = tile === "finish";

  return {
    ...state,
    rngSeed: nextSeed,
    position,
    dice,
    health,
    gems,
    score,
    over,
    won,
    message,
  };
}

export function isTerminal(state: DiceRunnerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
