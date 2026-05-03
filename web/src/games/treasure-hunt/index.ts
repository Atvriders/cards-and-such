import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget} from "../../platform/game-plugin/types.js";
import type { TreasureState, TreasureAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TreasureHunt = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TreasureHunt as unknown as React.ComponentType<unknown> })));
export const treasureHuntSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "4" as const,
  },
} as const;

type TreasureHuntSettings = SettingsOf<typeof treasureHuntSettings>;

export const treasureHuntPlugin: GamePlugin<TreasureState, TreasureAction, typeof treasureHuntSettings> = {
  id: "treasure-hunt",
  title: "Treasure Hunt",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dig cells on a grid to find hidden treasure using hot/warm/cold clues!",
  howToPlay: `Treasure Hunt is a digging adventure game. A grid of hidden squares is shown on screen. Somewhere under the dirt, a sparkling treasure is buried — and your job is to find it!

Click any square to dig it up. After each dig, you get a clue about how close the treasure is:
- Cold (❄️) means the treasure is far away — more than 2 squares in any direction.
- Warm (🔆) means the treasure is within 2 squares.
- Hot (🔥) means the treasure is right next to the square you just dug!

Use these hot and cold clues to narrow down where the treasure might be. Dig strategically — start in the middle of the grid to get the most useful information, then work your way toward the hot zones.

Your score depends on how few digs it takes to find the treasure. Finding it quickly earns a higher score, so think carefully before each dig!

Choose a 4×4 grid for a quick game, a 5×5 for medium difficulty, or a 6×6 for a real challenge. Good luck, explorer!`,
  settings: treasureHuntSettings,
  initialState: (seed: number, settings: TreasureHuntSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".th-grid")) ? { selector: ".th-grid", pulses: 3 } : null,
  component: TreasureHunt,
};
