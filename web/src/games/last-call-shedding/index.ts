import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LastCallSheddingState, LastCallSheddingAction, LastCallSheddingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LastCallSheddingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LastCallSheddingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lastCallSheddingPlugin: GamePlugin<LastCallSheddingState, LastCallSheddingAction, typeof settings> = {
  id: "last-call-shedding", title: "Last Call", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "New Zealand Crazy Eights variant; first to empty their hand wins.",
  howToPlay: "Last Call is a New Zealand favourite that takes Crazy Eights down to its bones. Both you and the CPU receive seven cards, then a starter is flipped onto the discard pile. On your turn, you may play any card that matches the rank or the suit on top. If you cannot play, you draw one card and pass.\n\nWhoever plays their final card first wins the round. The first card you play out of your hand must be announced — Last Call! — but here the engine handles the etiquette. Six rounds are played. The winner of each round earns twenty points plus five points per card left in the loser's hand.\n\nYou can play any card that fits, so most of the work is just hoping to draw favourable matches. A sweep would cap out around 130 points; a typical run finishes around seventy. Don't worry too much about strategy: the deck does most of the heavy lifting in this one.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LastCallSheddingSettings),
  reducer, isTerminal, 
  hint: (state: LastCallSheddingState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-last-call-shedding-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-last-call-shedding-next"]', pulses: 3 };
    return null;
  },
  component: LastCallSheddingGame,
};
