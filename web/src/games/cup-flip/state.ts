export type Phase = "sliding" | "flipped" | "gameover";

// Cup shuffle + find game: watch cups, flip one, score if correct
export interface CupFlipState {
  phase: Phase;
  // 3 cups at positions 0,1,2
  cupPositions: [number, number, number]; // which visual slot each cup is in
  ballUnder: number;   // cup index (0,1,2) that hides the ball
  shuffleStep: number;
  totalShuffles: number;
  shuffleT: number;    // animation time for current shuffle
  swapA: number;       // cups being swapped in current step
  swapB: number;
  revealed: boolean;
  chosenCup: number;
  correct: boolean;
  lastPts: number;
  score: number;
  round: number;
  maxRounds: number;
  speed: number;
}

export type CupFlipAction =
  | { type: "tick"; dt: number }
  | { type: "choose"; cup: number }
  | { type: "next" };

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generateShuffles(seed: number, count: number): Array<[number, number]> {
  const rng = mulberry32(seed);
  const result: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    let a = Math.floor(rng() * 3);
    let b = Math.floor(rng() * 3);
    while (b === a) b = Math.floor(rng() * 3);
    result.push([a, b]);
  }
  return result;
}

export function initialState(seed = 1): CupFlipState {
  const rng = mulberry32(seed);
  const round = 1;
  const shuffleCount = 3 + round * 2;
  const shuffles = generateShuffles(seed + 100, shuffleCount);
  const ballUnder = Math.floor(rng() * 3);
  const [swapA, swapB] = shuffles[0] ?? [0, 1];
  return {
    phase: "sliding",
    cupPositions: [0, 1, 2],
    ballUnder,
    shuffleStep: 0,
    totalShuffles: shuffleCount,
    shuffleT: 0,
    swapA,
    swapB,
    revealed: false,
    chosenCup: -1,
    correct: false,
    lastPts: 0,
    score: 0,
    round,
    maxRounds: 6,
    speed: 1.5,
  };
}

export function reducer(state: CupFlipState, action: CupFlipAction): CupFlipState {
  if (state.phase === "gameover") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "sliding") return state;
      const newT = state.shuffleT + state.speed * action.dt;
      if (newT >= 1) {
        // Complete this swap
        const pos = [...state.cupPositions] as [number, number, number];
        const tmp = pos[state.swapA] ?? state.swapA;
        pos[state.swapA] = pos[state.swapB] ?? state.swapB;
        pos[state.swapB] = tmp;
        const nextStep = state.shuffleStep + 1;
        if (nextStep >= state.totalShuffles) {
          // Shuffling done — wait for player
          return { ...state, cupPositions: pos, shuffleT: 1, shuffleStep: nextStep, phase: "flipped" };
        }
        // Next shuffle
        const rng = mulberry32(state.round * 1000 + nextStep);
        let a = Math.floor(rng() * 3);
        let b = Math.floor(rng() * 3);
        while (b === a) b = Math.floor(rng() * 3);
        return { ...state, cupPositions: pos, shuffleStep: nextStep, shuffleT: 0, swapA: a, swapB: b };
      }
      return { ...state, shuffleT: newT };
    }

    case "choose": {
      if (state.phase !== "flipped") return state;
      const correct = action.cup === state.ballUnder;
      const shuffleDifficulty = state.totalShuffles;
      const pts = correct ? Math.round(20 + shuffleDifficulty * 5) : 0;
      const isLast = state.round >= state.maxRounds;
      return {
        ...state,
        revealed: true,
        chosenCup: action.cup,
        correct,
        lastPts: pts,
        score: state.score + pts,
        phase: isLast ? "gameover" : "flipped",
      };
    }

    case "next": {
      if (!state.revealed) return state;
      return nextRound(state);
    }

    default:
      return state;
  }
}

export function nextRound(state: CupFlipState): CupFlipState {
  const nextR = state.round + 1;
  const seed = nextR * 57 + 13;
  const rng = mulberry32(seed);
  const shuffleCount = 3 + nextR * 2;
  const ballUnder = Math.floor(rng() * 3);
  const rng2 = mulberry32(seed + 100);
  let a = Math.floor(rng2() * 3);
  let b = Math.floor(rng2() * 3);
  while (b === a) b = Math.floor(rng2() * 3);
  return {
    phase: "sliding",
    cupPositions: [0, 1, 2],
    ballUnder,
    shuffleStep: 0,
    totalShuffles: shuffleCount,
    shuffleT: 0,
    swapA: a,
    swapB: b,
    revealed: false,
    chosenCup: -1,
    correct: false,
    lastPts: 0,
    score: state.score,
    round: nextR,
    maxRounds: state.maxRounds,
    speed: 1.5 + nextR * 0.3,
  };
}

export function isTerminal(state: CupFlipState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.score };
}
