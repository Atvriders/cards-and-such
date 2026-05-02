import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import {
  unoInitial, unoReduce, unoTerminal,
  type UnoLikeState, type UnoLikeAction, type UnoColor,
} from "@cards/shared";
import { UnoLike } from "./UnoLike.js";

const settings = {
  bots: { kind: "enum" as const, label: "Opponents", options: ["1","2","3"] as const, default: "3" as const },
} as const;

type SPState = UnoLikeState & { settings: { bots: "1" | "2" | "3" } };

function initial(seed: number, s: { bots: "1" | "2" | "3" }): SPState {
  const seats = Number(s.bots) + 1;
  return { ...unoInitial(seed, seats), settings: s };
}

function botChooseColor(hand: UnoLikeState["hands"][number]): UnoColor {
  const counts: Record<UnoColor, number> = { red: 0, yellow: 0, green: 0, blue: 0 };
  for (const c of hand) if ("color" in c.card) counts[c.card.color]++;
  return (Object.keys(counts) as UnoColor[]).sort((a, b) => counts[b] - counts[a])[0]!;
}

function matches(c: UnoLikeState["hands"][number][number], state: UnoLikeState): boolean {
  const top = state.discardTop.card;
  if (state.pendingDraws > 0) {
    if (top.kind === "draw-2" && c.card.kind === "draw-2") return true;
    if (top.kind === "wild-draw-4" && c.card.kind === "wild-draw-4") return true;
    return false;
  }
  if ("color" in c.card && c.card.color === state.activeColor) return true;
  if (top.kind === "number" && c.card.kind === "number" && c.card.value === top.value) return true;
  if (top.kind === c.card.kind && c.card.kind !== "number") return true;
  return false;
}

function botPlay(state: UnoLikeState, seat: number): UnoLikeAction {
  const hand = state.hands[seat] ?? [];
  // Find a legal card; avoid wild-draw-4 unless forced
  const legal = hand.find((c) => {
    if (c.card.kind === "wild-draw-4") {
      return !hand.some((x) => x.card.kind !== "wild" && x.card.kind !== "wild-draw-4" && matches(x, state));
    }
    if (c.card.kind === "wild") return true;
    return matches(c, state);
  });
  if (legal) {
    return {
      type: "play",
      cardId: legal.id,
      ...(legal.card.kind === "wild" || legal.card.kind === "wild-draw-4"
        ? { chosenColor: botChooseColor(hand) }
        : {}),
    };
  }
  return { type: "draw" };
}

function reducer(state: SPState, action: UnoLikeAction): SPState {
  const nextBase = unoReduce(state, action, state.turn as 0 | 1 | 2 | 3) as SPState;
  let current: SPState = nextBase === state ? state : { ...nextBase, settings: state.settings };

  // Loop bot turns until it's back to seat 0 or game over.
  while (current.winner === null && current.turn !== 0) {
    const seatIdx = current.turn;
    const botAction = botPlay(current, seatIdx);
    const after = unoReduce(current, botAction, seatIdx as 0 | 1 | 2 | 3);
    if (after === current) {
      // Bot couldn't act; force-draw once then pass.
      const forced = unoReduce(current, { type: "draw" }, seatIdx as 0 | 1 | 2 | 3);
      const passed = unoReduce(forced, { type: "pass" }, seatIdx as 0 | 1 | 2 | 3);
      current = { ...(passed as SPState), settings: state.settings };
      continue;
    }
    current = { ...(after as SPState), settings: state.settings };
  }
  return current;
}

function isTerminal(state: SPState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

export const unoLikePlugin: GamePlugin<SPState, UnoLikeAction, typeof settings> = {
  id: "uno-like",
  title: "Uno-like",
  category: "cards",
  players: { min: 2, max: 4, multiplayer: true },
  description: "Shed your hand. Match by color, number, or action.",
  howToPlay: `Be the first player to shed all cards from your hand. You play as seat 0; the bots play automatically after each of your turns.

Matching: On your turn, play a card that matches the top discard by color or by card type/number. For example, a Blue 5 can be followed by any Blue card or any 5 of any color.

Special cards: Skip — next player loses a turn. Reverse — changes the direction of play. Draw 2 — next player draws 2 and loses their turn (you can stack Draw 2s if you hold one). Wild — play on anything; you choose the new active color. Wild Draw 4 — like Wild, but next player draws 4; only legal when you hold no card matching the current color.

If you cannot play, click Draw to take a card from the deck. If the drawn card is playable, you may immediately play it.

Scoring: If you win (empty your hand first), you score 100. If a bot empties their hand first, you score 0.

Settings: Set the number of opponents (1–3 bots). More opponents means more chaos and Draw cards directed at you.

Tips: Save Wild Draw 4 cards for critical moments — playing them when you have other legal plays is against the rules and bots penalize it internally. Try to thin out high-value cards early.`,
  settings,
  initialState: initial,
  reducer,
  isTerminal,
  hint: (state: SPState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const myHand = state.hands[0] ?? [];
    // 1) Find a non-wild legal card.
    const nonWild = myHand.find((c) =>
      c.card.kind !== "wild" && c.card.kind !== "wild-draw-4" && matches(c, state),
    );
    if (nonWild) return { selector: `[data-testid="hand-card-${nonWild.id}"]`, pulses: 3 };
    // 2) Plain wild.
    const wild = myHand.find((c) => c.card.kind === "wild");
    if (wild) return { selector: `[data-testid="hand-card-${wild.id}"]`, pulses: 3 };
    // 3) Wild Draw 4 if no plain match.
    const wd4 = myHand.find((c) => c.card.kind === "wild-draw-4");
    if (wd4) return { selector: `[data-testid="hand-card-${wd4.id}"]`, pulses: 3 };
    // 4) Draw.
    return { selector: '[data-testid="hint-target-uno-like-draw"]', pulses: 3 };
  },
  component: UnoLike,
};
