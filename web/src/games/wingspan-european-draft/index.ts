import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanEuropeanDraftState, WingspanEuropeanDraftAction, WingspanEuropeanDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanEuropeanDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wingspanEuropeanDraftPlugin: GamePlugin<WingspanEuropeanDraftState, WingspanEuropeanDraftAction, typeof settings> = {
  id: "wingspan-european-draft",
  title: "Wingspan: European",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bird-card European-expansion draft.",
  howToPlay: "Wingspan: European is a homage to Elizabeth Hargrave's European Expansion of Wingspan, which adds new birds and bonus cards with round-end goal tiles. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across the four habitats. Three of one suit earn +10 (a habitat majority); five earn an additional +15 (a flock bonus). Pairs of rank earn +5 (a paired species); three-of-a-kind +10 (a triple-species combo). Raw ranks sum as eggs and feathers. Score equals tableau total plus +25 for beating the CPU. Strategy: habitat-focus drafts reward committing early to one habitat. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanEuropeanDraftSettings),
  reducer,
  isTerminal,
  component: WingspanEuropeanDraftGame,
};
