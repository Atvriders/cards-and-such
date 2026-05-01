import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkittlesLongAlleyState, SkittlesLongAlleyAction, SkittlesLongAlleySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkittlesLongAlleyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesLongAlleyPlugin: GamePlugin<SkittlesLongAlleyState, SkittlesLongAlleyAction, typeof settings> = {
  id: "skittles-long-alley",
  title: "Long Alley Skittles",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Long Alley Skittles: 2-die rolls = pins; classic strike/spare scoring across 12 frames.',
  howToPlay: 'Long Alley Skittles is a real, dice-driven simulation. Long Alley Skittles: 2-die rolls = pins; classic strike/spare scoring across 12 frames.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkittlesLongAlleySettings),
  reducer,
  isTerminal,
  component: SkittlesLongAlleyGame,
};
