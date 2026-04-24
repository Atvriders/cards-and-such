import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DNBPhase = "idle" | "showing" | "respond" | "feedback" | "done";
export type NLevel = "1" | "2" | "3";

export const GRID_SIZE = 3; // 3x3 grid
export const SOUND_POSITIONS = ["A","B","C","D","E","F","G","H"] as const;
export type SoundPosition = typeof SOUND_POSITIONS[number];

export interface DNBStimulus {
  gridCell: number; // 0..8
  sound: SoundPosition;
}

export interface DNBResponse {
  positionMatch: boolean | null; // player pressed L key
  soundMatch: boolean | null;    // player pressed R key
}

export interface DualNBackState {
  settings: { n: NLevel };
  phase: DNBPhase;
  n: number;
  stimuli: readonly DNBStimulus[];
  currentIndex: number;
  responses: readonly DNBResponse[];
  currentResponse: DNBResponse;
  score: number;
  totalTrials: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  rngSeed: number;
  rngCounter: number;
}

export type DNBAction =
  | { type: "start" }
  | { type: "next-stimulus" }
  | { type: "press-position" }
  | { type: "press-sound" }
  | { type: "confirm" };

function randomStimulus(seed: number, counter: number): DNBStimulus {
  const rng = mulberry32(seed + counter * 999983);
  const gridCell = Math.floor(rng() * 9);
  const soundIdx = Math.floor(rng() * SOUND_POSITIONS.length);
  return { gridCell, sound: SOUND_POSITIONS[soundIdx]! };
}

function generateStimuli(seed: number, n: number, totalTrials: number): DNBStimulus[] {
  const stims: DNBStimulus[] = [];
  for (let i = 0; i < totalTrials; i++) {
    // ~33% chance of position match at n-back, ~33% sound match
    const rng = mulberry32(seed + i * 999983);
    const posMatch = i >= n && rng() < 0.33;
    const soundMatch = i >= n && rng() < 0.33;
    if (i >= n && posMatch && stims[i - n]) {
      const base = randomStimulus(seed, i * 100 + 1);
      stims.push({ gridCell: stims[i - n]!.gridCell, sound: soundMatch ? stims[i - n]!.sound : base.sound });
    } else if (i >= n && soundMatch && stims[i - n]) {
      const base = randomStimulus(seed, i * 100 + 2);
      stims.push({ gridCell: base.gridCell, sound: stims[i - n]!.sound });
    } else {
      stims.push(randomStimulus(seed, i * 100 + 3));
    }
  }
  return stims;
}

export function initialState(
  seed: number,
  settings: { n: NLevel },
): DualNBackState {
  return {
    settings,
    phase: "idle",
    n: parseInt(settings.n, 10),
    stimuli: [],
    currentIndex: 0,
    responses: [],
    currentResponse: { positionMatch: null, soundMatch: null },
    score: 0,
    totalTrials: 20 + parseInt(settings.n, 10) * 5,
    hits: 0,
    misses: 0,
    falseAlarms: 0,
    rngSeed: seed,
    rngCounter: 0,
  };
}

function scoreResponse(
  stims: readonly DNBStimulus[],
  index: number,
  n: number,
  response: DNBResponse,
): { hits: number; misses: number; falseAlarms: number } {
  let hits = 0; let misses = 0; let falseAlarms = 0;
  if (index < n) return { hits, misses, falseAlarms };

  const prev = stims[index - n]!;
  const curr = stims[index]!;

  const posActual = curr.gridCell === prev.gridCell;
  const soundActual = curr.sound === prev.sound;

  const posPressed = response.positionMatch === true;
  const soundPressed = response.soundMatch === true;

  if (posActual && posPressed) hits++;
  else if (posActual && !posPressed) misses++;
  else if (!posActual && posPressed) falseAlarms++;

  if (soundActual && soundPressed) hits++;
  else if (soundActual && !soundPressed) misses++;
  else if (!soundActual && soundPressed) falseAlarms++;

  return { hits, misses, falseAlarms };
}

export function reducer(state: DualNBackState, action: DNBAction): DualNBackState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const n = parseInt(state.settings.n, 10);
      const totalTrials = 20 + n * 5;
      const stims = generateStimuli(state.rngSeed, n, totalTrials);
      return {
        ...state,
        phase: "showing",
        n,
        stimuli: stims,
        currentIndex: 0,
        responses: [],
        currentResponse: { positionMatch: null, soundMatch: null },
        score: 0,
        totalTrials,
        hits: 0,
        misses: 0,
        falseAlarms: 0,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "next-stimulus": {
      if (state.phase === "showing") {
        // Move to respond phase for current stimulus (if index >= n)
        if (state.currentIndex >= state.n) {
          return { ...state, phase: "respond", currentResponse: { positionMatch: null, soundMatch: null } };
        }
        // Not yet at n-back, skip respond
        const nextIdx = state.currentIndex + 1;
        if (nextIdx >= state.totalTrials) {
          return { ...state, phase: "done" };
        }
        return { ...state, currentIndex: nextIdx };
      }
      return state;
    }

    case "press-position": {
      if (state.phase !== "respond") return state;
      const cur = state.currentResponse;
      return {
        ...state,
        currentResponse: { ...cur, positionMatch: !cur.positionMatch },
      };
    }

    case "press-sound": {
      if (state.phase !== "respond") return state;
      const cur = state.currentResponse;
      return {
        ...state,
        currentResponse: { ...cur, soundMatch: !cur.soundMatch },
      };
    }

    case "confirm": {
      if (state.phase !== "respond") return state;
      const { hits, misses, falseAlarms } = scoreResponse(
        state.stimuli,
        state.currentIndex,
        state.n,
        state.currentResponse,
      );
      const newResponses = [...state.responses, state.currentResponse];
      const nextIdx = state.currentIndex + 1;
      const done = nextIdx >= state.totalTrials;
      const roundScore = hits * 10 - falseAlarms * 5;
      return {
        ...state,
        phase: done ? "done" : "showing",
        currentIndex: nextIdx,
        responses: newResponses,
        hits: state.hits + hits,
        misses: state.misses + misses,
        falseAlarms: state.falseAlarms + falseAlarms,
        score: state.score + roundScore,
        currentResponse: { positionMatch: null, soundMatch: null },
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DualNBackState): { score: number } | null {
  if (state.phase !== "done") return null;
  const finalScore = Math.max(0, state.score);
  return { score: finalScore };
}
