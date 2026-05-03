import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BowerState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Bower = /* @__PURE__ */ lazy(() => import("./Bower.js").then((mod) => ({ default: mod.Bower as unknown as React.ComponentType<unknown> })));
const bowerSettings = {} as const;
type BowerSettings = SettingsOf<typeof bowerSettings>;
type BowerAction = { type: "play"; cardId: string };

export const bowerPlugin: GamePlugin<BowerState, BowerAction, typeof bowerSettings> = {
  id: "bower",
  title: "Bower",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Generic partnership trump trick-taking game.",
  howToPlay: `Bower is the generic name for a partnership trump trick-taking game (the Jack of trump is called the right bower). This simplified 1v1 duel preserves the trick-play core with clubs as trump. You and the bot each receive 13 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card including trump. Highest club wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Bower games, the Jack of trump and Jack of the same color are the top two trumps — a quirk this simplified version omits, using straight Ace-high ordering. Lead long side suits early to flush trumps, then cash your remaining clubs. Score is tricks taken — capture 7 of 13 tricks to win.`,
  settings: bowerSettings,
  initialState: (seed: number, _settings: BowerSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: BowerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-bower-primary"]', pulses: 3 };
  },
  component: Bower,
};
