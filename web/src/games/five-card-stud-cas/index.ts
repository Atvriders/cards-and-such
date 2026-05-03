import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FiveCardStudCasState, FiveCardStudCasAction, FiveCardStudCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FiveCardStudCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FiveCardStudCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: FiveCardStudCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-five-card-stud-cas-secondary"]', pulses: 3 };
  return null;
};
export const fiveCardStudCasPlugin: GamePlugin<FiveCardStudCasState, FiveCardStudCasAction, typeof settings> = {
  id: "five-card-stud-cas", title: "Five-Card Stud (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino five-card stud against the dealer.",
  howToPlay: "Five-Card Stud is the historical foundation of stud poker: each player receives one face-down card and four face-up cards, with a betting round between each deal. In this casino-style adaptation you play against the dealer over twelve rounds, with both hands fully revealed.\n\nEach round you receive five cards and see five dealer cards. You may play (compare hands and resolve the bet) or fold (forfeit the bet). The hand-rank comparison uses card-sum across all five cards, with aces high.\n\nA win pays fourteen points (with a king-high bonus of three additional); a tie pays five; a fold or loss pays zero. Twelve rounds are played.\n\nExpected score across twelve rounds is sixty to ninety. Five-Card Stud's signature is the visible play — every card matters. With aces and high cards already showing, the swing toward big wins is steady but never huge. Fold when your hand is obviously poor; play otherwise. One king-high win across the set hits the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FiveCardStudCasSettings),
  reducer, isTerminal, hint: hint, component: FiveCardStudCasGame,
};
