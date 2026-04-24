import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OSOState, OSOAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OddShapeOut } from "./Game.js";

export const oddShapeOutSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type OSOSettings = SettingsOf<typeof oddShapeOutSettings>;

export const oddShapeOutPlugin: GamePlugin<OSOState, OSOAction, typeof oddShapeOutSettings> = {
  id: "odd-shape-out",
  title: "Odd Shape Out",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eight shapes appear — one is different from the rest. Find the odd one out before time runs out!",
  howToPlay: `Odd Shape Out tests your visual discrimination speed. Each round, eight emoji shapes are displayed in a grid. Seven of them belong to the same category — for example, all fruits, or all circles — and one comes from a completely different category. You must identify the odd one out and click it before the timer runs out.

On Easy difficulty you have 8 seconds, on Medium 5 seconds, and on Hard only 3 seconds per round. A faster correct answer earns a time bonus on top of the base 10 points. Clicking the wrong shape or running out of time scores 0 for that round. There are 20 rounds in total.

After each round, the grid is briefly shown again with the correct odd shape highlighted in gold, so you can see what you missed.

Tips: Train your eye to do a quick categorical sweep rather than examining each shape one by one. Ask yourself "what pattern do I expect to see?" and look for the element that breaks it. For example, if you spot that seven items are all flowers, your eye immediately jumps to anything that is not flower-shaped. Speed comes from parallel processing — scan the whole grid simultaneously rather than left-to-right. Over time your pattern-detection becomes automatic.`,
  settings: oddShapeOutSettings,
  initialState: (seed: number, settings: OSOSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: OddShapeOut,
};
