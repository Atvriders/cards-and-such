import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DouDizhuState, DouDizhuAction, DouDizhuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DouDizhuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DouDizhuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const douDizhuPlugin: GamePlugin<DouDizhuState, DouDizhuAction, typeof settings> = {
  id: "dou-dizhu", title: "Dou Dizhu", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Chinese 'fight the landlord' three-player shedding classic.",
  howToPlay: "Dou Dizhu (Fight the Landlord) is one of the most-played card games in China — a three-player shedding game where one player (the Landlord) plays alone against two Peasants. The Landlord receives three extra kitty cards and aims to empty their seventeen-card hand before the Peasants empty theirs jointly. Plays are singles, pairs, triples, sequences, bombs (four-of-a-kind), and rocket (joker pair) which is unbeatable. In this simplified one-on-one CPU duel across six rounds, click Play Round to bid for landlord and resolve the play. Strategy: bid Landlord only with a hand containing the rocket or three bombs, and play sequences early to force opponents to break their pairs. Aim for at least two Landlord wins and three Peasant rounds across the match. A total positive score above one hundred is a strong Dou Dizhu result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DouDizhuSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-dou-dizhu-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dou-dizhu-next"]', pulses: 3 };
    return null;
  }, component: DouDizhuGame,
};
