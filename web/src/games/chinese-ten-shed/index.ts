import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseTenShedState, ChineseTenShedAction, ChineseTenShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChineseTenShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChineseTenShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseTenShedPlugin: GamePlugin<ChineseTenShedState, ChineseTenShedAction, typeof settings> = {
  id: "chinese-ten-shed", title: "Chinese Ten", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asian shedding game where you discard pairs that add to ten.",
  howToPlay: "Chinese Ten is a quiet Asian matching game where players try to clear their hand by combining cards into pairs that sum to exactly ten. Cards two through nine match by their face value (a 3 pairs with a 7, a 4 with a 6, etc.) Tens, jacks, queens, and kings pair only with another card of the same rank. Aces pair with another ace.\n\nYou start each round with seven cards and the top of the deck is exposed. On your turn you may discard a card that pairs with the exposed card or with a card from your own hand. The CPU follows with a random legal pair. The first to clear their hand wins the round.\n\nSix rounds are played. Each round you win earns twenty-five points plus five per card the CPU still holds. Doing well requires holding mid-value cards (3s through 7s) which match flexibly. A typical good run lands between seventy-five and one hundred points; a clean sweep would be remarkable.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseTenShedSettings),
  reducer, isTerminal, 
  hint: (state: ChineseTenShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-chinese-ten-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chinese-ten-shed-next"]', pulses: 3 };
    return null;
  },
  component: ChineseTenShedGame,
};
