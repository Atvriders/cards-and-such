import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ButtonMenDuelState, ButtonMenDuelAction, ButtonMenDuelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ButtonMenDuelGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ButtonMenDuelGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const buttonMenDuelPlugin: GamePlugin<ButtonMenDuelState, ButtonMenDuelAction, typeof settings> = {
  id: "button-men-duel",
  title: "Button Men Duel",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cheapass Games dueling-dice — two-dice matching combat.",
  howToPlay: "Button Men is James Ernest's 1999 Cheapass Games dueling-dice game where each player wears a custom button representing dice combat in a tournament. This adaptation distills its dice-matching combat into round-by-round predictions. Across 13 rounds two dice are rolled. Predict: Capture Match (both dice equal — a 'pair capture' in the original) pays +25, High Single (max die is 5 or 6 with mismatch) pays +12, Low Wash (max die 4 or less, no pair) pays +8. Pair captures land 16.7% of the time, the high-single band is roughly 39%, and low wash holds the rest. Wrong call scores zero. Strategy: pair-capture hunting pays off if you guess two captures across thirteen rounds. The high-single ride averages +60 but caps lower than mixed picks. Top score after thirteen rounds wins. Button Men's original power-die taxonomy is here reduced to the underlying probability bands.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ButtonMenDuelSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-button-men-duel-primary"]', pulses: 3 }),
  component: ButtonMenDuelGame,
};
