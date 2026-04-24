import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MaoSettings { dummy: "off" }

export type MaoPhase = "playing" | "penalty" | "done";

// Secret rules active in this session (randomly selected from pool)
export type SecretRule = "say-good-game-on-ace" | "say-have-a-nice-day-on-7" | "point-on-jack" | "say-suit-name-on-hearts";

export const ALL_RULES: SecretRule[] = [
  "say-good-game-on-ace",
  "say-have-a-nice-day-on-7",
  "point-on-jack",
  "say-suit-name-on-hearts",
];

export const RULE_HINTS: Record<SecretRule, string> = {
  "say-good-game-on-ace": "Say \"Good game\" when playing an Ace",
  "say-have-a-nice-day-on-7": "Say \"Have a nice day\" when playing a 7",
  "point-on-jack": "Click \'Point!\' when playing a Jack",
  "say-suit-name-on-hearts": "Announce the suit name when playing a Heart",
};

export interface MaoState {
  settings: MaoSettings;
  hands: readonly (readonly Card[])[];
  deck: readonly Card[];
  discard: readonly Card[];
  turn: number;
  currentSuit: Suit;
  activeRules: readonly SecretRule[];
  discoveredRules: readonly SecretRule[];
  penaltyMessage: string;
  penaltyPlayer: number;
  phase: MaoPhase;
  rngSeed: number;
}

export type MaoAction =
  | { type: "play"; cardId: string; announcement?: string }
  | { type: "draw" }
  | { type: "acknowledgePenalty" };

function canPlay(card: Card, top: Card, currentSuit: Suit): boolean {
  return card.suit === currentSuit || card.rank === top.rank;
}

function checkRuleViolation(card: Card, announcement: string | undefined, rules: readonly SecretRule[]): string | null {
  for (const rule of rules) {
    if (rule === "say-good-game-on-ace" && card.rank === 1) {
      if (!announcement || !announcement.toLowerCase().includes("good game")) {
        return "Penalty! You must say \"Good game\" when playing an Ace.";
      }
    }
    if (rule === "say-have-a-nice-day-on-7" && card.rank === 7) {
      if (!announcement || !announcement.toLowerCase().includes("have a nice day")) {
        return "Penalty! You must say \"Have a nice day\" when playing a 7.";
      }
    }
    if (rule === "point-on-jack" && card.rank === 11) {
      if (!announcement || !announcement.toLowerCase().includes("point")) {
        return "Penalty! You must say \"Point\" when playing a Jack.";
      }
    }
    if (rule === "say-suit-name-on-hearts" && card.suit === "♥") {
      const suitWords = ["hearts", "heart", "♥"];
      if (!announcement || !suitWords.some(w => announcement.toLowerCase().includes(w))) {
        return "Penalty! You must announce \"Hearts\" when playing a Heart.";
      }
    }
  }
  return null;
}

function drawCards(deck: readonly Card[], discard: readonly Card[], count: number, rngSeed: number): {
  drawn: Card[]; deck: Card[]; discard: Card[]; rngSeed: number;
} {
  let d = [...deck];
  let dis = [...discard];
  let seed = rngSeed;
  if (d.length < count && dis.length > 1) {
    const rng = mulberry32(seed);
    seed = Math.floor(rng() * 2 ** 31);
    const top = dis[dis.length - 1]!;
    d = [...d, ...shuffle(dis.slice(0, -1), rng)];
    dis = [top];
  }
  const drawn = d.splice(0, Math.min(count, d.length));
  return { drawn, deck: d, discard: dis, rngSeed: seed };
}

function botTurn(state: MaoState): MaoState {
  const seat = state.turn;
  const hand = state.hands[seat]!;
  const top = state.discard[state.discard.length - 1]!;
  const playable = hand.filter(c => canPlay(c, top, state.currentSuit));

  if (playable.length > 0) {
    const card = playable[0]!;
    const newHand = hand.filter(c => c.id !== card.id);
    const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
    const newDiscard = [...state.discard, card];
    const next = (seat + 1) % 4;
    if (newHand.length === 0) {
      return { ...state, hands: newHands, discard: newDiscard, currentSuit: card.suit, turn: next, phase: "done" };
    }
    return { ...state, hands: newHands, discard: newDiscard, currentSuit: card.suit, turn: next };
  }

  // Draw
  const result = drawCards(state.deck, state.discard, 1, state.rngSeed);
  const newHand = [...hand, ...result.drawn];
  const newHands = state.hands.map((h, i) => i === seat ? newHand : h);
  const next = (seat + 1) % 4;
  return { ...state, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, turn: next };
}

function runBots(state: MaoState): MaoState {
  let s = state;
  let safety = 0;
  while (s.phase === "playing" && s.turn !== 0 && safety < 500) {
    safety++;
    s = botTurn(s);
  }
  return s;
}

export function initialState(seed: number, settings: MaoSettings): MaoState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < 5; i++) for (let p = 0; p < 4; p++) hands[p]!.push(deck[i * 4 + p]!);

  const remaining = deck.slice(20);
  const startIdx = remaining.findIndex(c => c.rank !== 1);
  const firstCard = remaining.splice(startIdx < 0 ? 0 : startIdx, 1)[0]!;

  // Pick 2 random active rules
  const rng2 = mulberry32(nextSeed);
  const shuffledRules = [...ALL_RULES].sort(() => rng2() - 0.5);
  const activeRules = shuffledRules.slice(0, 2);

  return {
    settings, hands: hands as unknown as Card[][], deck: remaining, discard: [firstCard],
    turn: 0, currentSuit: firstCard.suit, activeRules, discoveredRules: [],
    penaltyMessage: "", penaltyPlayer: -1, phase: "playing", rngSeed: nextSeed,
  };
}

export function reducer(state: MaoState, action: MaoAction): MaoState {
  if (state.phase === "done" || state.turn !== 0) return state;
  if (state.phase === "penalty" && action.type !== "acknowledgePenalty") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: MaoState = { ...state, rngSeed: nextSeed };

  if (action.type === "acknowledgePenalty") {
    return runBots({ ...s, phase: "playing" });
  }

  if (action.type === "draw") {
    const hand = s.hands[0]!;
    const result = drawCards(s.deck, s.discard, 1, s.rngSeed);
    const newHand = [...hand, ...result.drawn];
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const next = 1;
    s = { ...s, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed, turn: next };
    return runBots(s);
  }

  if (action.type === "play") {
    const hand = s.hands[0]!;
    const top = s.discard[s.discard.length - 1]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlay(card, top, s.currentSuit)) return state;

    // Check rule violations
    const violation = checkRuleViolation(card, action.announcement, s.activeRules);
    if (violation) {
      // Discover the rule
      const violated = s.activeRules.find(r => {
        if (r === "say-good-game-on-ace" && card.rank === 1) return true;
        if (r === "say-have-a-nice-day-on-7" && card.rank === 7) return true;
        if (r === "point-on-jack" && card.rank === 11) return true;
        if (r === "say-suit-name-on-hearts" && card.suit === "♥") return true;
        return false;
      });
      const discovered = violated && !s.discoveredRules.includes(violated)
        ? [...s.discoveredRules, violated] : s.discoveredRules;

      // Draw penalty card
      const result = drawCards(s.deck, s.discard, 1, s.rngSeed);
      const newHand = [...hand, ...result.drawn];
      const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
      return { ...s, hands: newHands, deck: result.deck, discard: result.discard, rngSeed: result.rngSeed,
        discoveredRules: discovered, penaltyMessage: violation, penaltyPlayer: 0, phase: "penalty" };
    }

    const newHand = hand.filter(c => c.id !== action.cardId);
    const newHands = s.hands.map((h, i) => i === 0 ? newHand : h);
    const newDiscard = [...s.discard, card];

    if (newHand.length === 0) {
      return { ...s, hands: newHands, discard: newDiscard, currentSuit: card.suit, phase: "done" };
    }

    s = { ...s, hands: newHands, discard: newDiscard, currentSuit: card.suit, turn: 1, penaltyMessage: "" };
    return runBots(s);
  }

  return state;
}

export function isTerminal(state: MaoState): { score: number } | null {
  if (state.phase !== "done") return null;
  const won = state.hands[0]!.length === 0;
  return { score: won ? 100 : 0 };
}
