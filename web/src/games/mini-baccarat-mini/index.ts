import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MiniBaccaratMiniState, MiniBaccaratMiniAction, MiniBaccaratMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MiniBaccaratMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MiniBaccaratMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: MiniBaccaratMiniState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-mini-baccarat-mini-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-mini-baccarat-mini-secondary"]', pulses: 3 };
  return null;
};

export const miniBaccaratMiniPlugin: GamePlugin<MiniBaccaratMiniState, MiniBaccaratMiniAction, typeof settings> = {
  id: "mini-baccarat-mini", title: "Mini-Baccarat (Mini)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Smaller-table lower-stakes Baccarat.",
  howToPlay: "Mini-Baccarat is a smaller-table, faster, lower-stakes version of Baccarat played in casinos. The dealer handles all the cards (no player draw) and rounds proceed at a much higher pace than the formal Baccarat tables.\n\nIn this single-player version you play fifteen rounds. Press Play each round to bet on Player, Banker, or Tie, then automatically deal the cards per the standard Baccarat fixed-rule procedure. Total cards in each hand are summed modulo ten and the higher total wins.\n\nKey payouts: Player win pays even; Banker win pays even minus a 5% commission; Tie pays eight-to-one. A strong total across fifteen rounds is around one hundred and fifty.\n\nMini-Baccarat was introduced in Las Vegas in the 1970s to bring Baccarat to lower-stakes players. It is the most-played form of Baccarat in U.S. casinos because of the lower minimum bet. The house edge on Banker is 1.06%, on Player is 1.24%. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniBaccaratMiniSettings),
  reducer, isTerminal, hint: hint, component: MiniBaccaratMiniGame,
};
