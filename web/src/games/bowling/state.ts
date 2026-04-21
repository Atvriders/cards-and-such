import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BowlingSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Frame {
  rolls: number[];        // pin counts per roll in this frame
  isStrike: boolean;
  isSpare: boolean;
  score: number | null;  // computed score (null = not yet finalized)
}

export interface BowlingState {
  settings: BowlingSettings;
  rngSeed: number;
  frames: Frame[];        // 10 frames
  currentFrame: number;   // 0-9
  rollInFrame: number;    // 0 or 1 (or 0-2 for 10th frame)
  pinsUp: number;         // pins remaining this frame
  allRolls: number[];     // flat list of all rolls so far (for scoring)
  totalScore: number;
  gameOver: boolean;
  lastKnocked: number;
}

export type BowlingAction = { type: "roll"; angle: number };

/** Angle tolerance by difficulty — tighter tolerance = harder. angle is 0..1. */
function knockedPins(angle: number, pinsStanding: number, seed: number, difficulty: "easy" | "medium" | "hard"): number {
  // Ideal angle is 0.5. Deviation from ideal reduces hit chance.
  const tolerance = difficulty === "easy" ? 0.45 : difficulty === "medium" ? 0.3 : 0.18;
  const deviation = Math.abs(angle - 0.5);
  const quality = Math.max(0, 1 - deviation / tolerance);
  const rng = mulberry32(seed);
  const roll = rng();
  // Expected pins = quality * pinsStanding (biased toward full when perfect)
  const expected = quality * pinsStanding;
  // Add Gaussian-like noise via two uniform samples
  const noise = (rng() - 0.5) * 2 * pinsStanding * 0.3;
  const raw = Math.round(Math.min(pinsStanding, Math.max(0, expected + noise * roll)));
  return raw;
}

function computeScore(allRolls: number[]): number[] {
  const scores: number[] = [];
  let ri = 0;
  for (let f = 0; f < 10; f++) {
    if (ri >= allRolls.length) break;
    const r1 = allRolls[ri] ?? 0;
    if (r1 === 10) {
      // Strike
      const bonus = (allRolls[ri + 1] ?? 0) + (allRolls[ri + 2] ?? 0);
      scores.push(10 + bonus);
      ri++;
    } else {
      const r2 = allRolls[ri + 1] ?? 0;
      if (r1 + r2 === 10) {
        // Spare
        const bonus = allRolls[ri + 2] ?? 0;
        scores.push(10 + bonus);
      } else {
        scores.push(r1 + r2);
      }
      ri += 2;
    }
  }
  return scores;
}

function nextSeed(seed: number): number {
  return mulberry32(seed)() * 2 ** 31 >>> 0;
}

export function initialState(seed: number, settings: BowlingSettings): BowlingState {
  return {
    settings,
    rngSeed: seed >>> 0,
    frames: Array.from({ length: 10 }, () => ({ rolls: [], isStrike: false, isSpare: false, score: null })),
    currentFrame: 0,
    rollInFrame: 0,
    pinsUp: 10,
    allRolls: [],
    totalScore: 0,
    gameOver: false,
    lastKnocked: 0,
  };
}

export function reducer(state: BowlingState, action: BowlingAction): BowlingState {
  if (action.type !== "roll") return state;
  if (state.gameOver) return state;

  const knocked = knockedPins(action.angle, state.pinsUp, state.rngSeed, state.settings.difficulty);
  const newSeed = nextSeed(state.rngSeed);
  const newAllRolls = [...state.allRolls, knocked];
  const newFrames = state.frames.map((f) => ({ ...f }));
  let { currentFrame, rollInFrame, pinsUp } = state;

  const frame = newFrames[currentFrame]!;
  frame.rolls = [...frame.rolls, knocked];

  let nextFrame = currentFrame;
  let nextRollInFrame = rollInFrame + 1;
  let nextPinsUp = pinsUp - knocked;
  let gameOver = false;

  if (currentFrame < 9) {
    // Frames 0-8
    if (rollInFrame === 0 && knocked === 10) {
      // Strike
      frame.isStrike = true;
      nextFrame = currentFrame + 1;
      nextRollInFrame = 0;
      nextPinsUp = 10;
    } else if (rollInFrame === 1) {
      frame.isSpare = pinsUp - knocked === 0;
      nextFrame = currentFrame + 1;
      nextRollInFrame = 0;
      nextPinsUp = 10;
    } else {
      // rollInFrame === 0 but not strike — stay in frame
      nextPinsUp = 10 - knocked;
    }
  } else {
    // 10th frame — up to 3 rolls
    if (rollInFrame === 0) {
      if (knocked === 10) {
        nextPinsUp = 10; // reset for 2nd roll after strike
      } else {
        nextPinsUp = 10 - knocked;
      }
    } else if (rollInFrame === 1) {
      const r1 = frame.rolls[0]!;
      if (r1 === 10) {
        // Had a strike in 1st roll — 2nd roll happens, reset pins if also strike
        if (knocked === 10) nextPinsUp = 10;
        else nextPinsUp = 10 - knocked;
      } else if (r1 + knocked === 10) {
        // Spare — get 3rd roll
        frame.isSpare = true;
        nextPinsUp = 10;
      } else {
        // No spare, no bonus roll
        gameOver = true;
      }
    } else if (rollInFrame === 2) {
      // 3rd roll in 10th frame — done
      gameOver = true;
    }

    if (!gameOver) {
      nextRollInFrame = rollInFrame + 1;
      nextFrame = 9;
    }
  }

  const frameScores = computeScore(newAllRolls);
  let total = 0;
  const finalFrames = newFrames.map((f, i) => {
    if (i < frameScores.length) {
      const partial = frameScores.slice(0, i + 1).reduce((a, b) => a + b, 0);
      total = partial;
      return { ...f, score: frameScores.slice(0, i + 1).reduce((a, b) => a + b, 0) };
    }
    return f;
  });

  return {
    ...state,
    rngSeed: newSeed,
    frames: finalFrames,
    currentFrame: nextFrame,
    rollInFrame: nextRollInFrame,
    pinsUp: nextPinsUp,
    allRolls: newAllRolls,
    totalScore: total,
    gameOver,
    lastKnocked: knocked,
  };
}

export function isTerminal(state: BowlingState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.totalScore };
}
