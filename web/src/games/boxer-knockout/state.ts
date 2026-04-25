import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BoxerSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface BoxerState {
  settings: BoxerSettings;
  playerHP: number;
  opponentHP: number;
  round: number;
  maxRounds: number;
  playerStamina: number;
  opponentStamina: number;
  lastResult: "hit" | "miss" | "blocked" | "counter" | null;
  playerAction: "idle" | "punch" | "block" | "dodge";
  opponentAction: "idle" | "punch" | "block" | "dodge";
  over: boolean;
  winner: "player" | "opponent" | null;
  rngSeed: number;
  score: number;
}

export type BoxerAction =
  | { type: "punch" }
  | { type: "block" }
  | { type: "dodge" }
  | { type: "nextRound" };

const MAX_HP = 100;
const MAX_STAMINA = 100;

const DIFFICULTY = {
  easy: { oppBlock: 0.2, oppDodge: 0.1, oppPunch: 0.5 },
  medium: { oppBlock: 0.35, oppDodge: 0.2, oppPunch: 0.65 },
  hard: { oppBlock: 0.5, oppDodge: 0.3, oppPunch: 0.8 },
};

function opponentDecide(seed: number, difficulty: BoxerSettings["difficulty"]): { action: "punch" | "block" | "dodge"; nextSeed: number } {
  const rng = mulberry32(seed);
  const val = rng();
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const d = DIFFICULTY[difficulty];
  let action: "punch" | "block" | "dodge";
  if (val < d.oppBlock) action = "block";
  else if (val < d.oppBlock + d.oppDodge) action = "dodge";
  else action = "punch";
  return { action, nextSeed };
}

export function initialState(seed: number, settings: BoxerSettings): BoxerState {
  return {
    settings,
    playerHP: MAX_HP,
    opponentHP: MAX_HP,
    round: 1,
    maxRounds: 5,
    playerStamina: MAX_STAMINA,
    opponentStamina: MAX_STAMINA,
    lastResult: null,
    playerAction: "idle",
    opponentAction: "idle",
    over: false,
    winner: null,
    rngSeed: seed,
    score: 0,
  };
}

export function reducer(state: BoxerState, action: BoxerAction): BoxerState {
  if (state.over) return state;

  switch (action.type) {
    case "punch":
    case "block":
    case "dodge": {
      const playerAction = action.type;
      const { action: opponentAction, nextSeed } = opponentDecide(state.rngSeed, state.settings.difficulty);

      let playerHP = state.playerHP;
      let opponentHP = state.opponentHP;
      let playerStamina = Math.min(MAX_STAMINA, state.playerStamina + 10);
      let lastResult: BoxerState["lastResult"] = null;
      let score = state.score;

      // Resolve combat
      if (playerAction === "punch") {
        if (opponentAction === "punch") {
          // Both punch — trade
          playerHP -= 15;
          opponentHP -= 15;
          lastResult = "hit";
          score += 5;
        } else if (opponentAction === "block") {
          // Opponent blocks — reduced damage
          opponentHP -= 5;
          lastResult = "blocked";
          score += 1;
        } else {
          // Opponent dodges — miss
          lastResult = "miss";
        }
      } else if (playerAction === "block") {
        if (opponentAction === "punch") {
          // Blocked opponent punch
          lastResult = "blocked";
          score += 2;
        } else {
          lastResult = null;
        }
      } else {
        // dodge
        if (opponentAction === "punch") {
          // Counter after dodge
          opponentHP -= 20;
          lastResult = "counter";
          score += 10;
        } else {
          lastResult = null;
        }
      }

      // Opponent punches back if they punched and player didn't block/dodge well
      if (opponentAction === "punch" && playerAction === "punch") {
        // already handled above
      } else if (opponentAction === "punch" && playerAction !== "block" && playerAction !== "dodge") {
        playerHP -= 20;
      } else if (opponentAction === "punch" && playerAction === "block") {
        // no damage
      } else if (opponentAction === "punch" && playerAction === "dodge") {
        // counter already handled
      }

      playerHP = Math.max(0, playerHP);
      opponentHP = Math.max(0, opponentHP);

      const over = playerHP <= 0 || opponentHP <= 0 || (state.round >= state.maxRounds);
      let winner: BoxerState["winner"] = null;
      if (over) {
        if (playerHP > opponentHP) winner = "player";
        else if (opponentHP > playerHP) winner = "opponent";
        else winner = null; // draw → opponent wins tie-break
        if (winner === null) winner = "opponent";
      }

      return {
        ...state,
        playerHP,
        opponentHP,
        playerStamina,
        playerAction,
        opponentAction,
        lastResult,
        over,
        winner,
        rngSeed: nextSeed,
        score: score + (over && winner === "player" ? 50 : 0),
      };
    }

    case "nextRound": {
      if (state.round >= state.maxRounds) return state;
      return {
        ...state,
        round: state.round + 1,
        playerAction: "idle",
        opponentAction: "idle",
        lastResult: null,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BoxerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
