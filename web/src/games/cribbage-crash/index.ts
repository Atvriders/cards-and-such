import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CribbageCrashState, CribbageCrashAction, CribbageCrashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CribbageCrashGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageCrashPlugin: GamePlugin<CribbageCrashState, CribbageCrashAction, typeof settings> = {
  id: "cribbage-crash",
  title: "Cribbage Crash",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Cribbage Crash: peg from 0 to 121 with hand scores (15s, pairs, runs, flushes, knobs).',
  howToPlay: 'Cribbage Crash is a real, dice-driven simulation. Cribbage Crash: peg from 0 to 121 with hand scores (15s, pairs, runs, flushes, knobs).\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageCrashSettings),
  reducer,
  isTerminal,
  component: CribbageCrashGame,
};
