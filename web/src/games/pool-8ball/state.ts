import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Pool8BallSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type BallGroup = "solids" | "stripes" | "unassigned";

export interface Ball {
  id: number;       // 1-15, plus 0 = cue
  pocketed: boolean;
}

export interface Pool8BallState {
  settings: Pool8BallSettings;
  rngSeed: number;
  // Balls 1-7 = solids, 8 = eight-ball, 9-15 = stripes
  balls: Ball[];
  playerGroup: BallGroup;      // player's assigned group
  botGroup: BallGroup;
  currentTurn: "player" | "bot";
  targetBall: number | null;   // ball ID the player picked this turn
  angle: number;               // aim angle 0..1
  power: number;               // shot power 0..1
  phase: "pick" | "aim" | "result" | "done";
  lastResult: string;
  winner: "player" | "bot" | null;
  turnCount: number;
}

export type Pool8BallAction =
  | { type: "pick-ball"; ballId: number }
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "shoot" }
  | { type: "next-turn" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function shotSuccess(angle: number, power: number, seed: number, difficulty: "easy" | "medium" | "hard"): boolean {
  const tolerance = difficulty === "easy" ? 0.38 : difficulty === "medium" ? 0.26 : 0.16;
  const angleDev = Math.abs(angle - 0.5);
  const powerDev = Math.abs(power - 0.6);
  const quality = Math.max(0, 1 - angleDev / tolerance - powerDev / 0.5);
  const rng = mulberry32(seed);
  return rng() < quality;
}

function botShotSuccess(seed: number): boolean {
  const rng = mulberry32(seed);
  return rng() < 0.52; // bot sinks ~52% of shots
}

function getBotTarget(state: Pool8BallState): number | null {
  const botBalls = state.balls.filter(
    (b) =>
      !b.pocketed &&
      ((state.botGroup === "solids" && b.id >= 1 && b.id <= 7) ||
       (state.botGroup === "stripes" && b.id >= 9 && b.id <= 15) ||
       state.botGroup === "unassigned")
  );
  if (botBalls.length === 0) return 8;
  return botBalls[0]!.id;
}

export function initialState(seed: number, settings: Pool8BallSettings): Pool8BallState {
  return {
    settings,
    rngSeed: seed >>> 0,
    balls: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, pocketed: false })),
    playerGroup: "unassigned",
    botGroup: "unassigned",
    currentTurn: "player",
    targetBall: null,
    angle: 0.5,
    power: 0.6,
    phase: "pick",
    lastResult: "",
    winner: null,
    turnCount: 0,
  };
}

export function reducer(state: Pool8BallState, action: Pool8BallAction): Pool8BallState {
  if (state.winner !== null) return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "pick-ball" && state.phase === "pick" && state.currentTurn === "player") {
    const ball = state.balls.find((b) => b.id === action.ballId);
    if (!ball || ball.pocketed) return state;
    // Can only pick group balls (or 8-ball if all group balls gone)
    const canPick8 =
      state.playerGroup !== "unassigned" &&
      state.balls.filter(
        (b) =>
          !b.pocketed &&
          ((state.playerGroup === "solids" && b.id >= 1 && b.id <= 7) ||
           (state.playerGroup === "stripes" && b.id >= 9 && b.id <= 15))
      ).length === 0;

    if (ball.id === 8 && !canPick8) return state;
    if (state.playerGroup === "solids" && (ball.id < 1 || ball.id > 7) && ball.id !== 8) return state;
    if (state.playerGroup === "stripes" && (ball.id < 9 || ball.id > 15) && ball.id !== 8) return state;
    return { ...state, targetBall: action.ballId, phase: "aim" };
  }

  if (action.type === "shoot" && state.phase === "aim" && state.currentTurn === "player") {
    const seed1 = state.rngSeed;
    const newSeed = nextSeed(seed1);
    const success = shotSuccess(state.angle, state.power, seed1, state.settings.difficulty);
    const newBalls = state.balls.map((b) => b.id === state.targetBall && success ? { ...b, pocketed: true } : b);

    // Assign groups on first sink
    let playerGroup = state.playerGroup;
    let botGroup = state.botGroup;
    if (success && state.targetBall !== 8 && playerGroup === "unassigned") {
      playerGroup = (state.targetBall! >= 1 && state.targetBall! <= 7) ? "solids" : "stripes";
      botGroup = playerGroup === "solids" ? "stripes" : "solids";
    }

    let winner: "player" | "bot" | null = state.winner;
    let lastResult = "";
    let nextTurn: "player" | "bot" = "player";

    if (success) {
      if (state.targetBall === 8) {
        // Check if 8-ball was sunk legally
        const myBalls = newBalls.filter(
          (b) => !b.pocketed &&
          ((playerGroup === "solids" && b.id >= 1 && b.id <= 7) ||
           (playerGroup === "stripes" && b.id >= 9 && b.id <= 15))
        );
        winner = myBalls.length === 0 ? "player" : "bot"; // sinking 8 early = lose
        lastResult = myBalls.length === 0 ? "Sank the 8-ball — YOU WIN!" : "Sank 8-ball early — you lose!";
      } else {
        lastResult = `Sank ball ${state.targetBall}! Shoot again.`;
        nextTurn = "player"; // continue turn on sink
      }
    } else {
      lastResult = `Missed ball ${state.targetBall}. Bot's turn.`;
      nextTurn = "bot";
    }

    return {
      ...state,
      rngSeed: newSeed,
      balls: newBalls,
      playerGroup,
      botGroup,
      winner,
      lastResult,
      currentTurn: winner !== null ? "player" : success ? "player" : "bot",
      phase: winner !== null ? "done" : "result",
      turnCount: state.turnCount + 1,
    };
  }

  if (action.type === "next-turn" && state.phase === "result") {
    if (state.currentTurn === "player") {
      // Player continues their turn
      return { ...state, phase: "pick", targetBall: null };
    }

    // Bot's turn
    let seed = state.rngSeed;
    let newBalls = [...state.balls];
    let winner: "player" | "bot" | null = state.winner;
    let lastResult = "";
    let botGroup = state.botGroup;
    let playerGroup = state.playerGroup;
    let botMisses = false;

    while (!botMisses && winner === null) {
      const target = getBotTarget({ ...state, balls: newBalls, botGroup });
      if (target === null) break;
      const newSeed = nextSeed(seed);
      const success = botShotSuccess(seed);
      seed = newSeed;

      if (success) {
        newBalls = newBalls.map((b) => b.id === target ? { ...b, pocketed: true } : b);
        if (botGroup === "unassigned" && target !== 8) {
          botGroup = (target >= 1 && target <= 7) ? "solids" : "stripes";
          playerGroup = botGroup === "solids" ? "stripes" : "solids";
        }
        if (target === 8) {
          const botBallsLeft = newBalls.filter(
            (b) => !b.pocketed &&
            ((botGroup === "solids" && b.id >= 1 && b.id <= 7) ||
             (botGroup === "stripes" && b.id >= 9 && b.id <= 15))
          );
          winner = botBallsLeft.length === 0 ? "bot" : "player";
          lastResult = botBallsLeft.length === 0 ? "Bot sank the 8-ball — bot wins!" : "Bot sank 8-ball early — you win!";
        } else {
          lastResult = `Bot sank ball ${target}.`;
        }
      } else {
        lastResult = `Bot missed ball ${target}. Your turn.`;
        botMisses = true;
      }
    }

    return {
      ...state,
      rngSeed: seed,
      balls: newBalls,
      playerGroup,
      botGroup,
      winner,
      lastResult,
      currentTurn: "player",
      phase: winner !== null ? "done" : "pick",
      targetBall: null,
      turnCount: state.turnCount + 1,
    };
  }

  return state;
}

export function isTerminal(state: Pool8BallState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "player" ? 1000 : 0 };
}
