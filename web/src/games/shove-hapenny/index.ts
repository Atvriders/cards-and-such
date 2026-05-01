import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShoveHapennyState, ShoveHapennyAction, ShoveHapennySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShoveHapennyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const shoveHapennyPlugin: GamePlugin<ShoveHapennyState, ShoveHapennyAction, typeof settings> = {
  id: "shove-hapenny",
  title: "Shove Ha'penny",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shove Ha'penny: shove coins into 9 numbered beds; first to fill all beds three times wins.",
  howToPlay: "Shove Ha'penny is a real, dice-driven simulation. Shove Ha'penny: shove coins into 9 numbered beds; first to fill all beds three times wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShoveHapennySettings),
  reducer,
  isTerminal,
  component: ShoveHapennyGame,
};
