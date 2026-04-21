import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HorseshoesSettings {
  targetScore: "11" | "21" | "15";
}

export type TossResult = "ringer" | "leaner" | "close" | "miss";

export interface TossOutcome {
  result: TossResult;
  points: number;
  distance: number; // notional distance in inches from peg
}

export interface TurnResult {
  player: [TossOutcome, TossOutcome];
  bot: [TossOutcome, TossOutcome];
  playerNet: number; // points scored this turn (cancellation scoring)
  botNet: number;
}

export interface HorseshoesState {
  settings: HorseshoesSettings;
  rngSeed: number;
  targetScore: number;
  playerScore: number;
  botScore: number;
  turn: number;
  power: number;     // player's toss power 0..1 (set by slider)
  aim: number;       // player's aim 0..1
  lastTurn: TurnResult | null;
  winner: "player" | "bot" | null;
  phase: "toss" | "result";
}

export type HorseshoesAction =
  | { type: "set-power"; power: number }
  | { type: "set-aim"; aim: number }
  | { type: "toss" };

function tossResult(power: number, aim: number, seed: number): TossOutcome {
  // Ideal power = 0.7, ideal aim = 0.5
  const rng = mulberry32(seed);
  const r1 = rng();
  const r2 = rng();
  const powerDev = Math.abs(power - 0.7) * 0.8;
  const aimDev = Math.abs(aim - 0.5) * 1.2;
  const quality = Math.max(0, 1 - powerDev - aimDev + (r1 - 0.5) * 0.4);
  // Distance from peg in notional inches (0 = ringer)
  const distance = Math.max(0, (1 - quality) * 30 + r2 * 8);
  let result: TossResult;
  let points: number;
  if (distance < 1) {
    result = "ringer"; points = 3;
  } else if (distance < 3) {
    result = "leaner"; points = 2;
  } else if (distance < 6) {
    result = "close"; points = 1;
  } else {
    result = "miss"; points = 0;
  }
  return { result, points, distance };
}

function botToss(seed: number): TossOutcome {
  // Bot has moderate skill: power=0.7 aim=0.5 with some variation
  const rng = mulberry32(seed);
  const powerVar = 0.6 + rng() * 0.2;
  const aimVar = 0.4 + rng() * 0.2;
  return tossResult(powerVar, aimVar, seed + 1);
}

function nextSeed(seed: number): number {
  return mulberry32(seed)() * 2 ** 31 >>> 0;
}

/** Cancellation scoring: ringers cancel ringers; then closest counts */
function cancelScore(p: [TossOutcome, TossOutcome], b: [TossOutcome, TossOutcome]): [number, number] {
  const pRingers = p.filter((t) => t.result === "ringer").length;
  const bRingers = b.filter((t) => t.result === "ringer").length;
  if (pRingers > 0 || bRingers > 0) {
    const netRingers = pRingers - bRingers;
    if (netRingers > 0) return [netRingers * 3, 0];
    if (netRingers < 0) return [0, -netRingers * 3];
    return [0, 0]; // equal ringers cancel
  }
  // No ringers — closest non-cancelled shoe scores
  const pPts = p.reduce((s, t) => s + t.points, 0);
  const bPts = b.reduce((s, t) => s + t.points, 0);
  if (pPts > bPts) return [pPts - bPts, 0];
  if (bPts > pPts) return [0, bPts - pPts];
  return [0, 0];
}

export function initialState(seed: number, settings: HorseshoesSettings): HorseshoesState {
  return {
    settings,
    rngSeed: seed >>> 0,
    targetScore: parseInt(settings.targetScore, 10),
    playerScore: 0,
    botScore: 0,
    turn: 1,
    power: 0.7,
    aim: 0.5,
    lastTurn: null,
    winner: null,
    phase: "toss",
  };
}

export function reducer(state: HorseshoesState, action: HorseshoesAction): HorseshoesState {
  if (action.type === "set-power") return { ...state, power: Math.min(1, Math.max(0, action.power)) };
  if (action.type === "set-aim") return { ...state, aim: Math.min(1, Math.max(0, action.aim)) };

  if (action.type === "toss") {
    if (state.winner !== null || state.phase !== "toss") return state;

    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const seed3 = nextSeed(seed2);
    const seed4 = nextSeed(seed3);
    const newSeed = nextSeed(seed4);

    const p1 = tossResult(state.power, state.aim, seed1);
    const p2 = tossResult(state.power, state.aim, seed2);
    const b1 = botToss(seed3);
    const b2 = botToss(seed4);

    const [pNet, bNet] = cancelScore([p1, p2], [b1, b2]);
    const newPlayerScore = state.playerScore + pNet;
    const newBotScore = state.botScore + bNet;

    const winner: HorseshoesState["winner"] =
      newPlayerScore >= state.targetScore ? "player" :
      newBotScore >= state.targetScore ? "bot" : null;

    return {
      ...state,
      rngSeed: newSeed,
      playerScore: newPlayerScore,
      botScore: newBotScore,
      turn: state.turn + 1,
      lastTurn: { player: [p1, p2], bot: [b1, b2], playerNet: pNet, botNet: bNet },
      winner,
      phase: winner !== null ? "result" : "toss",
    };
  }

  return state;
}

export function isTerminal(state: HorseshoesState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "player" ? 1000 + state.playerScore : 0 };
}
