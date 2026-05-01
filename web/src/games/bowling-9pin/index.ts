import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Bowling9pinState, Bowling9pinAction, Bowling9pinSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bowling9pinGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const bowling9pinPlugin: GamePlugin<Bowling9pinState, Bowling9pinAction, typeof settings> = {
  id: "bowling-9pin",
  title: "9-Pin Bowling",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: '9-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.',
  howToPlay: '9-Pin Bowling is a real, dice-driven simulation. 9-Pin Bowling: 2-die rolls = pins; classic strike/spare scoring across 10 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Bowling9pinSettings),
  reducer,
  isTerminal,
  component: Bowling9pinGame,
};
