import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceCrokinoleState, DiceCrokinoleAction, DiceCrokinoleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceCrokinoleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceCrokinoleGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCrokinolePlugin: GamePlugin<DiceCrokinoleState, DiceCrokinoleAction, typeof settings> = {
  id: "dice-crokinole",
  title: "Dice Crokinole",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Crokinole: flick discs to score in scoring rings or pockets.',
  howToPlay: 'Dice Crokinole is a real, dice-driven simulation. Dice Crokinole: flick discs to score in scoring rings or pockets.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCrokinoleSettings),
  reducer,
  isTerminal,
  hint: (state: DiceCrokinoleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-crokinole-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-crokinole-next"]', pulses: 3 };
    return null;
  },
  component: DiceCrokinoleGame,
};
