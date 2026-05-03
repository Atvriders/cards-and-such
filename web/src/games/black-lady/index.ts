import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackLadyState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BlackLady = /* @__PURE__ */ lazy(() => import("./BlackLady.js").then((mod) => ({ default: mod.BlackLady as unknown as React.ComponentType<unknown> })));
const blackLadySettings = {} as const;
type BlackLadySettings = SettingsOf<typeof blackLadySettings>;
type BlackLadyAction = { type: "play"; cardId: string };

export const blackLadyPlugin: GamePlugin<BlackLadyState, BlackLadyAction, typeof blackLadySettings> = {
  id: "black-lady",
  title: "Black Lady",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hearts variant where only the Queen of Spades carries a penalty.",
  howToPlay: `Black Lady is a streamlined Hearts variant where the only penalty card is the Queen of Spades, worth 13 penalty points. Hearts and other cards are harmless. The objective is to take as few tricks containing Q♠ as possible — in this simplified one-on-one duel, you and the bot each get 13 cards and play 13 tricks following standard trick-taking rules: follow the led suit if possible, highest of the led suit wins. The Queen of Spades is dangerous: do not capture it. Score is the number of safe tricks you win minus a 5-trick penalty if you take Q♠. Strategy: void yourself in spades early, play low spades when forced to lead, and try to dump the queen onto the bot. Click any card to play it. Tricks 6 or more out of 13 wins the round.`,
  settings: blackLadySettings,
  initialState: (seed: number, _settings: BlackLadySettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: BlackLadyState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-black-lady-primary"]', pulses: 3 };
  },
  component: BlackLady,
};
