import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DudakTavernState, DudakTavernAction, DudakTavernSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DudakTavernGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dudakTavernPlugin: GamePlugin<DudakTavernState, DudakTavernAction, typeof settings> = {
  id: "dudak-tavern",
  title: "Dudak Tavern Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turkish tavern three-dice betting on triples and runs.",
  howToPlay: "Dudak is the Turkish tavern three-dice game where players gather over coffee and place bets on the next roll's pattern. Across 14 rounds three dice are rolled. Predict: Triple (all three equal, 1/36 odds) pays +50, Run 1-2-3 (the values 1, 2, 3 in any order, 6/216 = 2.78%) pays +30, Run 4-5-6 (the values 4, 5, 6 in any order) pays +30, Other (everything else, about 91%) pays +10. The 'other' bet is the safe catch-all that covers the modal mass; the targeted bets reward when their narrow combinations land. Wrong call scores zero. Strategy: always-other yields steady +140 across fourteen rounds; punting one triple and one of each run can net +120 base plus bonuses. Pure triple-hunt is high variance with expected value about +20 across the game. Top score after fourteen rounds wins. The Turkish version added tea-house gossip; here, the math is the prize.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DudakTavernSettings),
  reducer,
  isTerminal,
  component: DudakTavernGame,
};
