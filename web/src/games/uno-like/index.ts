import type { GamePlugin } from "../../platform/game-plugin/types.js";
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
  settings,
  initialState: initial,
  reducer,
  isTerminal,
  component: UnoLike,
};
