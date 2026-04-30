import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";

export const HAND_SIZE = 7;

export interface MiniRummySettings { dummy: boolean; }

export type Phase = "draw" | "discard" | "cpuTurn" | "done";

export interface MiniRummyState {
  rngSeed: number;
  deck: Card[];
  discard: Card[];     // top is last
  player: Card[];
  cpu: Card[];
  phase: Phase;
  turn: "player" | "cpu";
  log: string[];
  winner: "" | "player" | "cpu";
  selectedId: string;  // for discarding
  drewFromDiscard: boolean;
  cpuLastDraw: "deck" | "discard" | null;
}

export type MiniRummyAction =
  | { type: "drawDeck" }
  | { type: "drawDiscard" }
  | { type: "select"; id: string }
  | { type: "discard" }
  | { type: "knock" }
  | { type: "cpuPlay" };

export function rankVal(card: Card): number {
  if (card.rank === 1) return 1;
  return card.rank;
}

/** Find optimal meld decomposition - greedy with sets first then runs. Returns melds and unmelded. */
export function bestMelds(hand: Card[]): { melds: Card[][]; deadwood: Card[] } {
  // try several greedy strategies and pick best (least deadwood points)
  const strategies: { melds: Card[][]; deadwood: Card[] }[] = [];

  for (const setsFirst of [true, false]) {
    const remaining = [...hand];
    const melds: Card[][] = [];

    const trySets = () => {
      const byRank = new Map<number, Card[]>();
      for (const c of remaining) {
        const arr = byRank.get(c.rank) ?? [];
        arr.push(c);
        byRank.set(c.rank, arr);
      }
      for (const arr of byRank.values()) {
        if (arr.length >= 3) {
          melds.push([...arr]);
          for (const c of arr) {
            const idx = remaining.findIndex((x) => x.id === c.id);
            if (idx >= 0) remaining.splice(idx, 1);
          }
        }
      }
    };

    const tryRuns = () => {
      const bySuit = new Map<string, Card[]>();
      for (const c of remaining) {
        const arr = bySuit.get(c.suit) ?? [];
        arr.push(c);
        bySuit.set(c.suit, arr);
      }
      for (const arr of bySuit.values()) {
        arr.sort((a, b) => a.rank - b.rank);
        let run: Card[] = [];
        const flush = () => {
          if (run.length >= 3) {
            melds.push([...run]);
            for (const c of run) {
              const idx = remaining.findIndex((x) => x.id === c.id);
              if (idx >= 0) remaining.splice(idx, 1);
            }
          }
          run = [];
        };
        for (const c of arr) {
          if (run.length === 0) run.push(c);
          else if (c.rank === run[run.length - 1]!.rank + 1) run.push(c);
          else { flush(); run = [c]; }
        }
        flush();
      }
    };

    if (setsFirst) { trySets(); tryRuns(); }
    else { tryRuns(); trySets(); }

    strategies.push({ melds, deadwood: remaining });
  }

  // pick lowest deadwood points
  strategies.sort((a, b) => deadwoodPoints(a.deadwood) - deadwoodPoints(b.deadwood));
  return strategies[0]!;
}

export function deadwoodPoints(cards: Card[]): number {
  let p = 0;
  for (const c of cards) {
    if (c.rank === 1) p += 1;
    else if (c.rank >= 11) p += 10;
    else p += c.rank;
  }
  return p;
}

function freshDeck(seed: number): { deck: Card[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(1), rng);
  return { deck, nextSeed: Math.floor(rng() * 2 ** 31) };
}

function appendLog(log: string[], msg: string): string[] {
  const out = [...log, msg];
  if (out.length > 50) out.shift();
  return out;
}

export function initialState(seed: number, _s: MiniRummySettings): MiniRummyState {
  const { deck, nextSeed } = freshDeck(seed);
  const player = deck.slice(0, HAND_SIZE);
  const cpu = deck.slice(HAND_SIZE, HAND_SIZE * 2);
  const rest = deck.slice(HAND_SIZE * 2);
  const discard = [rest[0]!];
  const remaining = rest.slice(1);
  return {
    rngSeed: nextSeed,
    deck: remaining,
    discard,
    player,
    cpu,
    phase: "draw",
    turn: "player",
    log: ["You start. Draw from deck or discard, then drop a card."],
    winner: "",
    selectedId: "",
    drewFromDiscard: false,
    cpuLastDraw: null,
  };
}

function checkWin(state: MiniRummyState): MiniRummyState {
  const handP = state.player;
  const handC = state.cpu;
  // Win when total deadwood is 0 after discard (all melded)
  // We'll just check if hand has 7 melded, but during turn hand is 8; after discard 7.
  if (handP.length === HAND_SIZE) {
    const { deadwood } = bestMelds(handP);
    if (deadwood.length === 0) {
      return { ...state, phase: "done", winner: "player", log: appendLog(state.log, "You have all melds — you win!") };
    }
  }
  if (handC.length === HAND_SIZE) {
    const { deadwood } = bestMelds(handC);
    if (deadwood.length === 0) {
      return { ...state, phase: "done", winner: "cpu", log: appendLog(state.log, "CPU has all melds — CPU wins.") };
    }
  }
  return state;
}

function refillDeckIfNeeded(state: MiniRummyState): MiniRummyState {
  if (state.deck.length > 0) return state;
  if (state.discard.length <= 1) return state;
  const top = state.discard[state.discard.length - 1]!;
  const rest = state.discard.slice(0, -1);
  const rng = mulberry32(state.rngSeed);
  const reshuffled = shuffle(rest, rng);
  return {
    ...state,
    deck: reshuffled,
    discard: [top],
    rngSeed: Math.floor(rng() * 2 ** 31),
    log: appendLog(state.log, "Deck reshuffled from discard."),
  };
}

export function reducer(state: MiniRummyState, action: MiniRummyAction): MiniRummyState {
  if (state.phase === "done") return state;

  if (action.type === "drawDeck") {
    if (state.phase !== "draw" || state.turn !== "player") return state;
    let s = refillDeckIfNeeded(state);
    if (s.deck.length === 0) {
      // stalemate — score by deadwood
      const { deadwood: pd } = bestMelds(s.player);
      const { deadwood: cd } = bestMelds(s.cpu);
      const winner: "player" | "cpu" = deadwoodPoints(pd) <= deadwoodPoints(cd) ? "player" : "cpu";
      return { ...s, phase: "done", winner, log: appendLog(s.log, "Stockpile empty — score by deadwood.") };
    }
    const card = s.deck[0]!;
    const player = [...s.player, card];
    return { ...s, deck: s.deck.slice(1), player, phase: "discard", drewFromDiscard: false, log: appendLog(s.log, `You drew ${card.suit}${card.rank}`) };
  }

  if (action.type === "drawDiscard") {
    if (state.phase !== "draw" || state.turn !== "player") return state;
    if (state.discard.length === 0) return state;
    const card = state.discard[state.discard.length - 1]!;
    const player = [...state.player, card];
    return {
      ...state,
      discard: state.discard.slice(0, -1),
      player,
      phase: "discard",
      drewFromDiscard: true,
      log: appendLog(state.log, `You took ${card.suit}${card.rank} from discard.`),
    };
  }

  if (action.type === "select") {
    return { ...state, selectedId: action.id };
  }

  if (action.type === "discard") {
    if (state.phase !== "discard" || state.turn !== "player") return state;
    if (!state.selectedId) return state;
    const idx = state.player.findIndex((c) => c.id === state.selectedId);
    if (idx < 0) return state;
    const card = state.player[idx]!;
    const player = state.player.filter((c) => c.id !== state.selectedId);
    let next: MiniRummyState = {
      ...state,
      player,
      discard: [...state.discard, card],
      selectedId: "",
      phase: "draw",
      turn: "cpu",
      log: appendLog(state.log, `You discarded ${card.suit}${card.rank}.`),
    };
    next = checkWin(next);
    if (next.phase === "done") return next;
    return { ...next, phase: "cpuTurn" };
  }

  if (action.type === "knock") {
    if (state.phase !== "discard" || state.turn !== "player") return state;
    const { melds, deadwood } = bestMelds(state.player);
    if (deadwood.length === 0 || deadwoodPoints(deadwood) <= 5) {
      // immediate win for low deadwood (rummy)
      void melds;
      return { ...state, phase: "done", winner: "player", log: appendLog(state.log, `You knocked! Deadwood ${deadwoodPoints(deadwood)}.`) };
    }
    return state;
  }

  if (action.type === "cpuPlay") {
    if (state.phase !== "cpuTurn") return state;
    return cpuTurn(state);
  }

  return state;
}

function cpuTurn(state: MiniRummyState): MiniRummyState {
  let s = refillDeckIfNeeded(state);
  if (s.deck.length === 0 && s.discard.length === 0) {
    const { deadwood: pd } = bestMelds(s.player);
    const { deadwood: cd } = bestMelds(s.cpu);
    const winner: "player" | "cpu" = deadwoodPoints(pd) <= deadwoodPoints(cd) ? "player" : "cpu";
    return { ...s, phase: "done", winner, log: appendLog(s.log, "Stockpile empty — score by deadwood.") };
  }

  // Decide which to draw: peek at discard top — does it improve the meld score?
  const baseScore = -deadwoodPoints(bestMelds(s.cpu).deadwood);
  let drawn: Card | null = null;
  let from: "deck" | "discard" = "deck";
  if (s.discard.length > 0) {
    const top = s.discard[s.discard.length - 1]!;
    const trial = [...s.cpu, top];
    const trialScore = -deadwoodPoints(bestMelds(trial).deadwood);
    if (trialScore > baseScore) {
      drawn = top;
      from = "discard";
      s = { ...s, discard: s.discard.slice(0, -1) };
    }
  }
  if (drawn === null) {
    if (s.deck.length === 0) {
      const { deadwood: pd } = bestMelds(s.player);
      const { deadwood: cd } = bestMelds(s.cpu);
      const winner: "player" | "cpu" = deadwoodPoints(pd) <= deadwoodPoints(cd) ? "player" : "cpu";
      return { ...s, phase: "done", winner, log: appendLog(s.log, "Stockpile empty.") };
    }
    drawn = s.deck[0]!;
    s = { ...s, deck: s.deck.slice(1) };
  }
  let cpu = [...s.cpu, drawn];
  s = { ...s, cpu, log: appendLog(s.log, `CPU drew from ${from}.`) };

  // Check for win first
  const { deadwood: dwAfterDraw } = bestMelds(cpu);
  if (dwAfterDraw.length === 0) {
    return { ...s, phase: "done", winner: "cpu", log: appendLog(s.log, "CPU formed all melds — CPU wins.") };
  }

  // Find worst card to discard: try discarding each, pick lowest deadwood
  let bestDiscardId = cpu[0]!.id;
  let bestScore = Infinity;
  for (const c of cpu) {
    const trial = cpu.filter((x) => x.id !== c.id);
    const score = deadwoodPoints(bestMelds(trial).deadwood);
    if (score < bestScore) { bestScore = score; bestDiscardId = c.id; }
  }
  const discardCard = cpu.find((c) => c.id === bestDiscardId)!;
  cpu = cpu.filter((c) => c.id !== bestDiscardId);
  s = { ...s, cpu, discard: [...s.discard, discardCard], log: appendLog(s.log, `CPU discarded ${discardCard.suit}${discardCard.rank}.`) };

  // CPU knock if low deadwood
  if (bestScore === 0) {
    return { ...s, phase: "done", winner: "cpu", log: appendLog(s.log, "CPU has rummy!") };
  }

  let next: MiniRummyState = { ...s, phase: "draw", turn: "player", cpuLastDraw: from };
  next = checkWin(next);
  return next;
}

export function isTerminal(state: MiniRummyState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: win = 100 + (deadwood lead), loss = max(0, 50 - own deadwood)
  const { deadwood: pd } = bestMelds(state.player);
  const { deadwood: cd } = bestMelds(state.cpu);
  if (state.winner === "player") return { score: 100 + deadwoodPoints(cd) - deadwoodPoints(pd) };
  return { score: Math.max(0, 50 - deadwoodPoints(pd)) };
}
