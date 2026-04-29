import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToWinterState, WelcomeToWinterAction, WelcomeToWinterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToWinterGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToWinterPlugin: GamePlugin<WelcomeToWinterState, WelcomeToWinterAction, typeof settings> = {
  id: "welcome-to-winter",
  title: "Welcome To: Winter",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Welcome To variant; winter suburb with snowfall and heaters.",
  howToPlay: "Welcome To: Winter is a Welcome To variant set in a snowbound suburb where heaters, ice-cleared streets, and chimney smoke add scoring layers.\n\nEach round, click Roll to draw a die (1-6). Click any empty house cell to assign that value (representing build effort). Skip when the snowfall blocks your plan.\n\nScoring:\n- Each filled house scores its die pip (1-6).\n- +5 per row (street plowed and built).\n- +5 per column (avenue cleared end-to-end).\n- +10 for fully completed winter suburb.\n\n12 rolls available. Winter punishes splashing low pips into key cells — strategy is to place high pips in row/column intersections and accept that some plows (skips) are unavoidable. A typical winter build scores 35-50; mastering heater placement reaches 65+. Welcome To: Winter rewards patient builders: every skipped round is a snowstorm passing. The thaw rewards those who held their best builds for the right blocks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeToWinterSettings),
  reducer,
  isTerminal,
  component: WelcomeToWinterGame,
};
