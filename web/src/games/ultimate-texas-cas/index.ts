import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { UltimateTexasCasState, UltimateTexasCasAction, UltimateTexasCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const UltimateTexasCasGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.UltimateTexasCasGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: UltimateTexasCasState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-ultimate-texas-cas-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-ultimate-texas-cas-secondary"]', pulses: 3 };
  return null;
};
export const ultimateTexasCasPlugin: GamePlugin<UltimateTexasCasState, UltimateTexasCasAction, typeof settings> = {
  id: "ultimate-texas-cas", title: "Ultimate Texas Hold'em (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Player vs dealer Texas Hold'em.",
  howToPlay: "Ultimate Texas Hold'em is a casino table-game variant of Texas Hold'em played heads-up against the dealer. The player makes an ante and a blind bet, then makes play decisions at three key streets.\n\nIn this single-player version you play fifteen rounds. Press Play each round to deal two hole cards. Decide to bet 4x ante (pre-flop) or check. After the flop, decide to bet 2x or check. After the turn/river, decide to bet 1x or fold.\n\nFinal hands are compared at showdown. Dealer qualifies with a pair or better. Bonus payouts on the blind bet for straight (1:1), flush (1.5:1), full house (3:1), quads (10:1), straight flush (50:1), royal flush (500:1).\n\nA strong total across fifteen rounds is around three hundred. Ultimate Texas Hold'em was developed by Roger Snow and Shuffle Master in 2002. The optimal play strategy is non-trivial — most players over-fold pre-flop. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UltimateTexasCasSettings),
  reducer, isTerminal, hint: hint, component: UltimateTexasCasGame,
};
