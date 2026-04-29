import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkGreenState, RailroadInkGreenAction, RailroadInkGreenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkGreenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkGreenPlugin: GamePlugin<RailroadInkGreenState, RailroadInkGreenAction, typeof settings> = {
  id: "railroad-ink-green",
  title: "Railroad Ink: Lush Green",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Forest and parks expansion with hiker pawn terrain bonuses.",
  howToPlay: "Railroad Ink: Lush Green features forests and parks with hiker pawns. In this adaptation you build a rail-and-trail network on a 4x4 grid by rolling a single d6 each turn and marking a cell. Click Roll, then click any empty cell to apply the rolled value and add it to your score. You may also Skip if no cell suits the roll. Strategy: mark cells when the dice show 5 or 6 to maximise scoring; skip lower rolls if you can afford to (each skip still counts toward the 12-roll limit). The hiker theme rewards full row/column completion, simulated here by the +5 bonus per filled row, +5 per filled column, and +10 for full board. After 12 rolls the game ends. A solid Lush Green score is 32-46 points; clusterers who chase row/column completions can reach 60+. Plan placements to keep partial rows alive for late-game bonus chances.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkGreenSettings),
  reducer,
  isTerminal,
  component: RailroadInkGreenGame,
};
