import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PirateShipCannonSettings {
  rounds: "5" | "8";
}

export type ShotResult = "direct" | "close" | "splash" | "miss";

export interface Enemy {
  distance: number;    // 10..100
  speed: number;       // 1..5 (moves each round)
  position: number;    // current horizontal offset -5..5
  sunk: boolean;
}

export interface PirateShipCannonState {
  settings: PirateShipCannonSettings;
  round: number;
  totalRounds: number;
  enemy: Enemy;
  cannonPower: number;   // 10..100
  cannonAngle: number;   // -5..5
  score: number;
  lastShot: string;
  lastResult: ShotResult | null;
  gameOver: boolean;
  seed: number;
}

export type PirateShipCannonAction =
  | { type: "aimLeft" }
  | { type: "aimRight" }
  | { type: "powerUp" }
  | { type: "powerDown" }
  | { type: "fire" }
  | { type: "restart" };

function newEnemy(rng: () => number): Enemy {
  return {
    distance: Math.floor(rng() * 60) + 30,
    speed: Math.floor(rng() * 4) + 1,
    position: Math.floor(rng() * 11) - 5,
    sunk: false,
  };
}

export function initialState(seed: number, settings: PirateShipCannonSettings): PirateShipCannonState {
  const rng = mulberry32(seed);
  return {
    settings,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    enemy: newEnemy(rng),
    cannonPower: 50,
    cannonAngle: 0,
    score: 0,
    lastShot: "Aim and fire your cannon!",
    lastResult: null,
    gameOver: false,
    seed,
  };
}

function evaluateShot(power: number, angle: number, enemy: Enemy): ShotResult {
  const distanceDiff = Math.abs(power - enemy.distance);
  const angleDiff = Math.abs(angle - enemy.position);
  if (distanceDiff <= 5 && angleDiff === 0) return "direct";
  if (distanceDiff <= 10 && angleDiff <= 1) return "close";
  if (distanceDiff <= 20 && angleDiff <= 2) return "splash";
  return "miss";
}

const RESULT_POINTS: Record<ShotResult, number> = {
  direct: 150,
  close: 80,
  splash: 30,
  miss: 0,
};

export function reducer(state: PirateShipCannonState, action: PirateShipCannonAction): PirateShipCannonState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "aimLeft") return { ...state, cannonAngle: Math.max(-5, state.cannonAngle - 1) };
  if (action.type === "aimRight") return { ...state, cannonAngle: Math.min(5, state.cannonAngle + 1) };
  if (action.type === "powerUp") return { ...state, cannonPower: Math.min(100, state.cannonPower + 5) };
  if (action.type === "powerDown") return { ...state, cannonPower: Math.max(10, state.cannonPower - 5) };

  if (action.type === "fire") {
    const result = evaluateShot(state.cannonPower, state.cannonAngle, state.enemy);
    const pts = RESULT_POINTS[result];
    const sunk = result === "direct" || result === "close";
    const rng = mulberry32(state.seed + state.round * 37);
    const msg = result === "direct" ? `DIRECT HIT! Enemy sunk! +${pts}` :
                result === "close" ? `Close hit! Enemy taking damage! +${pts}` :
                result === "splash" ? `Splash! Near miss! +${pts}` : "Missed! Enemy sails on!";

    const nextRound = state.round + 1;
    const isLast = nextRound > state.totalRounds;

    // Enemy moves
    const newPos = Math.max(-5, Math.min(5, state.enemy.position + (rng() > 0.5 ? 1 : -1)));
    const newDist = Math.max(10, state.enemy.distance - state.enemy.speed);
    const nextEnemy = isLast ? state.enemy : newEnemy(mulberry32(state.seed + nextRound * 13));

    return {
      ...state,
      round: nextRound,
      enemy: isLast ? { ...state.enemy, sunk, position: newPos, distance: newDist } : nextEnemy,
      score: state.score + pts,
      lastShot: isLast ? `Battle over! Total: ${state.score + pts}` : msg,
      lastResult: result,
      gameOver: isLast,
      seed: state.seed + 19,
    };
  }

  return state;
}

export function isTerminal(state: PirateShipCannonState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, state.score) };
}
