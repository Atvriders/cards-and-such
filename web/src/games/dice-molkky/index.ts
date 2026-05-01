import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceMolkkyState, DiceMolkkyAction, DiceMolkkySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceMolkkyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceMolkkyPlugin: GamePlugin<DiceMolkkyState, DiceMolkkyAction, typeof settings> = {
  id: "dice-molkky",
  title: "Dice Mölkky",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Mölkky: knock numbered pins to score; reach exactly 50.',
  howToPlay: 'Dice Mölkky is a real, dice-driven simulation. Mölkky: knock numbered pins to score; reach exactly 50.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceMolkkySettings),
  reducer,
  isTerminal,
  component: DiceMolkkyGame,
};
