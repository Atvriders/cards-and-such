import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// The Game of Life (Full) — career/college branch, marriage, kids, house,
// insurance, spin-to-win, retirement (Millionaire Estates vs Countryside Acres).
//
// L-tier scope: implements the full spinner-driven turn loop with all major
// branches. Two-player: human vs greedy CPU.
//
// Advanced rules omitted (documented in howToPlay):
//   - Share-the-wealth cards
//   - Mid-game career/salary changes (no salary-card swap squares)
//   - LIFE tiles (collectibles); no random LIFE-tile draws on milestones.
//   - Multi-step lawsuit chains. Lawsuits resolve as a single cash transfer.
// =============================================================================

export type SquareKind =
  | "start"
  | "branch"          // career-vs-college choice (only at idx 0 for player)
  | "college-wait"    // college path: skip turns
  | "career-pick"     // pick a career card (sets salary band)
  | "payday"          // collect salary
  | "marry"           // marriage square: spin for # of kids ceremony bonus
  | "baby"            // add 1 child, cost cash
  | "twins"           // add 2 children, cost cash
  | "buy-house"       // chance to buy a house (random value 80-200k)
  | "sell-house"      // sell current house (random sale 80-220k)
  | "buy-insurance"   // chance to buy auto/home/life insurance
  | "spin-to-win"     // pay 50k to play; spin 1-10, if 6+ win 200k
  | "lawsuit"         // pay 100k (or 0 if home/life insurance per simplification)
  | "expense"         // generic cash drain
  | "lottery"         // generic cash gain
  | "retire-choice"   // final square: choose retirement community
  | "blank";          // filler/free space

export interface Square {
  kind: SquareKind;
  label: string;
  cash: number;       // immediate cash delta (negative = cost)
}

// Career cards: name + base salary (player) and pay-raise count for higher tiers.
// Players who go to college draw from the high-salary deck.
export interface CareerCard {
  name: string;
  salary: number; // per payday in $1000s (display: salary*1000)
  college: boolean; // true if requires college
}

export const CAREER_CARDS: CareerCard[] = [
  { name: "Salesperson",   salary: 30, college: false },
  { name: "Mechanic",      salary: 40, college: false },
  { name: "Police Officer", salary: 50, college: false },
  { name: "Hair Stylist",  salary: 35, college: false },
  { name: "Athlete",       salary: 70, college: false },
];
export const COLLEGE_CAREER_CARDS: CareerCard[] = [
  { name: "Doctor",        salary: 100, college: true },
  { name: "Lawyer",        salary: 90,  college: true },
  { name: "Computer Scientist", salary: 85, college: true },
  { name: "Veterinarian",  salary: 70,  college: true },
  { name: "Accountant",    salary: 80,  college: true },
];

// =============================================================================
// Board layout (linear, 32 squares). Shared by both paths; difference is the
// pre-board prologue: career path enters at sq 4, college path enters at sq 0
// after a 4-turn delay + 100k debt.
// =============================================================================

export const BOARD: Square[] = [
  /* 0 */  { kind: "start",         label: "Begin Life",          cash: 0 },
  /* 1 */  { kind: "payday",        label: "First Payday",        cash: 0 },
  /* 2 */  { kind: "buy-house",     label: "Starter Home",        cash: 0 },
  /* 3 */  { kind: "expense",       label: "Furniture",           cash: -15 },
  /* 4 */  { kind: "payday",        label: "Payday",              cash: 0 },
  /* 5 */  { kind: "marry",         label: "Get Married!",        cash: 30 },
  /* 6 */  { kind: "buy-insurance", label: "Auto Insurance",      cash: 0 },
  /* 7 */  { kind: "baby",          label: "Baby Boy",            cash: -10 },
  /* 8 */  { kind: "payday",        label: "Payday",              cash: 0 },
  /* 9 */  { kind: "twins",         label: "Twin Girls!",         cash: -20 },
  /* 10 */ { kind: "lottery",       label: "Won the Lottery",     cash: 90 },
  /* 11 */ { kind: "expense",       label: "Car Repair",          cash: -25 },
  /* 12 */ { kind: "buy-insurance", label: "Home Insurance",      cash: 0 },
  /* 13 */ { kind: "payday",        label: "Payday",              cash: 0 },
  /* 14 */ { kind: "baby",          label: "Baby Girl",           cash: -10 },
  /* 15 */ { kind: "spin-to-win",   label: "Spin to Win",         cash: 0 },
  /* 16 */ { kind: "expense",       label: "Vacation",            cash: -40 },
  /* 17 */ { kind: "buy-insurance", label: "Life Insurance",      cash: 0 },
  /* 18 */ { kind: "payday",        label: "Payday",              cash: 0 },
  /* 19 */ { kind: "lawsuit",       label: "Lawsuit!",            cash: -100 },
  /* 20 */ { kind: "sell-house",    label: "Upgrade Your House",  cash: 0 },
  /* 21 */ { kind: "buy-house",     label: "Buy Bigger House",    cash: 0 },
  /* 22 */ { kind: "payday",        label: "Payday",              cash: 0 },
  /* 23 */ { kind: "expense",       label: "Taxes Due",           cash: -75 },
  /* 24 */ { kind: "lottery",       label: "Stock Win",           cash: 80 },
  /* 25 */ { kind: "spin-to-win",   label: "Spin to Win",         cash: 0 },
  /* 26 */ { kind: "payday",        label: "Payday",              cash: 0 },
  /* 27 */ { kind: "lottery",       label: "Inheritance",         cash: 120 },
  /* 28 */ { kind: "expense",       label: "Hospital Bills",      cash: -55 },
  /* 29 */ { kind: "sell-house",    label: "Move for Retirement", cash: 0 },
  /* 30 */ { kind: "payday",        label: "Final Payday",        cash: 0 },
  /* 31 */ { kind: "retire-choice", label: "Retirement",          cash: 0 },
];

// =============================================================================
// Player + state shapes
// =============================================================================

export type Insurance = { auto: boolean; home: boolean; life: boolean };

export type PathChoice = "career" | "college";

export type Retirement = "millionaire-estates" | "countryside-acres" | null;

export interface PlayerLifeState {
  id: "human" | "cpu";
  pos: number;              // board position, -1 = pre-board (college wait)
  cash: number;             // in thousands (display: cash * 1000)
  debt: number;             // college debt (thousands)
  kids: number;
  married: boolean;
  hasHouse: boolean;
  houseValue: number;       // in thousands; 0 if no house
  insurance: Insurance;
  path: PathChoice | null;
  career: CareerCard | null;
  collegeTurnsLeft: number; // turns to skip after picking college
  paydayCount: number;      // # paydays collected (for "payday actions accumulated")
  retired: boolean;
  retirementChoice: Retirement;
  lastSpin: number;
}

export type Phase =
  | "choose-path"        // human picks career-vs-college
  | "spinning"           // active player ready to spin
  | "resolved"           // square resolved, awaiting decision OR next
  | "decision-marry"     // marriage: spin for kids bonus
  | "decision-house"     // offered chance to buy house
  | "decision-insurance" // offered chance to buy insurance (one of auto/home/life)
  | "decision-spin-win"  // offered chance to play spin-to-win
  | "decision-sell"      // offered chance to sell house
  | "decision-career"    // offered to pick a career card after first job square
  | "decision-retire"    // choose retirement community
  | "cpu-thinking"       // cpu's turn in progress (cosmetic)
  | "done";

export interface LogEntry {
  turn: number;
  who: "human" | "cpu";
  spin: number | null;
  square: number;
  label: string;
  cashDelta: number;
  cashAfter: number;
  note?: string;
}

export interface LifeFullState {
  rngSeed: number;
  turn: number;
  active: "human" | "cpu";
  human: PlayerLifeState;
  cpu: PlayerLifeState;
  phase: Phase;
  log: LogEntry[];
  // last context for decision phases:
  decisionData: {
    careerOptions?: CareerCard[];   // career-pick decision
    houseValue?: number;            // buy-house offer price
    salePrice?: number;             // sell-house sale price
    insuranceKind?: "auto" | "home" | "life";
    insuranceCost?: number;
    spinWinResult?: number | null;  // result of spin-to-win after playing
    marryKidsBonus?: number;        // result of marriage spin
  };
}

export interface LifeFullSettings {
  startingCash: number; // in thousands
}

// =============================================================================
// Actions
// =============================================================================

export type LifeFullAction =
  | { type: "choose-path"; path: PathChoice }
  | { type: "pick-career"; index: number }
  | { type: "spin" }
  | { type: "buy-house"; buy: boolean }
  | { type: "sell-house"; sell: boolean }
  | { type: "buy-insurance"; buy: boolean }
  | { type: "play-spin-to-win"; play: boolean }
  | { type: "marry-spin" }
  | { type: "pick-retirement"; choice: "millionaire-estates" | "countryside-acres" }
  | { type: "next" }
  | { type: "cpu-step" };

// =============================================================================
// Helpers
// =============================================================================

function newPlayer(id: "human" | "cpu", startingCash: number): PlayerLifeState {
  return {
    id,
    pos: -1,
    cash: startingCash,
    debt: 0,
    kids: 0,
    married: false,
    hasHouse: false,
    houseValue: 0,
    insurance: { auto: false, home: false, life: false },
    path: null,
    career: null,
    collegeTurnsLeft: 0,
    paydayCount: 0,
    retired: false,
    retirementChoice: null,
    lastSpin: 0,
  };
}

function nextSeed(rng: () => number): number {
  return Math.floor(rng() * 2 ** 31);
}

function spinValue(rng: () => number): number {
  return 1 + Math.floor(rng() * 10);
}

function pickThree<T>(deck: T[], rng: () => number): T[] {
  // deterministic pick of 3 cards from deck (no replacement)
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < Math.min(3, deck.length)) {
    const idx = Math.floor(rng() * deck.length);
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(deck[idx]!);
  }
  return out;
}

function appendLog(state: LifeFullState, entry: LogEntry): LogEntry[] {
  return [entry, ...state.log].slice(0, 16);
}

function applySquareCash(p: PlayerLifeState, sq: Square): PlayerLifeState {
  // Generic cash deltas for expense/lottery/lawsuit (lawsuit insurance offset
  // is handled at the call site). Payday is handled separately to consult salary.
  return { ...p, cash: p.cash + sq.cash };
}

function payday(p: PlayerLifeState): PlayerLifeState {
  const salary = p.career?.salary ?? 20;
  return { ...p, cash: p.cash + salary, paydayCount: p.paydayCount + 1 };
}

function flipActive(active: "human" | "cpu"): "human" | "cpu" {
  return active === "human" ? "cpu" : "human";
}

function getActivePlayer(s: LifeFullState): PlayerLifeState {
  return s.active === "human" ? s.human : s.cpu;
}

function withActivePlayer(s: LifeFullState, p: PlayerLifeState): LifeFullState {
  return s.active === "human" ? { ...s, human: p } : { ...s, cpu: p };
}

function bothRetired(s: LifeFullState): boolean {
  return s.human.retired && s.cpu.retired;
}

// =============================================================================
// initialState
// =============================================================================

export function initialState(seed: number, s: LifeFullSettings): LifeFullState {
  const startingCash = s.startingCash ?? 10;
  return {
    rngSeed: seed >>> 0,
    turn: 1,
    active: "human",
    human: newPlayer("human", startingCash),
    cpu: newPlayer("cpu", startingCash),
    phase: "choose-path",
    log: [],
    decisionData: {},
  };
}

// =============================================================================
// Reducer
// =============================================================================

export function reducer(state: LifeFullState, action: LifeFullAction): LifeFullState {
  if (state.phase === "done") return state;

  // ---- choose-path (human first) ----
  if (action.type === "choose-path" && state.phase === "choose-path") {
    const rng = mulberry32(state.rngSeed);
    // Human chooses path
    let human = { ...state.human, path: action.path };
    if (action.path === "college") {
      human = { ...human, debt: 100, collegeTurnsLeft: 4, pos: -1 };
    } else {
      // start on board, await career-pick decision before first spin
      human = { ...human, pos: 0 };
    }
    // CPU greedy: always career.
    let cpu = { ...state.cpu, path: "career" as PathChoice, pos: 0 };
    // CPU picks a career card immediately (greedy: highest salary from non-college deck).
    const cpuOptions = pickThree(CAREER_CARDS, rng);
    const cpuPick = [...cpuOptions].sort((a, b) => b.salary - a.salary)[0]!;
    cpu = { ...cpu, career: cpuPick };

    const newSeed = nextSeed(rng);
    // For human: if career path, offer career-pick decision; if college, go to spinning (skips turns).
    const careerOptions = action.path === "career" ? pickThree(CAREER_CARDS, mulberry32(newSeed)) : pickThree(COLLEGE_CAREER_CARDS, mulberry32(newSeed));
    const newSeed2 = nextSeed(mulberry32(newSeed));
    return {
      ...state,
      rngSeed: newSeed2,
      human,
      cpu,
      phase: "decision-career",
      decisionData: { careerOptions },
      log: appendLog(state, {
        turn: state.turn,
        who: "human",
        spin: null,
        square: human.pos,
        label: action.path === "career" ? "Chose Career path" : "Chose College (4 turn delay, +100k debt)",
        cashDelta: 0,
        cashAfter: human.cash,
        note: `CPU chose career (${cpuPick.name}, $${cpuPick.salary}k/payday)`,
      }),
    };
  }

  // ---- pick-career (human after path choice) ----
  if (action.type === "pick-career" && state.phase === "decision-career") {
    const opts = state.decisionData.careerOptions ?? [];
    const card = opts[Math.max(0, Math.min(opts.length - 1, action.index))];
    if (!card) return state;
    const human = { ...state.human, career: card };
    return {
      ...state,
      human,
      phase: "spinning",
      decisionData: {},
      log: appendLog(state, {
        turn: state.turn,
        who: "human",
        spin: null,
        square: human.pos,
        label: `Career: ${card.name}`,
        cashDelta: 0,
        cashAfter: human.cash,
        note: `Salary $${card.salary}k/payday`,
      }),
    };
  }

  // ---- spin (any player whose phase is spinning) ----
  if (action.type === "spin" && state.phase === "spinning") {
    const rng = mulberry32(state.rngSeed);
    const player = getActivePlayer(state);

    // College wait: skip turn instead of advancing.
    if (player.path === "college" && player.collegeTurnsLeft > 0 && player.pos === -1) {
      const newPlayer = { ...player, collegeTurnsLeft: player.collegeTurnsLeft - 1 };
      const onBoard = newPlayer.collegeTurnsLeft === 0;
      const finalPlayer = onBoard ? { ...newPlayer, pos: 0 } : newPlayer;
      const newSeed = nextSeed(rng);
      const next = withActivePlayer({ ...state, rngSeed: newSeed }, finalPlayer);
      const entry: LogEntry = {
        turn: state.turn,
        who: state.active,
        spin: null,
        square: finalPlayer.pos,
        label: onBoard ? "Graduated! Joining board." : `College class (${newPlayer.collegeTurnsLeft} turns left)`,
        cashDelta: 0,
        cashAfter: finalPlayer.cash,
      };
      // After college finishes, advance through normal flow (turn switches).
      return advanceTurn({ ...next, log: appendLog(next, entry), phase: "spinning" });
    }

    const spin = spinValue(rng);
    const newSeed = nextSeed(rng);
    let pos = player.pos + spin;
    if (pos > BOARD.length - 1) pos = BOARD.length - 1;
    const sq = BOARD[pos]!;
    let updated = { ...player, pos, lastSpin: spin };

    // Resolve fixed-effect squares immediately. Decision squares set phase.
    let phase: Phase = "resolved";
    let decisionData = state.decisionData;
    let cashDelta = 0;
    let note: string | undefined;

    if (sq.kind === "payday") {
      const before = updated.cash;
      updated = payday(updated);
      cashDelta = updated.cash - before;
      note = `+$${cashDelta}k salary`;
    } else if (sq.kind === "expense") {
      cashDelta = sq.cash;
      updated = applySquareCash(updated, sq);
    } else if (sq.kind === "lottery") {
      cashDelta = sq.cash;
      updated = applySquareCash(updated, sq);
    } else if (sq.kind === "lawsuit") {
      // life/home insurance reduces; auto doesn't apply. Simplification:
      // if has any insurance, pay half.
      const hasAny = updated.insurance.auto || updated.insurance.home || updated.insurance.life;
      const fee = hasAny ? Math.floor(sq.cash / 2) : sq.cash;
      cashDelta = fee;
      updated = { ...updated, cash: updated.cash + fee };
      note = hasAny ? "Insurance halved the loss" : "No insurance!";
    } else if (sq.kind === "baby") {
      updated = { ...updated, kids: updated.kids + 1, cash: updated.cash + sq.cash };
      cashDelta = sq.cash;
      note = "+1 child";
    } else if (sq.kind === "twins") {
      updated = { ...updated, kids: updated.kids + 2, cash: updated.cash + sq.cash };
      cashDelta = sq.cash;
      note = "+2 children";
    } else if (sq.kind === "marry") {
      // marry square -> decision-marry (player spins for ceremony bonus).
      if (!updated.married) {
        updated = { ...updated, married: true };
        phase = "decision-marry";
      } else {
        // already married → small renewal cash
        cashDelta = 10;
        updated = { ...updated, cash: updated.cash + 10 };
        note = "Vow renewal";
      }
    } else if (sq.kind === "buy-house") {
      const offerRng = mulberry32(newSeed);
      const houseValue = 80 + Math.floor(offerRng() * 121); // 80-200
      phase = "decision-house";
      decisionData = { ...decisionData, houseValue };
    } else if (sq.kind === "sell-house") {
      if (updated.hasHouse) {
        const offerRng = mulberry32(newSeed);
        const salePrice = 80 + Math.floor(offerRng() * 141); // 80-220
        phase = "decision-sell";
        decisionData = { ...decisionData, salePrice };
      } else {
        note = "No house to sell";
      }
    } else if (sq.kind === "buy-insurance") {
      // The square's label hints the kind; map per pos.
      const insuranceKind: "auto" | "home" | "life" =
        sq.label.includes("Auto") ? "auto" : sq.label.includes("Home") ? "home" : "life";
      // Skip if already owned.
      if (updated.insurance[insuranceKind]) {
        note = `Already have ${insuranceKind} insurance`;
      } else {
        const insuranceCost = insuranceKind === "auto" ? 20 : insuranceKind === "home" ? 40 : 60;
        phase = "decision-insurance";
        decisionData = { ...decisionData, insuranceKind, insuranceCost };
      }
    } else if (sq.kind === "spin-to-win") {
      phase = "decision-spin-win";
      decisionData = { ...decisionData, spinWinResult: null };
    } else if (sq.kind === "retire-choice") {
      phase = "decision-retire";
    } else if (sq.kind === "start" || sq.kind === "blank") {
      // no-op
    }

    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin,
      square: pos,
      label: sq.label,
      cashDelta,
      cashAfter: updated.cash,
      ...(note ? { note } : {}),
    };

    let next: LifeFullState = withActivePlayer({ ...state, rngSeed: newSeed }, updated);
    next = { ...next, log: appendLog(next, entry), phase, decisionData };
    return next;
  }

  // ---- marry-spin ----
  if (action.type === "marry-spin" && state.phase === "decision-marry") {
    const rng = mulberry32(state.rngSeed);
    const value = spinValue(rng);
    const bonus = value <= 5 ? 50 : 100; // odd squashed: 1-5 → 50, 6-10 → 100
    const newSeed = nextSeed(rng);
    const player = getActivePlayer(state);
    const updated = { ...player, cash: player.cash + bonus };
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: value,
      square: player.pos,
      label: "Wedding Gift Spin",
      cashDelta: bonus,
      cashAfter: updated.cash,
      note: bonus === 100 ? "Big gift!" : "Modest gift",
    };
    const next = withActivePlayer({ ...state, rngSeed: newSeed }, updated);
    return {
      ...next,
      log: appendLog(next, entry),
      phase: "resolved",
      decisionData: { ...state.decisionData, marryKidsBonus: bonus },
    };
  }

  // ---- buy-house decision ----
  if (action.type === "buy-house" && state.phase === "decision-house") {
    const player = getActivePlayer(state);
    const price = state.decisionData.houseValue ?? 100;
    let updated = player;
    let cashDelta = 0;
    let note = "Declined";
    if (action.buy) {
      // pay down old house first if any
      const oldValue = player.hasHouse ? player.houseValue : 0;
      updated = {
        ...player,
        hasHouse: true,
        houseValue: price,
        cash: player.cash - price + oldValue,
      };
      cashDelta = -price + oldValue;
      note = `Bought house @ $${price}k`;
    }
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: null,
      square: player.pos,
      label: "House Offer",
      cashDelta,
      cashAfter: updated.cash,
      note,
    };
    const next = withActivePlayer(state, updated);
    return { ...next, log: appendLog(next, entry), phase: "resolved", decisionData: {} };
  }

  // ---- sell-house decision ----
  if (action.type === "sell-house" && state.phase === "decision-sell") {
    const player = getActivePlayer(state);
    const price = state.decisionData.salePrice ?? 100;
    let updated = player;
    let cashDelta = 0;
    let note = "Kept the house";
    if (action.sell && player.hasHouse) {
      updated = { ...player, cash: player.cash + price, hasHouse: false, houseValue: 0 };
      cashDelta = price;
      note = `Sold for $${price}k`;
    }
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: null,
      square: player.pos,
      label: "House Sale",
      cashDelta,
      cashAfter: updated.cash,
      note,
    };
    const next = withActivePlayer(state, updated);
    return { ...next, log: appendLog(next, entry), phase: "resolved", decisionData: {} };
  }

  // ---- buy-insurance decision ----
  if (action.type === "buy-insurance" && state.phase === "decision-insurance") {
    const player = getActivePlayer(state);
    const kind = state.decisionData.insuranceKind!;
    const cost = state.decisionData.insuranceCost ?? 0;
    let updated = player;
    let cashDelta = 0;
    let note = "Declined insurance";
    if (action.buy) {
      updated = {
        ...player,
        cash: player.cash - cost,
        insurance: { ...player.insurance, [kind]: true },
      };
      cashDelta = -cost;
      note = `Bought ${kind} insurance for $${cost}k`;
    }
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: null,
      square: player.pos,
      label: `Insurance: ${kind}`,
      cashDelta,
      cashAfter: updated.cash,
      note,
    };
    const next = withActivePlayer(state, updated);
    return { ...next, log: appendLog(next, entry), phase: "resolved", decisionData: {} };
  }

  // ---- spin-to-win decision ----
  if (action.type === "play-spin-to-win" && state.phase === "decision-spin-win") {
    const player = getActivePlayer(state);
    if (!action.play) {
      const entry: LogEntry = {
        turn: state.turn,
        who: state.active,
        spin: null,
        square: player.pos,
        label: "Spin to Win — passed",
        cashDelta: 0,
        cashAfter: player.cash,
      };
      return { ...state, log: appendLog(state, entry), phase: "resolved", decisionData: {} };
    }
    const rng = mulberry32(state.rngSeed);
    const value = spinValue(rng);
    const newSeed = nextSeed(rng);
    const fee = 50;
    const won = value >= 6;
    const reward = won ? 200 : 0;
    const updated = { ...player, cash: player.cash - fee + reward };
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: value,
      square: player.pos,
      label: "Spin to Win!",
      cashDelta: -fee + reward,
      cashAfter: updated.cash,
      note: won ? "WON $200k" : "Lost the bet",
    };
    const next = withActivePlayer({ ...state, rngSeed: newSeed }, updated);
    return {
      ...next,
      log: appendLog(next, entry),
      phase: "resolved",
      decisionData: { spinWinResult: value },
    };
  }

  // ---- pick-retirement decision ----
  if (action.type === "pick-retirement" && state.phase === "decision-retire") {
    const player = getActivePlayer(state);
    const updated = { ...player, retired: true, retirementChoice: action.choice };
    const entry: LogEntry = {
      turn: state.turn,
      who: state.active,
      spin: null,
      square: player.pos,
      label: `Retired to ${action.choice === "millionaire-estates" ? "Millionaire Estates" : "Countryside Acres"}`,
      cashDelta: 0,
      cashAfter: updated.cash,
    };
    let next = withActivePlayer(state, updated);
    next = { ...next, log: appendLog(next, entry), decisionData: {} };
    return advanceTurn(next);
  }

  // ---- next (advance turn or auto-resolve no-decision square) ----
  if (action.type === "next" && state.phase === "resolved") {
    return advanceTurn(state);
  }

  // ---- cpu-step: drive CPU turn end-to-end (greedy AI) ----
  if (action.type === "cpu-step") {
    return cpuStep(state);
  }

  return state;
}

// -----------------------------------------------------------------------------
// advanceTurn — switch active player or move on. Auto-retire active when at end.
// -----------------------------------------------------------------------------

function advanceTurn(s: LifeFullState): LifeFullState {
  let state = s;
  const player = getActivePlayer(state);
  // If active player just landed on retire-choice and has chosen, they're retired.
  // Move to next player; skip retired players. End game when both retired.
  if (bothRetired(state)) return { ...state, phase: "done" };

  // Switch active to the non-retired one. If current player retired, force switch.
  let newActive = flipActive(state.active);
  const other = newActive === "human" ? state.human : state.cpu;
  if (other.retired && !player.retired) {
    // current player still goes; keep active.
    newActive = state.active;
  }

  // Final position auto-retire if both moved beyond board (safety).
  state = { ...state, active: newActive, phase: "spinning", turn: state.turn + 1 };
  return state;
}

// -----------------------------------------------------------------------------
// cpuStep — single-step CPU action; loop driver lives in Game.tsx.
//
// Greedy CPU:
//  - Always career path (set at choose-path)
//  - Always buys insurance offered (max insurance bid per pitch)
//  - Always buys houses
//  - Sells house when offered (to take profit)
//  - Never plays spin-to-win (it's a coin flip; greedy = play if EV positive:
//      EV = 0.5 * 200 - 50 = 50, so play! → ALWAYS plays)
//  - Picks Millionaire Estates if cash≥$1000k, else Countryside Acres
// -----------------------------------------------------------------------------

function cpuStep(state: LifeFullState): LifeFullState {
  if (state.active !== "cpu") return state;
  if (state.phase === "done") return state;

  switch (state.phase) {
    case "spinning":
      return reducer(state, { type: "spin" });
    case "decision-marry":
      return reducer(state, { type: "marry-spin" });
    case "decision-house":
      return reducer(state, { type: "buy-house", buy: true });
    case "decision-sell":
      return reducer(state, { type: "sell-house", sell: true });
    case "decision-insurance":
      return reducer(state, { type: "buy-insurance", buy: true });
    case "decision-spin-win":
      return reducer(state, { type: "play-spin-to-win", play: true });
    case "decision-retire": {
      const p = getActivePlayer(state);
      const choice: "millionaire-estates" | "countryside-acres" =
        p.cash + p.houseValue >= 800 ? "millionaire-estates" : "countryside-acres";
      return reducer(state, { type: "pick-retirement", choice });
    }
    case "resolved":
      return reducer(state, { type: "next" });
    default:
      return state;
  }
}

// =============================================================================
// Scoring + terminal
// =============================================================================

export function finalScore(p: PlayerLifeState): number {
  // Final retirement score = cash + house value + payday actions accumulated - debt.
  // Retirement bonus: Millionaire Estates +200k IF cash>=1000, otherwise 0 (busted!)
  // Countryside Acres +100k regardless.
  let bonus = 0;
  if (p.retirementChoice === "millionaire-estates") {
    bonus = p.cash >= 1000 ? 200 : 0; // gambled and lost
  } else if (p.retirementChoice === "countryside-acres") {
    bonus = 100;
  }
  const paydayBonus = p.paydayCount * 5; // small accumulator
  const familyBonus = p.kids * 10 + (p.married ? 20 : 0);
  const raw = p.cash + p.houseValue - p.debt + bonus + paydayBonus + familyBonus;
  return Math.max(0, raw);
}

export function isTerminal(s: LifeFullState): { score: number } | null {
  if (s.phase !== "done") return null;
  const humanScore = finalScore(s.human);
  const cpuScore = finalScore(s.cpu);
  // Score the human's result; report 0 if CPU wins (loss on leaderboard).
  if (humanScore > cpuScore) return { score: humanScore };
  if (humanScore === cpuScore) return { score: humanScore };
  return { score: 0 };
}

// Convenience getter exported for UI
export { getActivePlayer };
