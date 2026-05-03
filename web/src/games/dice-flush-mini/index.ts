import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFlushMiniState, DiceFlushMiniAction, DiceFlushMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFlushMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFlushMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFlushMiniPlugin: GamePlugin<DiceFlushMiniState, DiceFlushMiniAction, typeof settings> = {
  id:"dice-flush-mini", title:"Dice Flush Mini", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll five dice; bonus for 3+ of the same value. 8 rounds.",
  howToPlay:`Dice Flush Mini is a five-dice match-hunting game. Each round, you roll five six-sided dice and look for matching values. Every roll scores 30 base points; matches add bonuses on top.

Three of a kind scores +80 (110 total), four of a kind scores +150 (180 total), and the rare five of a kind scores +280 (310 total). The probability of three of a kind on a single roll of 5d6 is roughly 23%; four of a kind is about 1.9%; five of a kind is just 0.077% — so when it happens, savor it.

You play 8 rounds. Average expected scores land around 280–320 (with maybe one or two three-of-a-kinds across the run). The game is purely random — press Roll, see the dice, take the bonus, press Next. A friendly Yahtzee-light five-second roll experience.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFlushMiniSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFlushMiniState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-flush-mini-roll"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-dice-flush-mini-next"]', pulses: 3 };
    return null;
  },
  component:DiceFlushMiniGame,
};
