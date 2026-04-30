import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 16-square mini Monopoly board: 4 corners + 3 per side.
//   index 0  = GO            (corner, bottom-right)
//   index 1..3 = bottom row   (right -> left)
//   index 4  = JAIL          (corner, bottom-left)
//   index 5..7 = left column  (bottom -> top)
//   index 8  = FREE PARKING  (corner, top-left)
//   index 9..11 = top row     (left -> right)
//   index 12 = GO TO JAIL    (corner, top-right)
//   index 13..15 = right column (top -> bottom)
export const BOARD_LEN = 16;
export const MAX_TURNS = 30;
export const STARTING_CASH = 500;
export const GO_BONUS = 200;
export const JAIL_FINE = 50;
export const MAX_JAIL_ROLLS = 3;

export type SquareType = "go" | "jail" | "free" | "gotojail" | "property" | "railroad" | "chance" | "tax";
export type ColorGroup = "brown" | "lightblue" | "pink" | "orange" | "red" | "yellow" | "green" | "blue" | null;

export interface Square {
  i: number;
  type: SquareType;
  name: string;
  short: string;
  price: number;
  rent: number;
  color: ColorGroup;
}

export const BOARD: readonly Square[] = [
  // Corners and tracks. Properties pair into color groups around the board.
  { i: 0,  type: "go",        name: "GO",            short: "GO",   price: 0,   rent: 0,  color: null },
  { i: 1,  type: "property",  name: "Mediterranean", short: "Med",  price: 60,  rent: 12, color: "brown" },
  { i: 2,  type: "chance",    name: "Chance",        short: "?",    price: 0,   rent: 0,  color: null },
  { i: 3,  type: "property",  name: "Baltic",        short: "Bal",  price: 80,  rent: 16, color: "brown" },
  { i: 4,  type: "jail",      name: "Just Visiting", short: "JAIL", price: 0,   rent: 0,  color: null },
  { i: 5,  type: "property",  name: "Oriental",      short: "Ori",  price: 100, rent: 20, color: "lightblue" },
  { i: 6,  type: "railroad",  name: "Reading RR",    short: "RR",   price: 200, rent: 50, color: null },
  { i: 7,  type: "property",  name: "Vermont",       short: "Vmt",  price: 120, rent: 24, color: "lightblue" },
  { i: 8,  type: "free",      name: "Free Parking",  short: "FREE", price: 0,   rent: 0,  color: null },
  { i: 9,  type: "property",  name: "St. Charles",   short: "StC",  price: 140, rent: 28, color: "pink" },
  { i: 10, type: "tax",       name: "Income Tax",    short: "Tax",  price: 0,   rent: 75, color: null },
  { i: 11, type: "property",  name: "Virginia",      short: "Vrg",  price: 160, rent: 32, color: "pink" },
  { i: 12, type: "gotojail",  name: "Go to Jail",    short: "->J",  price: 0,   rent: 0,  color: null },
  { i: 13, type: "property",  name: "Atlantic",      short: "Atl",  price: 220, rent: 44, color: "yellow" },
  { i: 14, type: "railroad",  name: "B&O RR",        short: "RR",   price: 200, rent: 50, color: null },
  { i: 15, type: "property",  name: "Boardwalk",     short: "BW",   price: 400, rent: 100, color: "blue" },
];

export type Owner = "none" | "p" | "c";

export interface MonopolySettings { dummy: boolean; }

export type Phase = "rolling" | "deciding" | "ai" | "done";

export interface MonopolyState {
  rngSeed: number;
  pPos: number;
  cPos: number;
  pCash: number;
  cCash: number;
  owners: Owner[];
  turn: number;
  isPlayer: boolean;
  phase: Phase;
  // Last roll for dice display: [d1, d2] or null.
  dice: [number, number] | null;
  // Doubles streak (caps re-rolls; fail-safe against ai-turn lock).
  doublesStreak: number;
  pInJail: boolean;
  cInJail: boolean;
  pJailRolls: number;
  cJailRolls: number;
  message: string;
  log: string[];
}

export type MonopolyAction =
  | { type: "roll" }
  | { type: "buy" }
  | { type: "skip" }
  | { type: "ai" };

export function initialState(seed: number, _s: MonopolySettings): MonopolyState {
  return {
    rngSeed: seed >>> 0 || 1,
    pPos: 0,
    cPos: 0,
    pCash: STARTING_CASH,
    cCash: STARTING_CASH,
    owners: new Array(BOARD_LEN).fill("none") as Owner[],
    turn: 1,
    isPlayer: true,
    phase: "rolling",
    dice: null,
    doublesStreak: 0,
    pInJail: false,
    cInJail: false,
    pJailRolls: 0,
    cJailRolls: 0,
    message: "Your roll.",
    log: ["Game start. You and CPU each have $500."],
  };
}

function pushLog(log: readonly string[], line: string): string[] {
  const next = [...log, line];
  // Keep last 8 lines only.
  return next.length > 8 ? next.slice(next.length - 8) : next;
}

function bankrupt(s: MonopolyState): "p" | "c" | null {
  if (s.pCash < 0) return "p";
  if (s.cCash < 0) return "c";
  return null;
}

function rollDie(rng: () => number): number {
  return 1 + Math.floor(rng() * 6);
}

function checkEnd(s: MonopolyState): MonopolyState {
  const b = bankrupt(s);
  if (b) {
    return {
      ...s,
      phase: "done",
      message: b === "p" ? "You went bankrupt. CPU wins." : "CPU went bankrupt. You win!",
      log: pushLog(s.log, b === "p" ? "You went bankrupt." : "CPU went bankrupt!"),
    };
  }
  if (s.turn > MAX_TURNS) {
    const winner =
      s.pCash > s.cCash ? "Time! You win on cash." :
      s.pCash < s.cCash ? "Time! CPU wins on cash." :
      "Time! It's a tie.";
    return { ...s, phase: "done", message: winner, log: pushLog(s.log, winner) };
  }
  return s;
}

// Apply landing on a square for player p ("p" or "c"). Mutates a fresh state.
function applyLanding(state: MonopolyState, who: "p" | "c", pos: number): MonopolyState {
  const sq = BOARD[pos]!;
  const isP = who === "p";
  const ownerKey = isP ? "p" : "c";
  const opp: Owner = isP ? "c" : "p";
  let pCash = state.pCash;
  let cCash = state.cCash;
  let owners = state.owners;
  let log = state.log;
  let message = state.message;
  let phase: Phase = isP ? "ai" : "rolling";
  let pInJail = state.pInJail;
  let cInJail = state.cInJail;
  let pPos = state.pPos;
  let cPos = state.cPos;

  const youAre = isP ? "You" : "CPU";

  switch (sq.type) {
    case "go": {
      message = `${youAre} on GO.`;
      log = pushLog(log, `${youAre} landed on GO.`);
      break;
    }
    case "free": {
      message = `${youAre} on Free Parking.`;
      log = pushLog(log, `${youAre} chilled at Free Parking.`);
      break;
    }
    case "jail": {
      message = `${youAre} just visiting jail.`;
      log = pushLog(log, `${youAre} just visiting jail.`);
      break;
    }
    case "gotojail": {
      message = `${youAre} sent to jail!`;
      log = pushLog(log, `${youAre} sent to jail!`);
      if (isP) { pPos = 4; pInJail = true; } else { cPos = 4; cInJail = true; }
      break;
    }
    case "tax": {
      const tax = sq.rent;
      if (isP) pCash -= tax; else cCash -= tax;
      message = `${youAre} paid $${tax} income tax.`;
      log = pushLog(log, `${youAre} paid $${tax} tax.`);
      break;
    }
    case "chance": {
      // Mini chance: random small +/- bonus, deterministic via rngSeed parity.
      const sign = (state.rngSeed % 2 === 0) ? 1 : -1;
      const amt = 25 * (1 + (state.rngSeed % 3));
      const delta = sign * amt;
      if (isP) pCash += delta; else cCash += delta;
      message = `${youAre} drew Chance: ${delta >= 0 ? "+" : ""}$${delta}.`;
      log = pushLog(log, `${youAre} chance card: ${delta >= 0 ? "+" : ""}$${delta}.`);
      break;
    }
    case "property":
    case "railroad": {
      const owner = owners[pos]!;
      if (owner === "none") {
        if (isP) {
          // Defer to player choice.
          phase = "deciding";
          message = `${sq.name}: buy for $${sq.price}?`;
        } else {
          // CPU greedy: buy if affordable and at least $80 cushion remains.
          if (cCash - sq.price >= 80) {
            const o = owners.slice();
            o[pos] = "c";
            owners = o;
            cCash -= sq.price;
            message = `CPU bought ${sq.name} for $${sq.price}.`;
            log = pushLog(log, `CPU bought ${sq.name} ($${sq.price}).`);
          } else {
            message = `CPU passed on ${sq.name}.`;
            log = pushLog(log, `CPU passed on ${sq.name}.`);
          }
        }
      } else if (owner === opp) {
        const rent = sq.rent;
        if (isP) { pCash -= rent; cCash += rent; }
        else     { cCash -= rent; pCash += rent; }
        message = `${youAre} paid $${rent} rent on ${sq.name}.`;
        log = pushLog(log, `${youAre} paid $${rent} rent (${sq.name}).`);
      } else if (owner === ownerKey) {
        message = `${youAre} on own ${sq.name}.`;
      }
      break;
    }
  }

  return {
    ...state,
    pCash, cCash, owners, log, message, phase,
    pPos, cPos, pInJail, cInJail,
  };
}

// Move a player around the board, awarding GO bonus on pass.
function advance(state: MonopolyState, who: "p" | "c", steps: number): MonopolyState {
  const isP = who === "p";
  const fromPos = isP ? state.pPos : state.cPos;
  const newPos = (fromPos + steps) % BOARD_LEN;
  const passedGo = newPos < fromPos || (steps > 0 && fromPos + steps >= BOARD_LEN);
  let pCash = state.pCash;
  let cCash = state.cCash;
  let log = state.log;
  if (passedGo) {
    if (isP) pCash += GO_BONUS; else cCash += GO_BONUS;
    log = pushLog(log, `${isP ? "You" : "CPU"} passed GO. Collect $${GO_BONUS}.`);
  }
  const moved: MonopolyState = {
    ...state,
    pCash, cCash, log,
    pPos: isP ? newPos : state.pPos,
    cPos: isP ? state.cPos : newPos,
  };
  return applyLanding(moved, who, newPos);
}

export function reducer(state: MonopolyState, action: MonopolyAction): MonopolyState {
  if (state.phase === "done") return state;

  // ---- Player roll
  if (action.type === "roll" && state.phase === "rolling" && state.isPlayer) {
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isDouble = d1 === d2;
    const sum = d1 + d2;

    // Handle jail
    if (state.pInJail) {
      const tries = state.pJailRolls + 1;
      if (isDouble) {
        // Escape, advance.
        let s: MonopolyState = {
          ...state,
          rngSeed: nextSeed,
          dice: [d1, d2],
          pInJail: false,
          pJailRolls: 0,
          log: pushLog(state.log, `You rolled doubles (${d1}+${d2}) — out of jail!`),
        };
        s = advance(s, "p", sum);
        return checkEnd(s);
      }
      if (tries >= MAX_JAIL_ROLLS) {
        // Pay fine, advance.
        const after = {
          ...state,
          rngSeed: nextSeed,
          dice: [d1, d2] as [number, number],
          pInJail: false,
          pJailRolls: 0,
          pCash: state.pCash - JAIL_FINE,
          log: pushLog(state.log, `You paid $${JAIL_FINE} fine and left jail.`),
        };
        const s = advance(after, "p", sum);
        return checkEnd(s);
      }
      return checkEnd({
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        pJailRolls: tries,
        phase: "ai",
        message: `No doubles in jail (${tries}/${MAX_JAIL_ROLLS}).`,
        log: pushLog(state.log, `You stayed in jail (try ${tries}).`),
      });
    }

    // Triple-doubles -> jail.
    let nextDoubles = isDouble ? state.doublesStreak + 1 : 0;
    if (nextDoubles >= 3) {
      return checkEnd({
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        pPos: 4,
        pInJail: true,
        pJailRolls: 0,
        doublesStreak: 0,
        phase: "ai",
        message: "Three doubles in a row — straight to jail!",
        log: pushLog(state.log, "You rolled 3 doubles in a row → jail!"),
      });
    }

    let s: MonopolyState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
      doublesStreak: nextDoubles,
    };
    s = advance(s, "p", sum);

    // If doubles and not in jail and still rolling phase eligible, keep player turn but only after deciding/AI handled.
    // For simplicity: doubles do not grant extra roll when landing on a buyable property (player decides first).
    // After deciding (or no decision), instead of going to AI, return to rolling.
    if (isDouble && s.phase !== "deciding" && !s.pInJail) {
      s = {
        ...s,
        phase: "rolling",
        message: `Doubles! ${d1}+${d2}=${sum}. Roll again.`,
        log: pushLog(s.log, `You rolled doubles ${d1}+${d2}, roll again.`),
      };
    }
    return checkEnd(s);
  }

  // ---- Player buy / skip
  if (action.type === "buy" && state.phase === "deciding" && state.isPlayer) {
    const sq = BOARD[state.pPos]!;
    if (state.pCash < sq.price) {
      return checkEnd({
        ...state,
        phase: "ai",
        message: `Cannot afford ${sq.name}.`,
        log: pushLog(state.log, `Couldn't afford ${sq.name}.`),
        doublesStreak: 0,
      });
    }
    const owners = state.owners.slice();
    owners[state.pPos] = "p";
    // If we rolled doubles to land here, we still go to AI for fairness — keeps loops bounded.
    return checkEnd({
      ...state,
      pCash: state.pCash - sq.price,
      owners,
      phase: "ai",
      message: `Bought ${sq.name} for $${sq.price}.`,
      log: pushLog(state.log, `You bought ${sq.name} ($${sq.price}).`),
      doublesStreak: 0,
    });
  }

  if (action.type === "skip" && state.phase === "deciding" && state.isPlayer) {
    return checkEnd({
      ...state,
      phase: "ai",
      message: "Skipped purchase.",
      log: pushLog(state.log, `You skipped buying ${BOARD[state.pPos]!.name}.`),
      doublesStreak: 0,
    });
  }

  // ---- AI
  if (action.type === "ai" && state.phase === "ai") {
    const rng = mulberry32(state.rngSeed);
    const d1 = rollDie(rng);
    const d2 = rollDie(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2;
    const isDouble = d1 === d2;

    // CPU jail handling: pay if has cash, else fail one try then attempt double.
    if (state.cInJail) {
      const tries = state.cJailRolls + 1;
      if (isDouble) {
        let s: MonopolyState = {
          ...state,
          rngSeed: nextSeed,
          dice: [d1, d2],
          cInJail: false,
          cJailRolls: 0,
          log: pushLog(state.log, `CPU rolled doubles (${d1}+${d2}) — out of jail!`),
        };
        s = advance(s, "c", sum);
        return checkEnd({
          ...s,
          isPlayer: true,
          turn: s.turn + 1,
          phase: s.phase === "done" ? "done" : "rolling",
          message: s.phase === "done" ? s.message : "Your roll.",
        });
      }
      if (tries >= MAX_JAIL_ROLLS) {
        const after: MonopolyState = {
          ...state,
          rngSeed: nextSeed,
          dice: [d1, d2],
          cInJail: false,
          cJailRolls: 0,
          cCash: state.cCash - JAIL_FINE,
          log: pushLog(state.log, `CPU paid $${JAIL_FINE} fine and left jail.`),
        };
        const s = advance(after, "c", sum);
        return checkEnd({
          ...s,
          isPlayer: true,
          turn: s.turn + 1,
          phase: s.phase === "done" ? "done" : "rolling",
          message: s.phase === "done" ? s.message : "Your roll.",
        });
      }
      return checkEnd({
        ...state,
        rngSeed: nextSeed,
        dice: [d1, d2],
        cJailRolls: tries,
        isPlayer: true,
        turn: state.turn + 1,
        phase: "rolling",
        message: `CPU stayed in jail (${tries}/${MAX_JAIL_ROLLS}). Your roll.`,
        log: pushLog(state.log, `CPU stayed in jail (try ${tries}).`),
      });
    }

    let s: MonopolyState = {
      ...state,
      rngSeed: nextSeed,
      dice: [d1, d2],
    };
    s = advance(s, "c", sum);
    return checkEnd({
      ...s,
      isPlayer: true,
      turn: s.turn + 1,
      phase: s.phase === "done" ? "done" : "rolling",
      message: s.phase === "done" ? s.message : `CPU rolled ${d1}+${d2}=${sum}. Your roll.`,
      doublesStreak: 0,
    });
  }

  return state;
}

export function score(s: MonopolyState): number {
  // Final score: cash differential plus property value plus win bonus.
  const propValue = (owner: Owner) => s.owners.reduce((sum, o, i) => sum + (o === owner ? BOARD[i]!.price : 0), 0);
  const pVal = s.pCash + propValue("p");
  const cVal = s.cCash + propValue("c");
  const win = s.message.includes("You win") ? 500 : 0;
  return Math.max(0, win + pVal - cVal + 500);
}

export function isTerminal(s: MonopolyState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
