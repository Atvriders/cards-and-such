import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DiceFlyFishingState, DiceFlyFishingAction, DiceFlyFishingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFlyFishingGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DiceFlyFishingGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFlyFishingPlugin: GamePlugin<DiceFlyFishingState, DiceFlyFishingAction, typeof settings> = {
  id: "dice-fly-fishing",
  title: "Dice Fly Fishing",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Fly Fishing: cast each round; landed fish score by size and rarity.',
  howToPlay: 'Dice Fly Fishing is a real, dice-driven simulation. Dice Fly Fishing: cast each round; landed fish score by size and rarity.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFlyFishingSettings),
  reducer,
  isTerminal,
  hint: (state: DiceFlyFishingState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-dice-fly-fishing-roll"]', pulses: 3 };
    if (state.phase === "rolled") return { selector: '[data-testid="hint-target-dice-fly-fishing-next"]', pulses: 3 };
    return null;
  },
  component: DiceFlyFishingGame,
};
