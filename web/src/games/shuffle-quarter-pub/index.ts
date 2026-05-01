import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShuffleQuarterPubState, ShuffleQuarterPubAction, ShuffleQuarterPubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShuffleQuarterPubGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const shuffleQuarterPlugin: GamePlugin<ShuffleQuarterPubState, ShuffleQuarterPubAction, typeof settings> = {
  id: "shuffle-quarter-pub",
  title: "Shuffle Quarter",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Shuffle Quarter: slide coins to scoring zones; race to 21 points.',
  howToPlay: 'Shuffle Quarter is a real, dice-driven simulation. Shuffle Quarter: slide coins to scoring zones; race to 21 points.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShuffleQuarterPubSettings),
  reducer,
  isTerminal,
  component: ShuffleQuarterPubGame,
};
