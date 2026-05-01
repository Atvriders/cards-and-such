import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CribbageShotgunState, CribbageShotgunAction, CribbageShotgunSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CribbageShotgunGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const cribbageShotgunPlugin: GamePlugin<CribbageShotgunState, CribbageShotgunAction, typeof settings> = {
  id: "cribbage-shotgun",
  title: "Cribbage Shotgun",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Cribbage Shotgun: peg from 0 to 61 with hand scores (15s, pairs, runs, flushes, knobs).',
  howToPlay: 'Cribbage Shotgun is a real, dice-driven simulation. Cribbage Shotgun: peg from 0 to 61 with hand scores (15s, pairs, runs, flushes, knobs).\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageShotgunSettings),
  reducer,
  isTerminal,
  component: CribbageShotgunGame,
};
