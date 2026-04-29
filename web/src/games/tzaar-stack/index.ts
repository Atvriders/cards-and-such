import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AbsState, AbsAction, AbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AbsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tzaarStackPlugin: GamePlugin<AbsState, AbsAction, typeof settings> = {
  id: "tzaar-stack",
  title: "TZAAR (Stack)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Capture-stacks abstract by Kris Burm.",
  howToPlay: "TZAAR is Kris Burm's capture-stack abstract where pieces of three types form towers when stacked. In this 5x5 placement adaptation across 14 turns (7 each), you place pieces on intersections; the CPU plays randomly. Click an empty cell. After 14 moves the higher count wins. Full TZAAR is far richer with three piece types (Tzaars, Tzarras, Totts) and a strict stacking-capture rule, but this version uses the placement-and-counting core. TZAAR is widely considered the deepest of the Project Gipf abstracts; tournaments are concentrated in the Netherlands and Belgium. Strategy: contest the centre and don't let the CPU dominate one side. Final scoreboard: 100 points for the win, 25 for a tie. The full TZAAR rewards multi-step stacking plans; this simplified version provides quick placement-counting rounds without the capture strategy depth.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AbsSettings),
  reducer,
  isTerminal,
  component: AbsGame,
};
