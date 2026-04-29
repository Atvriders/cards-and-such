import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RhinoDiceState, RhinoDiceAction, RhinoDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RhinoDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rhinoDicePlugin: GamePlugin<RhinoDiceState, RhinoDiceAction, typeof settings> = {
  id: "rhino-dice",
  title: "Rhino Dice Stack",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rhino Hero theme: rolls determine tower stability.",
  howToPlay: "Rhino Hero Super Battle Dice projects the family-favorite stacking game into push-your-luck dice. Across 10 rounds three dice are rolled and you predict whether Rhino climbs, sways, or crashes the tower. Tower Hold (sum 12 or higher) pays +30 — Rhino reaches the top floor. Mid Sway (sum 7-11) pays +10 — the building wobbles. Crash (sum 3-6) pays +25 — Rhino topples but you bet on the fall. Mid Sway is the most likely band (about 66%) so it pays the least. Tower Hold is around 16% and Crash around 18% — both pay big to balance frequency. Wrong call scores zero. Strategy: alternate Crash and Mid Sway since the modal sum is 10-11 in the mid band — pure Mid yields about +70 across ten rounds, while a calibrated guess can hit +130 with a few Crash hits. Ten rounds, highest score wins. The original Rhino dice push-your-luck rewarded brave bets with stacking blocks.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RhinoDiceSettings),
  reducer,
  isTerminal,
  component: RhinoDiceGame,
};
