import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TennisServeSettings {
  serves: "10" | "20";
}

export type ServeResult = "ace" | "in" | "fault" | "double-fault";

export interface Serve {
  angle: number;
  power: number;
  wind: number;
  result: ServeResult;
  isSecond: boolean;
}

export interface TennisServeState {
  settings: TennisServeSettings;
  rngSeed: number;
  totalPoints: number;   // number of service points
  pointIndex: number;
  serves: Serve[];
  angle: number;         // 0..1, ideal varies (serving to deuce=0.4, ad=0.6)
  power: number;         // 0..1, ideal 0.8 for first, 0.65 for second
  wind: number;
  isSecondServe: boolean;
  phase: "aim" | "result" | "done";
  lastResult: string;
  aceCount: number;
  faultCount: number;
  doubleFaultCount: number;
}

export type TennisServeAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "serve" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function serveHitsBox(angle: number, power: number, wind: number, isSecond: boolean, seed: number): { hits: boolean; isAce: boolean } {
  const rng = mulberry32(seed);
  const idealAngle = 0.5; // neutral
  const idealPower = isSecond ? 0.65 : 0.8;
  const angleDev = Math.abs(angle - idealAngle) + Math.abs(wind) * 0.25;
  const powerDev = Math.abs(power - idealPower);
  const quality = Math.max(0, 1 - angleDev / 0.3 - powerDev / 0.35);

  const hits = rng() < quality;
  // Ace: rare bonus — high quality & power (hard serve)
  const isAce = hits && power > 0.75 && rng() < quality * 0.4;
  return { hits, isAce };
}

export function initialState(seed: number, settings: TennisServeSettings): TennisServeState {
  const totalPoints = parseInt(settings.serves, 10);
  const rng = mulberry32(seed);
  const firstWind = (rng() - 0.5) * 0.4;
  return {
    settings,
    rngSeed: seed >>> 0,
    totalPoints,
    pointIndex: 0,
    serves: [],
    angle: 0.5,
    power: 0.8,
    wind: firstWind,
    isSecondServe: false,
    phase: "aim",
    lastResult: "",
    aceCount: 0,
    faultCount: 0,
    doubleFaultCount: 0,
  };
}

export function reducer(state: TennisServeState, action: TennisServeAction): TennisServeState {
  if (state.phase === "done") return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "serve" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const { hits, isAce } = serveHitsBox(state.angle, state.power, state.wind, state.isSecondServe, seed1);

    let result: ServeResult;
    let lastResult = "";
    let newAceCount = state.aceCount;
    let newFaultCount = state.faultCount;
    let newDoubleFaultCount = state.doubleFaultCount;
    let newPointIndex = state.pointIndex;
    let newIsSecond = false;

    const newServe: Serve = { angle: state.angle, power: state.power, wind: state.wind, result: "in", isSecond: state.isSecondServe };

    if (isAce) {
      result = "ace";
      newAceCount++;
      lastResult = "ACE! Unreturnable serve!";
      newServe.result = "ace";
      newPointIndex++;
    } else if (hits) {
      result = "in";
      lastResult = state.isSecondServe ? "Second serve IN — rally begins." : "First serve IN!";
      newServe.result = "in";
      newPointIndex++;
    } else if (!state.isSecondServe) {
      result = "fault";
      newFaultCount++;
      lastResult = "FAULT — second serve.";
      newServe.result = "fault";
      newIsSecond = true;
    } else {
      result = "double-fault";
      newDoubleFaultCount++;
      lastResult = "DOUBLE FAULT! Point lost.";
      newServe.result = "double-fault";
      newPointIndex++;
    }

    const done = newPointIndex >= state.totalPoints;

    // Generate next wind
    const rng = mulberry32(seed2);
    const nextWind = (rng() - 0.5) * 0.4;

    void result;

    return {
      ...state,
      rngSeed: seed2,
      serves: [...state.serves, newServe],
      pointIndex: newPointIndex,
      aceCount: newAceCount,
      faultCount: newFaultCount,
      doubleFaultCount: newDoubleFaultCount,
      isSecondServe: newIsSecond,
      wind: nextWind,
      power: newIsSecond ? 0.65 : 0.8,
      lastResult,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: TennisServeState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: aces = 100pts each, in = 50pts, double-fault = -30pts
  const score = state.aceCount * 100 + (state.serves.filter((s) => s.result === "in").length * 50) - state.doubleFaultCount * 30;
  return { score: Math.max(0, score) };
}
