import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicHotZoneRwState, PandemicHotZoneRwAction, PandemicHotZoneRwSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicHotZoneRwGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicHotZoneRwPlugin: GamePlugin<PandemicHotZoneRwState, PandemicHotZoneRwAction, typeof settings> = {
  id: "pandemic-hot-zone-rw",
  title: "Pandemic: Hot Zone R&W",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to treat diseases on a roll-and-write zone grid.",
  howToPlay: "Pandemic: Hot Zone R&W is a roll-and-write that captures the pandemic-treatment loop on a personal sheet. The 4x4 grid represents 16 disease zones spread across three continents.\n\nEach round, click Roll to generate a die value (1-6) representing a treatment intensity. Click any unmarked zone cell to assign that treatment level. Higher treatments score more pips but you must spread them across the grid. Click Skip to forfeit a round when no zone fits your strategy.\n\nScoring:\n- Each marked zone scores its die pips (1-6).\n- +5 per fully treated row (continent contained).\n- +5 per fully treated column (research path).\n- +10 for total eradication (all 16 zones treated).\n\nThe game runs 12 rolls. Pandemic strategy: don't waste high rolls on dead-end zones; build research paths early to cascade bonuses. A typical solo run scores 35-50 points; a +10 eradication run scores 60+. Treat pandemic dice as priority calls — every roll matters when outbreaks spread.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicHotZoneRwSettings),
  reducer,
  isTerminal,
  component: PandemicHotZoneRwGame,
};
