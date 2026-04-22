import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Glückshaus (Lucky House): German board game.
// Board: slots 2–12 (no 4). Roll 2 dice; sum determines slot.
//   If slot has a penny: take it.
//   If empty: place a penny.
//   Sum 7: place a penny in wedding pot.
//   Sum 2: take the wedding pot.
//   Sum 3 or 11: nothing happens.
//   Sum 12: take everything (all slots + pot).
// Single-player vs 1 bot. Each starts with 10 pennies. Out of pennies = lose.

export interface GluckshausSettings {
  startingPennies: "10" | "15" | "20";
}

export type GPhase = "rolling" | "gameOver";

// Slots: 2,3,5,6,7,8,9,10,11,12 (4 is missing, but 3 and 11 are no-op)
// We track penny counts on slots 2–12 (index = sum value)
export type SlotBoard = Record<number, number>; // sum → number of pennies on that slot

export interface GluckshausState {
  settings: GluckshausSettings;
  rngSeed: number;
  phase: GPhase;
  activePlayer: "player" | "bot";
  playerPennies: number;
  botPennies: number;
  weddingPot: number;
  board: SlotBoard; // pennies on slots
  lastRoll: [number, number] | null;
  lastEvent: string;
  message: string;
  gameOver: boolean;
  winner: "player" | "bot" | null;
}

export type GAction =
  | { type: "roll" };

function emptyBoard(): SlotBoard {
  const b: SlotBoard = {};
  for (let i = 2; i <= 12; i++) b[i] = 0;
  return b;
}

export function initialState(seed: number, settings: GluckshausSettings): GluckshausState {
  const start = parseInt(settings.startingPennies, 10);
  return {
    settings,
    rngSeed: seed,
    phase: "rolling",
    activePlayer: "player",
    playerPennies: start,
    botPennies: start,
    weddingPot: 0,
    board: emptyBoard(),
    lastRoll: null,
    lastEvent: "",
    message: "Your turn. Roll the dice!",
    gameOver: false,
    winner: null,
  };
}

export function applyRoll(
  sum: number,
  board: SlotBoard,
  weddingPot: number,
  activePennies: number,
  otherPennies: number,
): { board: SlotBoard; weddingPot: number; activePennies: number; otherPennies: number; event: string } {
  const b = { ...board };

  if (sum === 12) {
    // Take everything
    const totalOnBoard = Object.values(b).reduce((s, n) => s + n, 0);
    const total = totalOnBoard + weddingPot;
    for (const k of Object.keys(b)) b[parseInt(k)] = 0;
    return {
      board: b,
      weddingPot: 0,
      activePennies: activePennies + total,
      otherPennies,
      event: `Sum 12! Take everything — ${total} pennies!`,
    };
  }

  if (sum === 2) {
    // Take the wedding pot
    const pot = weddingPot;
    return {
      board: b,
      weddingPot: 0,
      activePennies: activePennies + pot,
      otherPennies,
      event: `Sum 2! Take the wedding pot — ${pot} pennies.`,
    };
  }

  if (sum === 3 || sum === 11) {
    return { board: b, weddingPot, activePennies, otherPennies, event: `Sum ${sum} — nothing happens.` };
  }

  if (sum === 7) {
    // Place in wedding pot (if you have pennies)
    if (activePennies > 0) {
      return {
        board: b,
        weddingPot: weddingPot + 1,
        activePennies: activePennies - 1,
        otherPennies,
        event: `Sum 7 — place a penny in the wedding pot (now ${weddingPot + 1}).`,
      };
    }
    return { board: b, weddingPot, activePennies, otherPennies, event: "Sum 7 — no pennies to contribute." };
  }

  // Regular slots 2,5,6,8,9,10 (not 3/4/11 which are special)
  const onSlot = b[sum] ?? 0;
  if (onSlot > 0) {
    // Take the pennies
    b[sum] = 0;
    return {
      board: b,
      weddingPot,
      activePennies: activePennies + onSlot,
      otherPennies,
      event: `Sum ${sum} — take ${onSlot} penn${onSlot === 1 ? "y" : "ies"} from slot!`,
    };
  } else {
    // Place a penny (if you have one)
    if (activePennies > 0) {
      b[sum] = 1;
      return {
        board: b,
        weddingPot,
        activePennies: activePennies - 1,
        otherPennies,
        event: `Sum ${sum} — slot empty, place a penny.`,
      };
    }
    return { board: b, weddingPot, activePennies, otherPennies, event: `Sum ${sum} — slot empty but no pennies.` };
  }
}

export function reducer(state: GluckshausState, action: GAction): GluckshausState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling") return state;

      const rng = mulberry32(state.rngSeed);
      const d1 = Math.floor(rng() * 6) + 1;
      const d2 = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const sum = d1 + d2;

      const isPlayer = state.activePlayer === "player";
      const activePennies = isPlayer ? state.playerPennies : state.botPennies;
      const otherPennies = isPlayer ? state.botPennies : state.playerPennies;

      const result = applyRoll(sum, state.board, state.weddingPot, activePennies, otherPennies);

      const newPlayerPennies = isPlayer ? result.activePennies : result.otherPennies;
      const newBotPennies = isPlayer ? result.otherPennies : result.activePennies;

      // Check if active player is out of pennies
      const activeOut = result.activePennies === 0;
      const gameOver = activeOut;
      const winner: "player" | "bot" | null = gameOver
        ? (isPlayer ? "bot" : "player")
        : null;

      const nextActive: "player" | "bot" = isPlayer ? "bot" : "player";

      return {
        ...state,
        rngSeed: nextSeed,
        playerPennies: newPlayerPennies,
        botPennies: newBotPennies,
        weddingPot: result.weddingPot,
        board: result.board,
        lastRoll: [d1, d2],
        lastEvent: result.event,
        activePlayer: gameOver ? state.activePlayer : nextActive,
        phase: gameOver ? "gameOver" : "rolling",
        gameOver,
        winner,
        message: gameOver
          ? `${isPlayer ? "You" : "Bot"} ran out of pennies! ${winner === "player" ? "You win!" : "Bot wins!"}`
          : `${isPlayer ? "You" : "Bot"} rolled ${d1}+${d2}=${sum}. ${result.event} Pennies — You: ${newPlayerPennies}, Bot: ${newBotPennies}. ${nextActive === "player" ? "Your turn!" : "Bot's turn..."}`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GluckshausState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "player" ? 100 : 0 };
}
