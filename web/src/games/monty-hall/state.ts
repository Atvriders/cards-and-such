import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MontyHallSettings {
  dummy?: string;
}

export type Phase = "pick" | "reveal" | "final" | "result";

export interface MontyHallState {
  settings: MontyHallSettings;
  rngSeed: number;
  /** which door has the car (0-2) */
  carDoor: number;
  /** player's initial pick (0-2 or -1 for not yet picked) */
  initialPick: number;
  /** door revealed by host (goat door, 0-2 or -1) */
  revealedDoor: number;
  /** player's final door */
  finalPick: number;
  phase: Phase;
  won: boolean;
  /** track stats */
  rounds: number;
  wins: number;
  switched: number;
  stayWins: number;
  switchWins: number;
}

export type MontyHallAction =
  | { type: "pickDoor"; door: number }
  | { type: "decide"; switchDoor: boolean }
  | { type: "next" };

export function initialState(seed: number, settings: MontyHallSettings): MontyHallState {
  const rng = mulberry32(seed);
  const carDoor = Math.floor(rng() * 3);
  return {
    settings,
    rngSeed: seed,
    carDoor,
    initialPick: -1,
    revealedDoor: -1,
    finalPick: -1,
    phase: "pick",
    won: false,
    rounds: 0,
    wins: 0,
    switched: 0,
    stayWins: 0,
    switchWins: 0,
  };
}

function hostReveal(carDoor: number, initialPick: number, rng: () => number): number {
  // Host reveals a goat door that is neither carDoor nor initialPick
  const candidates = [0, 1, 2].filter((d) => d !== carDoor && d !== initialPick);
  return candidates[Math.floor(rng() * candidates.length)]!;
}

export function reducer(state: MontyHallState, action: MontyHallAction): MontyHallState {
  switch (action.type) {
    case "pickDoor": {
      if (state.phase !== "pick") return state;
      const rng = mulberry32(state.rngSeed ^ (action.door + 1) * 31337);
      const revealed = hostReveal(state.carDoor, action.door, rng);
      return { ...state, initialPick: action.door, revealedDoor: revealed, phase: "reveal" };
    }
    case "decide": {
      if (state.phase !== "reveal") return state;
      let finalPick: number;
      if (action.switchDoor) {
        // switch to the remaining door
        finalPick = [0, 1, 2].find((d) => d !== state.initialPick && d !== state.revealedDoor)!;
      } else {
        finalPick = state.initialPick;
      }
      const won = finalPick === state.carDoor;
      const rounds = state.rounds + 1;
      const wins = state.wins + (won ? 1 : 0);
      const switched = state.switched + (action.switchDoor ? 1 : 0);
      const stayWins = state.stayWins + (!action.switchDoor && won ? 1 : 0);
      const switchWins = state.switchWins + (action.switchDoor && won ? 1 : 0);
      return { ...state, finalPick, phase: "result", won, rounds, wins, switched, stayWins, switchWins };
    }
    case "next": {
      if (state.phase !== "result") return state;
      const rng = mulberry32(state.rngSeed + state.rounds);
      const carDoor = Math.floor(rng() * 3);
      return {
        ...state,
        rngSeed: state.rngSeed + state.rounds,
        carDoor,
        initialPick: -1,
        revealedDoor: -1,
        finalPick: -1,
        phase: "pick",
        won: false,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: MontyHallState): { score: number } | null {
  if (state.phase !== "result") return null;
  return { score: state.won ? 1000 : 0 };
}
