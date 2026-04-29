import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkYellowState, RailroadInkYellowAction, RailroadInkYellowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkYellowGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkYellowPlugin: GamePlugin<RailroadInkYellowState, RailroadInkYellowAction, typeof settings> = {
  id: "railroad-ink-yellow",
  title: "Railroad Ink: Shining Yellow",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sunny rails with solar panels and windmills bonus mechanics.",
  howToPlay: "Railroad Ink: Shining Yellow is the sunny-rails edition with solar panels and windmills. In this adaptation you build a rail network on a 4x4 grid by rolling a single d6 each turn and marking a cell. Click Roll, then click any empty cell to mark it with the rolled value, scoring those points. You may also Skip a roll if no cell looks promising. Each roll-and-mark contributes the dice pip value to your score directly. Strategy: prefer to mark cells when the roll is a 5 or 6, and skip on low rolls if you anticipate better numbers. After 12 rolls the game ends. Bonus scoring: +5 for each fully-completed row, +5 per fully-completed column, +10 if you fill the entire grid. A solid Yellow score is 30-45 points; bonus completions can push you past 60. Use Skip strategically — wasted skips still count toward your roll limit, so balance risk and reward.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkYellowSettings),
  reducer,
  isTerminal,
  component: RailroadInkYellowGame,
};
