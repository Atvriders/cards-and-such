import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PoolCheckersAmState, PoolCheckersAmAction, PoolCheckersAmSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PoolCheckersAmGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const poolCheckersAmPlugin: GamePlugin<PoolCheckersAmState, PoolCheckersAmAction, typeof settings> = {
  id: "pool-checkers-am",
  title: "Pool Checkers (American)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "American tournament Pool Checkers placement variant.",
  howToPlay: "Pool Checkers is the American tournament-style draughts variant favoured by African-American checker clubs since the 1900s, with Russian-influenced flying-king rules. This 4x4 placement adaptation runs in under a minute. Across 12 turns you and a random CPU place pieces alternately on empty squares. Click an empty cell. The CPU plays uniformly random. After twelve moves whoever has more pieces wins. The full Pool Checkers game uses 8x8 boards with backward captures by men, flying kings, and exhaustive jump chains; the 4x4 abstraction keeps the territory-control essence without the multi-hour search trees. Pool Checkers tournaments are still active in cities like New Orleans and Atlanta, with the American Checker Federation hosting championships. Final scoreboard: 100 points for a win, 25 for a tie. Pool Checkers' identity comes from its African diaspora roots — a game that traveled from Russia through enslaved African players to Caribbean and US barbershops where serious clubs still meet weekly.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PoolCheckersAmSettings),
  reducer,
  isTerminal,
  component: PoolCheckersAmGame,
};
