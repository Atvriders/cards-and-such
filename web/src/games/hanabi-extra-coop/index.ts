import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanabiExtraCoopState, HanabiExtraCoopAction, HanabiExtraCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanabiExtraCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hanabiExtraCoopPlugin: GamePlugin<HanabiExtraCoopState, HanabiExtraCoopAction, typeof settings> = {
  id: "hanabi-extra-coop",
  title: "Hanabi Extra",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hanabi Extra — multi-colour fireworks and rare clue tiles.",
  howToPlay: "Hanabi Extra extends the firework cooperative with a sixth multi-colour pile and rare clue tiles. You and your AI partner share clues as best you can while a strict turn timer ticks down. Combined dice represent the chance of a successful clue read on each round. After ten rounds, hit 65 points to retire the show with applause.\n\nPress Play Round to give and resolve a clue. The dice are your interpretation of partial information — sometimes you guess right, sometimes the multi-colour confuses you. Then press Next Round, or Finish on round 10.\n\nThis variant adds the rainbow stack and the silent observer rule: your AI cannot speak, only nod. The team score climbs whenever you both guess in alignment. Master the spectrum, score sixty-five.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanabiExtraCoopSettings),
  reducer, isTerminal, component: HanabiExtraCoopGame,
};
