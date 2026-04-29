import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkNeonState, RailroadInkNeonAction, RailroadInkNeonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkNeonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkNeonPlugin: GamePlugin<RailroadInkNeonState, RailroadInkNeonAction, typeof settings> = {
  id: "railroad-ink-neon",
  title: "Railroad Ink: Neon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Neon city edition with electric rail lines and power plants.",
  howToPlay: "Railroad Ink: Neon is the neon-city edition with electric rail lines and power plants. In this adaptation you build a city's rail grid on a 4x4 board by rolling a single d6 and marking a cell. Click Roll, then click any empty cell to mark it with the rolled value. You may Skip if the roll doesn't suit your plan. Each marked cell adds its dice value to your score. Strategy: aim to complete rows and columns for +5 each, plus +10 for completing the full board. Use Skip sparingly — each skip uses one of your 12 rolls. Higher die values make for more profitable marks, while lower ones are best used to complete partial lines. After 12 rolls the game ends and bonuses apply. A solid Neon score is 34-48 points; an exceptional grid-completer can reach 65+. Random rolls ensure each neon city is a unique placement puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkNeonSettings),
  reducer,
  isTerminal,
  component: RailroadInkNeonGame,
};
