import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBocciaState, DiceBocciaAction, DiceBocciaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBocciaGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceBocciaPlugin: GamePlugin<DiceBocciaState, DiceBocciaAction, typeof settings> = {
  id: "dice-boccia",
  title: "Dice Boccia",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Boccia: throw stones close to the jack; closest scores points each end.',
  howToPlay: 'Dice Boccia is a real, dice-driven simulation. Dice Boccia: throw stones close to the jack; closest scores points each end.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceBocciaSettings),
  reducer,
  isTerminal,
  component: DiceBocciaGame,
};
