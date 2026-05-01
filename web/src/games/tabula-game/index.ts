import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TabulaState, TabulaAction, TabulaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TabulaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tabulaGamePlugin: GamePlugin<TabulaState, TabulaAction, typeof settings> = {
  id: "tabula-game",
  title: "Tabula (Roman)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roman three-dice ancestor of backgammon — bet sum band.",
  howToPlay: "Tabula was the Roman three-dice race game, a direct ancestor of backgammon documented in writings of Emperor Zeno around 480 AD. Across 12 rounds three six-sided dice are rolled and you call which sum band will appear: High (14-18) pays +30, Low (3-7) pays +25, or Mid (8-13) pays +10. The mid band is the most common (roughly 67% of rolls) so it pays least. Both edges combined are about 33% of outcomes which is why they pay generously. A wrong call scores zero. Strategy: the modal sum is 10-11 so 'Mid' looks safer than it is — if you only ever pick mid you score about 80 points across the game, while a balanced strategy that punts High occasionally can clear 200. Twelve rounds, top score wins. The full historical Tabula adds movement on a 24-point board, but this variant focuses on the dice-roll prediction core.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TabulaSettings),
  reducer,
  isTerminal,
  component: TabulaGame,
};
