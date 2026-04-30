import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { newDeck, shuffle, type Card } from "../../engines/deck/index.js";

export const MAX_ROUNDS = 30;

export interface MiniWarSettings { dummy: boolean; }

export interface MiniWarState {
  rngSeed: number;
  player: Card[];        // player's stockpile (front of array = top)
  cpu: Card[];           // cpu's stockpile
  playerPlayed: Card[];  // cards revealed/buried on player side this round
  cpuPlayed: Card[];     // cards revealed/buried on cpu side this round
  phase: "ready" | "reveal" | "war" | "done";
  round: number;
  warDepth: number;      // tracks number of war escalations in this round
  log: string[];
  result: "" | "player" | "cpu" | "tie" | "ongoing";
  winner: "" | "player" | "cpu" | "tie";
}

export type MiniWarAction = { type: "flip" } | { type: "next" } | { type: "warFlip" };

/** Compare two cards using War rules (Ace high). Returns 1 if a>b, -1 if a<b, 0 tie. */
export function compareWar(a: Card, b: Card): number {
  const va = a.rank === 1 ? 14 : a.rank;
  const vb = b.rank === 1 ? 14 : b.rank;
  return va > vb ? 1 : va < vb ? -1 : 0;
}

export function initialState(seed: number, _s: MiniWarSettings): MiniWarState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(1), rng);
  const player = deck.slice(0, 26);
  const cpu = deck.slice(26, 52);
  const next = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: next,
    player,
    cpu,
    playerPlayed: [],
    cpuPlayed: [],
    phase: "ready",
    round: 0,
    warDepth: 0,
    log: ["Battle begins. Click Flip to play your top card."],
    result: "",
    winner: "",
  };
}

function appendLog(log: string[], msg: string): string[] {
  const out = [...log, msg];
  if (out.length > 60) out.shift();
  return out;
}

function checkEnd(state: MiniWarState): MiniWarState {
  // Game ends when one side runs out OR after MAX_ROUNDS
  if (state.player.length === 0 && state.cpu.length === 0) {
    return { ...state, phase: "done", winner: "tie", log: appendLog(state.log, "Both empty — tie game.") };
  }
  if (state.player.length === 0) {
    return { ...state, phase: "done", winner: "cpu", log: appendLog(state.log, "You're out of cards — CPU wins.") };
  }
  if (state.cpu.length === 0) {
    return { ...state, phase: "done", winner: "player", log: appendLog(state.log, "CPU is out of cards — you win!") };
  }
  if (state.round >= MAX_ROUNDS) {
    const w = state.player.length > state.cpu.length ? "player" : state.player.length < state.cpu.length ? "cpu" : "tie";
    return { ...state, phase: "done", winner: w, log: appendLog(state.log, `Round limit reached. Cards: you ${state.player.length} vs CPU ${state.cpu.length}.`) };
  }
  return state;
}

export function reducer(state: MiniWarState, action: MiniWarAction): MiniWarState {
  if (state.phase === "done") return state;

  if (action.type === "flip") {
    if (state.phase !== "ready") return state;
    if (state.player.length === 0 || state.cpu.length === 0) return state;
    const pCard = state.player[0]!;
    const cCard = state.cpu[0]!;
    const cmp = compareWar(pCard, cCard);
    const playerPlayed = [pCard];
    const cpuPlayed = [cCard];
    if (cmp === 0) {
      // war
      return {
        ...state,
        player: state.player.slice(1),
        cpu: state.cpu.slice(1),
        playerPlayed,
        cpuPlayed,
        phase: "war",
        warDepth: 1,
        round: state.round + 1,
        result: "tie",
        log: appendLog(state.log, `Round ${state.round + 1}: tie! War declared.`),
      };
    }
    const winner = cmp > 0 ? "player" : "cpu";
    const winnings = [...playerPlayed, ...cpuPlayed];
    let np = state.player.slice(1);
    let nc = state.cpu.slice(1);
    if (winner === "player") np = [...np, ...winnings];
    else nc = [...nc, ...winnings];
    const next: MiniWarState = {
      ...state,
      player: np,
      cpu: nc,
      playerPlayed,
      cpuPlayed,
      phase: "reveal",
      round: state.round + 1,
      result: winner,
      log: appendLog(state.log, `Round ${state.round + 1}: ${winner === "player" ? "You" : "CPU"} take${winner === "player" ? "" : "s"} ${winnings.length} cards.`),
    };
    return checkEnd(next);
  }

  if (action.type === "warFlip") {
    if (state.phase !== "war") return state;
    // Need 4 cards each (3 down, 1 up). If short, the side with too few loses everything they have.
    const needed = 4;
    if (state.player.length < needed || state.cpu.length < needed) {
      // whoever can't field the war loses
      const playerCanWar = state.player.length >= needed;
      const cpuCanWar = state.cpu.length >= needed;
      let winner: "player" | "cpu" | "tie" = "tie";
      if (!playerCanWar && cpuCanWar) winner = "cpu";
      else if (playerCanWar && !cpuCanWar) winner = "player";
      const allCards = [...state.playerPlayed, ...state.cpuPlayed, ...state.player, ...state.cpu];
      let np: Card[] = [];
      let nc: Card[] = [];
      if (winner === "player") np = allCards;
      else if (winner === "cpu") nc = allCards;
      const next: MiniWarState = {
        ...state,
        player: np,
        cpu: nc,
        playerPlayed: [],
        cpuPlayed: [],
        phase: "reveal",
        result: winner,
        log: appendLog(state.log, `Couldn't field full war — ${winner === "tie" ? "split" : winner + " sweeps"}.`),
      };
      return checkEnd(next);
    }
    // 3 cards face down + 1 face up
    const pBuried = state.player.slice(0, 3);
    const cBuried = state.cpu.slice(0, 3);
    const pUp = state.player[3]!;
    const cUp = state.cpu[3]!;
    const cmp = compareWar(pUp, cUp);
    const playerPlayed = [...state.playerPlayed, ...pBuried, pUp];
    const cpuPlayed = [...state.cpuPlayed, ...cBuried, cUp];
    if (cmp === 0) {
      return {
        ...state,
        player: state.player.slice(4),
        cpu: state.cpu.slice(4),
        playerPlayed,
        cpuPlayed,
        warDepth: state.warDepth + 1,
        log: appendLog(state.log, `War tied again at depth ${state.warDepth + 1}!`),
      };
    }
    const winner = cmp > 0 ? "player" : "cpu";
    const winnings = [...playerPlayed, ...cpuPlayed];
    let np = state.player.slice(4);
    let nc = state.cpu.slice(4);
    if (winner === "player") np = [...np, ...winnings];
    else nc = [...nc, ...winnings];
    const next: MiniWarState = {
      ...state,
      player: np,
      cpu: nc,
      playerPlayed,
      cpuPlayed,
      phase: "reveal",
      result: winner,
      log: appendLog(state.log, `War resolved: ${winner === "player" ? "You" : "CPU"} take${winner === "player" ? "" : "s"} ${winnings.length} cards.`),
    };
    return checkEnd(next);
  }

  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    const cleared: MiniWarState = {
      ...state,
      playerPlayed: [],
      cpuPlayed: [],
      phase: "ready",
      result: "",
      warDepth: 0,
    };
    return checkEnd(cleared);
  }

  return state;
}

export function isTerminal(state: MiniWarState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score: player wins = 100, tie = 50, loss = (cards held) * 2
  if (state.winner === "player") return { score: 100 + state.player.length * 2 };
  if (state.winner === "tie") return { score: 50 };
  return { score: state.player.length * 2 };
}
