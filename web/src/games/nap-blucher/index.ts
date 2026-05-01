import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapBlucherState, NapBlucherAction, NapBlucherSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapBlucherGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const napBlucherPlugin: GamePlugin<NapBlucherState, NapBlucherAction, typeof settings> = {
  id: "nap-blucher",
  title: "Nap Blücher",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Nap Blücher: full Nap variant with both Wellington (10x) and Blücher (20x) overcalls.',
  howToPlay: 'Nap Blücher is a real, dice-driven simulation. Nap Blücher: full Nap variant with both Wellington (10x) and Blücher (20x) overcalls.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapBlucherSettings),
  reducer,
  isTerminal,
  component: NapBlucherGame,
};
