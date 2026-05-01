import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarDiceThreesState, BarDiceThreesAction, BarDiceThreesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarDiceThreesGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const threesBarDicePlugin: GamePlugin<BarDiceThreesState, BarDiceThreesAction, typeof settings> = {
  id: "bar-dice-threes",
  title: "Threes Bar Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Threes: 3s count zero; lowest total after 5 rolls wins.',
  howToPlay: 'Threes Bar Dice is a real, dice-driven simulation. Threes: 3s count zero; lowest total after 5 rolls wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarDiceThreesSettings),
  reducer,
  isTerminal,
  component: BarDiceThreesGame,
};
