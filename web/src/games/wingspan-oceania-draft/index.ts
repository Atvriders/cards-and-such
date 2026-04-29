import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanOceaniaDraftState, WingspanOceaniaDraftAction, WingspanOceaniaDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanOceaniaDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wingspanOceaniaDraftPlugin: GamePlugin<WingspanOceaniaDraftState, WingspanOceaniaDraftAction, typeof settings> = {
  id: "wingspan-oceania-draft",
  title: "Wingspan: Oceania",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Oceania-expansion bird-card draft.",
  howToPlay: "Wingspan: Oceania is a homage to Elizabeth Hargrave's Oceania expansion, which adds nectar resources and Oceanian bird mechanics. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across four habitats (here standing for the four nectar colors). Three of one suit earn +10 (a nectar-cup); five earn an additional +15 (a flock-flight bonus). Pairs of rank earn +5 (a paired species); three-of-a-kind +10 (a tropical-trio bonus). Raw ranks sum as breeding success. Score equals tableau total plus +25 for beating the CPU. Strategy: Oceania's nectar-flexible cards reward broad strategies early, narrowing later. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanOceaniaDraftSettings),
  reducer,
  isTerminal,
  component: WingspanOceaniaDraftGame,
};
