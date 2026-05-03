import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ForagerState, ForagerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForagerGame } from "./Game.js";

export const foragerGamePlugin = {
  id: "forager-game",
  title: "Forager",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Survive four seasons by foraging berries, mushrooms, roots, and nuts in the wild!",
  howToPlay: `Forager is a wilderness survival sim spanning four seasons — spring, summer, autumn, and winter — with six days per season (24 days total). Your goal is to stockpile as much food as possible before winter ends.

Each day you choose one action: Forage a specific resource or Rest. Foraging costs energy and yields a random haul based on the resource and whether it is in season. Resources gathered out of season yield only about 30% of normal amounts, so timing matters.

The four resources each have their prime seasons: Berries thrive in spring and summer. Mushrooms peak in summer and autumn. Roots can be dug in spring, autumn, and even winter. Nuts offer the biggest haul but only in autumn — stock up!

Energy starts at 10 and is consumed by foraging (2–4 per action). Resting recovers 4 energy. Each day you also automatically consume a small amount of your cached food, so keep the pantry stocked.

As seasons change, energy partially recovers. Plan ahead: gather nuts heavily in autumn, save roots for winter, and use spring and summer to load up on berries. Your final score is based on total food and cache size at the end of winter.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: ForagerState, action: ForagerAction) => ForagerState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".forager-res-btn", pulses: 3 }; },
  component: ForagerGame,
} as unknown as GamePlugin;
