import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnstableUnicornsMiniState, UnstableUnicornsMiniAction, UnstableUnicornsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UnstableUnicornsMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UnstableUnicornsMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const unstableUnicornsMiniPlugin: GamePlugin<UnstableUnicornsMiniState, UnstableUnicornsMiniAction, typeof settings> = {
  id: "unstable-unicorns-mini", title: "Unstable Unicorns Mini", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Unstable Unicorns deck-builder trivia. Identify card type from name.",
  howToPlay: "Unstable Unicorns Mini quizzes you on the wildly successful Kickstarter card game Unstable Unicorns by TeeTurtle (2017). Twelve rounds present a card name; you pick its type — Baby Unicorn, Basic Unicorn, Magical Unicorn, Magic, Upgrade, Downgrade, Instant. Ten points per correct, 120 max. The win condition is to build a stable of seven Unicorns. Cards like 'Black Knight Unicorn' or 'Stabby the Unicorn' are Magical Unicorns; 'Greedy Flying Unicorn' is a Magical Unicorn with greedy rules. Magic cards include Neigh! (counter another card) and Glitter Tornado. Upgrades and Downgrades attach to other players' stables. Unstable Unicorns is one of the best-funded card games on Kickstarter ever. Fans hit 100+; casual quizzers expect 60-80. Run takes around two minutes. Submit and Next per round. A great primer for the actual game and its many themed expansions (Dragons, Adventures, NSFW, etc.).",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UnstableUnicornsMiniSettings),
  reducer, isTerminal, hint: (state: UnstableUnicornsMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-unstable-unicorns-mini-answer-0"]', pulses: 3 } : null, component: UnstableUnicornsMiniGame,
};
