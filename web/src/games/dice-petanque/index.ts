import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePetanqueState, DicePetanqueAction, DicePetanqueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePetanqueGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dicePetanquePlugin: GamePlugin<DicePetanqueState, DicePetanqueAction, typeof settings> = {
  id: "dice-petanque",
  title: "Dice Petanque",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Petanque: throw stones close to the jack; closest scores points each end.',
  howToPlay: 'Dice Petanque is a real, dice-driven simulation. Dice Petanque: throw stones close to the jack; closest scores points each end.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DicePetanqueSettings),
  reducer,
  isTerminal,
  component: DicePetanqueGame,
};
