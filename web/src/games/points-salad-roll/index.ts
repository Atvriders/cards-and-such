import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PointsSaladRollState, PointsSaladRollAction, PointsSaladRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PointsSaladRollGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pointsSaladRollPlugin: GamePlugin<PointsSaladRollState, PointsSaladRollAction, typeof settings> = {
  id: "points-salad-roll",
  title: "Points Salad Roll",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to mark veggies on a 4x4 salad sheet with evolving scoring.",
  howToPlay: `Points Salad is a card-drafting set-collection game. In this roll-and-write adaptation you roll 1d6 each turn (14 rolls) on a 4x4 sheet. Each cell of the sheet is pre-assigned a veggie type (1-6 mapped):

• 1: carrot, 2: tomato, 3: lettuce, 4: cabbage, 5: onion, 6: pepper

The 4x4 grid contains a fixed mix of these veggies. Roll determines which type is eligible to be marked this turn. Click any unmarked cell of the rolled veggie to mark it.

Scoring (at end), via 3 fixed scoring rules per game (drawn pseudo-randomly from):
• Carrot: +2 per carrot
• Tomato: +1 per tomato; +5 if 3+ tomatoes
• Lettuce: +3 per pair of lettuces
• Cabbage: +6 per cabbage if 1-2; −1 per cabbage if 3+
• Onion: +1 per row containing an onion
• Pepper: +4 per pepper if any neighbor is also pepper, else +1

The game runs 14 rolls. You'll mark 8-14 cells. A strong Points Salad run scores 20-35 points. The scoring rules vary the meta — try several seeds.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PointsSaladRollSettings),
  reducer,
  isTerminal,
  component: PointsSaladRollGame,
};
