import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceLadderRollState, DiceLadderRollAction, DiceLadderRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceLadderRollGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceLadderRollGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceLadderRollPlugin: GamePlugin<DiceLadderRollState, DiceLadderRollAction, typeof settings> = {
  id: "dice-ladder-roll", title: "Dice Ladder Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll higher than the previous die to climb the ladder — streaks multiply your points!",
  howToPlay: `Dice Ladder Roll rewards consecutive climbing rolls. Each round you roll a single die. If it beats the previous roll, your streak grows and your points multiply — a streak of 3 earns big bonus points!

If your roll is equal to or lower than the previous, the streak breaks and you score 0 for that round. Your new roll then becomes the baseline for the next attempt.

The first roll always scores because there's nothing to beat. Over 10 or 20 rounds, building and maintaining streaks is the key to a high score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceLadderRollSettings),
  reducer,
  isTerminal,
  hint: (state: DiceLadderRollState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "waiting") return { selector: '[data-testid="hint-target-dice-ladder-roll-roll"]', pulses: 3 };
    if (state.phase === "result") return { selector: '[data-testid="hint-target-dice-ladder-roll-next"]', pulses: 3 };
    return null;
  },
  component: DiceLadderRollGame,
};
