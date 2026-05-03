import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EzBaccaratMiniState, EzBaccaratMiniAction, EzBaccaratMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EzBaccaratMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EzBaccaratMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: EzBaccaratMiniState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-ez-baccarat-mini-primary"]', pulses: 3 };
  if (state.phase === "scored") return { selector: '[data-testid="hint-target-ez-baccarat-mini-secondary"]', pulses: 3 };
  return null;
};

export const ezBaccaratMiniPlugin: GamePlugin<EzBaccaratMiniState, EzBaccaratMiniAction, typeof settings> = {
  id: "ez-baccarat-mini", title: "EZ Baccarat (Mini)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Commission-free Baccarat variant.",
  howToPlay: "EZ Baccarat is a commission-free Baccarat variant where the standard 5% Banker-win commission is replaced by a special rule: the Banker hand pushes (no win, no loss) when it wins on a three-card seven.\n\nIn this single-player version you play fifteen rounds. Press Play each round to bet on Player, Banker, Tie, or one of two side bets (Dragon 7 and Panda 8). The cards are dealt per the standard Baccarat fixed-rule procedure.\n\nKey payouts: Player and Banker wins pay even; Tie pays eight; Dragon 7 (banker three-card seven) pays forty; Panda 8 (player three-card eight) pays twenty-five. A strong total across fifteen rounds is around two hundred.\n\nEZ Baccarat was patented by Francisco 'Pancho' Tan in 2004 and is now widespread in Las Vegas, Macau, and Atlantic City. The simpler payout structure speeds up the game considerably and removes the awkwardness of paying commission on Banker wins. Press Play to deal.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EzBaccaratMiniSettings),
  reducer, isTerminal, hint: hint, component: EzBaccaratMiniGame,
};
