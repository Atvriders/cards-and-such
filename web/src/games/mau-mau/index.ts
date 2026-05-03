import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MauMauState, MauMauAction, MauMauSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MauMauGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MauMauGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const mauMauPlugin: GamePlugin<MauMauState, MauMauAction, typeof settings> = {
  id: "mau-mau", title: "Mau Mau", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German shedding classic — match rank or suit, 7s force a draw, jacks change suit.",
  howToPlay: "Mau Mau is the German cousin of Crazy Eights and a direct ancestor of Uno. You and the CPU each start with seven cards and a single card is flipped to start the discard pile. On your turn, you must play a card that matches either the rank or the suit of the top discard. If you cannot play, you must draw one card and skip.\n\nA few action cards spice things up: 7s force the next player to draw two cards, and jacks let the player choose any new suit (the CPU just picks at random). Aces simply skip the opponent.\n\nThe first player to empty their hand wins the round. The game lasts six rounds. You score twenty points for each round you win, plus a bonus of five points for every card still in the CPU's hand when you go out.\n\nStrategy is mostly luck-driven, but holding back jacks for tight spots and stalling sevens until you really need them can change the outcome. A good run is around eighty points; emptying your hand all six rounds is unrealistic but possible.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MauMauSettings),
  reducer, isTerminal,
  hint: (state: MauMauState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-mau-mau-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mau-mau-next"]', pulses: 3 };
    return null;
  },
  component: MauMauGame,
};
