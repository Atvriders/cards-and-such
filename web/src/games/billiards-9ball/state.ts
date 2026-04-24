import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Billiards9BallSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Billiards9BallState {
  settings: Billiards9BallSettings;
  rngSeed: number;
  // Balls 1-9; the lowest non-pocketed ball must be hit first
  pocketed: boolean[];   // index 0 = ball 1, index 8 = ball 9
  lowestBall: number;    // 1-9
  angle: number;         // aim 0..1
  power: number;         // power 0..1
  phase: "aim" | "result" | "done";
  lastResult: string;
  winner: boolean;       // true = player wins
  turns: number;
  fouls: number;
}

export type Billiards9BallAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "shoot" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function calcLowest(pocketed: boolean[]): number {
  for (let i = 0; i < 9; i++) {
    if (!pocketed[i]) return i + 1;
  }
  return 10; // all pocketed
}

function shotQuality(angle: number, power: number, difficulty: "easy" | "medium" | "hard"): number {
  const tol = difficulty === "easy" ? 0.42 : difficulty === "medium" ? 0.28 : 0.16;
  const angleDev = Math.abs(angle - 0.5);
  const powerDev = Math.abs(power - 0.65);
  return Math.max(0, 1 - angleDev / tol - powerDev * 1.5);
}

export function initialState(seed: number, settings: Billiards9BallSettings): Billiards9BallState {
  return {
    settings,
    rngSeed: seed >>> 0,
    pocketed: Array(9).fill(false),
    lowestBall: 1,
    angle: 0.5,
    power: 0.65,
    phase: "aim",
    lastResult: "",
    winner: false,
    turns: 0,
    fouls: 0,
  };
}

export function reducer(state: Billiards9BallState, action: Billiards9BallAction): Billiards9BallState {
  if (state.winner) return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "shoot" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const newSeed = nextSeed(seed1);
    const rng = mulberry32(seed1);
    const roll = rng();
    const quality = shotQuality(state.angle, state.power, state.settings.difficulty);

    // Legal hit: must contact lowest ball first
    const legalHit = roll < quality + 0.2; // easier to make legal contact
    const pocketLow = legalHit && rng() < quality * 0.85;

    // Combo: small chance to also pocket the 9-ball on a legal shot
    const pocket9Combo = legalHit && !pocketLow && state.lowestBall !== 9 && rng() < quality * 0.15;

    let newPocketed = [...state.pocketed];
    let lastResult = "";
    let winner = false;
    let fouls = state.fouls;

    if (!legalHit) {
      fouls++;
      lastResult = `Foul! Didn't hit ball ${state.lowestBall} first. (${fouls} total fouls)`;
    } else if (pocketLow) {
      newPocketed[state.lowestBall - 1] = true;
      const newLowest = calcLowest(newPocketed);
      if (state.lowestBall === 9 || newLowest > 9) {
        winner = true;
        lastResult = "Sank the 9-ball — YOU WIN!";
      } else {
        lastResult = `Sank ball ${state.lowestBall}! Next: ball ${newLowest}.`;
      }
    } else if (pocket9Combo) {
      newPocketed[8] = true;
      winner = true;
      lastResult = `Combo! Sank ball ${state.lowestBall} and the 9-ball — YOU WIN!`;
      newPocketed[state.lowestBall - 1] = true;
    } else {
      lastResult = `Legal hit on ball ${state.lowestBall} — no pocket.`;
    }

    const lowestBall = calcLowest(newPocketed);

    return {
      ...state,
      rngSeed: newSeed,
      pocketed: newPocketed,
      lowestBall,
      lastResult,
      winner,
      fouls,
      turns: state.turns + 1,
      phase: winner ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: Billiards9BallState): { score: number } | null {
  if (!state.winner) return null;
  const baseScore = 1000;
  const penalty = state.fouls * 50 + state.turns * 5;
  return { score: Math.max(100, baseScore - penalty) };
}
