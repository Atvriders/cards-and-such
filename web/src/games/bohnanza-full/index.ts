import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { BohnanzaState, BohnanzaAction, BohnanzaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const BohnanzaFullComponent = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.BohnanzaFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const bohnanzaFullPlugin: GamePlugin<BohnanzaState, BohnanzaAction, typeof settings> = {
  id: "bohnanza-full",
  title: "Bohnanza",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Bean farming card game: plant, harvest, and out-coin three CPU opponents over three deck cycles.",
  howToPlay:
    "Bohnanza is the classic bean-farming game. You play one of four farmers (you plus three CPUs), each with two fields. The deck has 11 bean varieties, each in a different quantity (Coffee 24, Wax 22, Blue 20, Chili 18, Stink 16, Green 14, Soy 12, Black-Eyed 10, Red 8, Garden 6, Cocoa 4).\n\nKey rule: hand order is preserved. The leftmost card is the next to plant; you cannot reorder your hand.\n\nOn your turn:\n1. Plant the front card of your hand into a field (must be a matching field or empty; otherwise you must harvest a field first). Optionally plant a second card.\n2. Flip two cards from the deck for the trading phase. In this implementation trades are auto-accepted (skip), so the revealed cards are then planted (you choose which field) or discarded if there's no room.\n3. Draw three new cards to the back of your hand.\n\nFields convert to coins via the bean coin tables. For example Coffee scores 1/2/3/4 coins at 4/7/10/12 cards; rarer beans need fewer cards. The cards that exceed the coin count are discarded.\n\nThe game ends after the deck has cycled (run out and been reshuffled) three times. Your score is your final coin total, plus 5 bonus coins if you have strictly the most coins.\n\nAdvanced rules omitted: player-to-player negotiated trades (auto-accept simplification); third bean field purchase; donating cards.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BohnanzaSettings),
  reducer,
  isTerminal,
  hint: (state: BohnanzaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.current !== 0) return null;
    return { selector: '[data-testid="hint-target-bohnanza-full-primary"]', pulses: 3 };
  },
  component: BohnanzaFullComponent,
};
