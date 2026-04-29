import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceAction, RaceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RaceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ludoMiniRacePlugin: GamePlugin<RaceState, RaceAction, typeof settings> = {
  id: "ludo-mini-race",
  title: "Ludo (Mini)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Compact Ludo: shorter track and only two pawns per side.",
  howToPlay: "Ludo Mini is a compact version of the classic Pachisi-derived family-game Ludo. The full track is reduced to 32 cells and each player has only two pawns instead of four, so games finish very quickly.\n\nYou play one color against a random CPU. Click Roll to throw two six-sided dice. Click any of your pawns and choose to advance it by either die or by the combined sum. Each die may be used once per turn.\n\nThe display shows the track as a horizontal strip of 33 cells. Race both pawns to the final cell to win.\n\nLudo Mini is fast and luck-driven, but a small amount of skill helps. Spread your pawns rather than racing only one — that way you don't lose all progress when the CPU's pawns leapfrog yours. The CPU plays random legal moves, so even simple management beats it. Score is computed from your pip-count lead at game end. A win plus a pip-lead of +10 or better is a good Ludo Mini result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RaceSettings),
  reducer,
  isTerminal,
  component: RaceGame,
};
