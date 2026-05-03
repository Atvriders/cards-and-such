import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarmState, FarmAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FarmyardMatch = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FarmyardMatch as unknown as React.ComponentType<unknown> })));
export const farmyardMatchSettings = {
  count: {
    kind: "enum" as const,
    label: "Animals",
    options: ["4", "6"] as const,
    default: "4" as const,
  },
} as const;

type FarmyardMatchSettings = SettingsOf<typeof farmyardMatchSettings>;

export const farmyardMatchPlugin: GamePlugin<FarmState, FarmAction, typeof farmyardMatchSettings> = {
  id: "farmyard-match",
  title: "Farmyard Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match each farm animal to its home — a simple learning game for young kids!",
  howToPlay: `Farmyard Match is a cozy matching game set on the farm. A group of animals is shown on the left, and a set of homes is shown on the right. Your task is to match each animal to its correct home.

Use the dropdown menu next to each animal to pick where that animal lives. For example, cows live in the Barn, pigs live in the Pig Sty, chickens live in the Hen Coop, and ducks swim in the Pond. Sheep belong in the Pen, and horses stay in the Stable.

Once you have set a home for every animal, the Submit button will become active. Click it to check your answers! Each correct match earns points. If you matched all animals perfectly, you get a full score.

Wrong answers will be shown in red along with the correct home, so you can learn for next time. The animals are shuffled each game, so the order changes every round.

Play with 4 animals for an easier game or 6 animals for the full farmyard challenge. Have fun on the farm!`,
  settings: farmyardMatchSettings,
  initialState: (seed: number, settings: FarmyardMatchSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-farmyard-match-action"]', pulses: 3 }; },
  component: FarmyardMatch,
};
