import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SwitchSheddingState, SwitchSheddingAction, SwitchSheddingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SwitchSheddingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SwitchSheddingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const switchSheddingPlugin: GamePlugin<SwitchSheddingState, SwitchSheddingAction, typeof settings> = {
  id: "switch-shedding", title: "Switch", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British Crazy Eights variant — match rank or suit; eights are wild.",
  howToPlay: "Switch is the British shedding-card classic that locals will swear is older and better than Crazy Eights. The rules are simple: each player starts with seven cards, the top card of the deck is flipped to start a discard pile, and on your turn you must play a card matching the top card by rank or suit. Eights are wild and let you nominate a new suit (the CPU randomises). If you cannot play, you draw a card and lose the turn.\n\nWhoever discards their last card first wins the round. Six rounds are played in total. You score twenty points per round won, plus five points for every card left in the CPU's hand at that moment. Losing a round earns nothing.\n\nThe play is breezy and relies on getting the right cards at the right time. Aim for around eighty points across the six rounds; a clean six-round sweep would mean the deck loved you all night.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SwitchSheddingSettings),
  reducer, isTerminal, 
  hint: (state: SwitchSheddingState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-switch-shedding-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-switch-shedding-next"]', pulses: 3 };
    return null;
  },
  component: SwitchSheddingGame,
};
