import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MultiHandVpTenState, MultiHandVpTenAction, MultiHandVpTenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MultiHandVpTenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MultiHandVpTenGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const multiHandVpTenPlugin: GamePlugin<MultiHandVpTenState, MultiHandVpTenAction, typeof settings> = {
  id: "multi-hand-vp-ten", title: "Multi-Hand Video Poker (10)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play 10 hands of VP simultaneously.",
  howToPlay: "Multi-Hand Video Poker (10-Play) is a casino video poker variant where the player plays ten parallel hands at once. After the initial five-card draw the held cards are duplicated across all ten hands and each hand draws independently.\n\nIn this single-player version you play fifteen rounds. Each round press Play to deal five cards. Choose which to hold (the simulation chooses optimally for you) and ten hands draw replacements. Each hand is paid independently per the Jacks or Better paytable.\n\nA pair of jacks pays one; two pair pays two; three of a kind pays three; straight pays four; flush pays six; full house pays nine; four of a kind pays twenty-five; straight flush pays fifty; royal flush pays one hundred. Multiplied by ten hands you can score huge on a single deal. A royal in the deal is rare but life-changing.\n\nA strong total across fifteen rounds is around five hundred. Multi-Hand VP first appeared in casinos in 2000 and remains a Vegas favourite. Press Play to deal ten.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MultiHandVpTenSettings),
  reducer, isTerminal, hint: (state: MultiHandVpTenState): HintTarget | null => isTerminal(state) ? null : { selector: '[data-testid="hint-target-multi-hand-vp-ten-primary"]', pulses: 3 }, component: MultiHandVpTenGame,
};
