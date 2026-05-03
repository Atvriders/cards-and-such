import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CapitalismShedState, CapitalismShedAction, CapitalismShedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CapitalismShedGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CapitalismShedGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const capitalismShedPlugin: GamePlugin<CapitalismShedState, CapitalismShedAction, typeof settings> = {
  id: "capitalism-shed", title: "Capitalism", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "President variant where the loser passes their best card to the winner each round.",
  howToPlay: "Capitalism is a President-family shedding game with one signature twist: at the start of each round, the loser of the previous round must surrender their highest-ranked card to the winner, who passes back their lowest. This widens the gap and rewards consistent winners — just like its namesake.\n\nEach player starts with seven cards. On a turn you must lead with any card or follow by playing a strictly higher card; otherwise you pass. The first to empty their hand wins the round, scoring twenty-five points; the loser scores nothing.\n\nSix rounds are played. Because the card-swap repeats after every round, falling behind compounds quickly. A run that holds steady against the CPU lands around eighty points; one that loses the first round and fails to recover may finish far lower. Conversely, winning early can snowball into 150+. The CPU plays randomly within the legal options, so play tight and bank on the swap if you start strong.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CapitalismShedSettings),
  reducer, isTerminal, 
  hint: (state: CapitalismShedState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-capitalism-shed-play"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-capitalism-shed-next"]', pulses: 3 };
    return null;
  },
  component: CapitalismShedGame,
};
