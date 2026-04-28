import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TokaidoBaseState, TokaidoBaseAction, TokaidoBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TokaidoBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tokaidoBasePlugin: GamePlugin<TokaidoBaseState, TokaidoBaseAction, typeof settings> = {
  id: "tokaido-base",
  title: "Tokaido",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Journey-themed tile placement along a 7-cell road for set bonuses.",
  howToPlay: `Tokaido is a journey game across feudal Japan. In this adaptation you walk a 7x7 grid by placing 14 random journey tiles. Each tile is one of five experiences: panorama, meal, encounter, souvenir, or hot-spring.

Click any empty cell to place the next tile from the queue.

Scoring (at end):
• Panorama: +2 per panorama, +5 bonus if you have 3 or more.
• Meal: +3 each (no two meals on the same row penalty: −2 per duplicate-row meal).
• Encounter: +4 each, no bonus or penalty.
• Souvenir: +1 each, +6 bonus if you collect 4+ souvenirs.
• Hot-spring: +5 each, but limited natural value — only the first 3 score, the rest count as 0.

Tokaido rewards variety: the journey is more interesting when you collect different kinds of experiences. Grab encounters always; chase the panorama or souvenir set bonus; cap your hot-springs at 3.

With 14 tiles, a strong Tokaido run scores 35-50. The very best journeys hit 60+ when both panorama and souvenir set bonuses fire.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TokaidoBaseSettings),
  reducer,
  isTerminal,
  component: TokaidoBaseGame,
};
