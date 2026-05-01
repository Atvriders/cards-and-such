import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PopeJoanState, PopeJoanAction, PopeJoanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PopeJoanGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const popeJoanPlugin: GamePlugin<PopeJoanState, PopeJoanAction, typeof settings> = {
  id: "pope-joan",
  title: "Pope Joan",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Pope Joan: classic Victorian board card game; play 2-9 in suit and claim staked tokens.',
  howToPlay: 'Pope Joan is a real, dice-driven simulation. Pope Joan: classic Victorian board card game; play 2-9 in suit and claim staked tokens.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PopeJoanSettings),
  reducer,
  isTerminal,
  component: PopeJoanGame,
};
