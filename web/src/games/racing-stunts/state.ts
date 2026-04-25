import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RacingStuntsSettings {
  laps: "3" | "5";
}

export type StuntType = "drift" | "jump" | "boost";
export type StuntResult = "perfect" | "good" | "fail";

export interface RacingStuntsState {
  settings: RacingStuntsSettings;
  lap: number;
  totalLaps: number;
  position: number;      // 0..100 (track progress in current lap)
  speed: number;         // 1..10
  score: number;
  lastStunt: string;
  lastResult: StuntResult | null;
  stuntZone: boolean;    // true when a stunt opportunity is available
  stuntType: StuntType;
  gameOver: boolean;
  seed: number;
}

export type RacingStuntsAction =
  | { type: "accelerate" }
  | { type: "stunt"; stuntType: StuntType }
  | { type: "restart" };

function nextStuntType(rng: () => number): StuntType {
  const r = rng();
  if (r < 0.33) return "drift";
  if (r < 0.66) return "jump";
  return "boost";
}

export function initialState(seed: number, settings: RacingStuntsSettings): RacingStuntsState {
  const rng = mulberry32(seed);
  return {
    settings,
    lap: 1,
    totalLaps: parseInt(settings.laps, 10),
    position: 0,
    speed: 3,
    score: 0,
    lastStunt: "Race started! Accelerate to gain speed.",
    lastResult: null,
    stuntZone: false,
    stuntType: nextStuntType(rng),
    gameOver: false,
    seed,
  };
}

function stuntScore(result: StuntResult, type: StuntType): number {
  const base = type === "boost" ? 80 : type === "jump" ? 60 : 40;
  if (result === "perfect") return base * 2;
  if (result === "good") return base;
  return 0;
}

export function reducer(state: RacingStuntsState, action: RacingStuntsAction): RacingStuntsState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "accelerate") {
    const newSpeed = Math.min(10, state.speed + 1);
    const advance = newSpeed * 3;
    const newPos = state.position + advance;
    const rng = mulberry32(state.seed + state.lap * 1000 + Math.floor(newPos));

    if (newPos >= 100) {
      const newLap = state.lap + 1;
      if (newLap > state.totalLaps) {
        return { ...state, position: 100, speed: newSpeed, gameOver: true, lastStunt: "Race complete! Checkered flag!" };
      }
      const stuntZone = rng() > 0.4;
      const stuntType = nextStuntType(rng);
      return {
        ...state,
        lap: newLap,
        position: newPos - 100,
        speed: Math.max(1, newSpeed - 1),
        lastStunt: `Lap ${newLap} started!`,
        lastResult: null,
        stuntZone,
        stuntType,
        seed: state.seed + 7,
      };
    }

    const stuntZone = rng() > 0.5;
    const stuntType = nextStuntType(rng);
    return {
      ...state,
      position: newPos,
      speed: newSpeed,
      lastStunt: stuntZone ? `Stunt zone! Try a ${stuntType}!` : `Zooming at speed ${newSpeed}...`,
      lastResult: null,
      stuntZone,
      stuntType,
      seed: state.seed + 3,
    };
  }

  if (action.type === "stunt") {
    if (!state.stuntZone) {
      return { ...state, lastStunt: "No stunt zone here!", lastResult: "fail" };
    }
    const rng = mulberry32(state.seed + state.score);
    const r = rng();
    const result: StuntResult = r < 0.25 ? "perfect" : r < 0.65 ? "good" : "fail";
    const pts = stuntScore(result, action.stuntType);
    const speedBonus = action.stuntType === "boost" && result !== "fail" ? 2 : 0;
    const msg = result === "perfect" ? `PERFECT ${action.stuntType.toUpperCase()}! +${pts}` :
                result === "good" ? `Good ${action.stuntType}! +${pts}` :
                `Stunt failed! ${action.stuntType} wiped out!`;
    return {
      ...state,
      score: state.score + pts,
      speed: Math.max(1, Math.min(10, state.speed + speedBonus)),
      stuntZone: false,
      lastStunt: msg,
      lastResult: result,
      seed: state.seed + 11,
    };
  }

  return state;
}

export function isTerminal(state: RacingStuntsState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.score) };
}
