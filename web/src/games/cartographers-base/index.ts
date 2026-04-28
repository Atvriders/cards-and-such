import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CartographersBaseState, CartographersBaseAction, CartographersBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CartographersBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cartographersBasePlugin: GamePlugin<CartographersBaseState, CartographersBaseAction, typeof settings> = {
  id: "cartographers-base",
  title: "Cartographers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip terrain cards and draw on a 5x5 map for seasonal scoring.",
  howToPlay: `Cartographers is a flip-and-draw map-building game. In this adaptation you flip 12 random terrain cards (forest, water, farm, monster, mountain) and mark cells on a 5x5 kingdom map.

Each turn click any empty cell. The cell takes the latest card's terrain.

Scoring (computed at end across 4 'seasons' triggered at rolls 3, 6, 9, 12):
• Spring (rolls 1-3): +1 per forest cell adjacent to mountain
• Summer (rolls 4-6): +2 per row containing both farm and water
• Fall (rolls 7-9): +1 per cluster of 2+ same terrain
• Winter (rolls 10-12): +3 per monster cell that is COMPLETELY surrounded (4 sides) by non-monster

These all sum into your final score.

Monsters are the catch — they score positive only when boxed in by non-monsters. Otherwise they're dead weight. A typical run scores 15-30 points. The scoring is deliberately complex to reward repeat play and adaptation. Most players win by focusing on one or two seasonal rules and accepting weak scores in others.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CartographersBaseSettings),
  reducer,
  isTerminal,
  component: CartographersBaseGame,
};
