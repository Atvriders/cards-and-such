import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCurlingStonesState, DiceCurlingStonesAction, DiceCurlingStonesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCurlingStonesGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCurlingStonesPlugin: GamePlugin<DiceCurlingStonesState, DiceCurlingStonesAction, typeof settings> = {
  id: "dice-curling-stones",
  title: "Dice Curling Stones",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Curling Stones: throw stones close to the jack; closest scores points each end.',
  howToPlay: 'Dice Curling Stones is a real, dice-driven simulation. Dice Curling Stones: throw stones close to the jack; closest scores points each end.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCurlingStonesSettings),
  reducer,
  isTerminal,
  component: DiceCurlingStonesGame,
};
