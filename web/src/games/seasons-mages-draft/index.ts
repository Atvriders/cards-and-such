import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SeasonsMagesDraftState, SeasonsMagesDraftAction, SeasonsMagesDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeasonsMagesDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const seasonsMagesDraftPlugin: GamePlugin<SeasonsMagesDraftState, SeasonsMagesDraftAction, typeof settings> = {
  id: "seasons-mages-draft",
  title: "Seasons: Mages",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-season mage power-card draft.",
  howToPlay: "Seasons: Mages is a homage to Regis Bonnessee's drafting game where mages draft cards across three seasons, with mana crystals powering abilities. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across the four elemental seasons. Three of one suit earn +10 (a seasonal bonus); five earn an additional +15 (a master mage rank). Pairs of rank earn +5 (a paired crystal); three-of-a-kind +10 (a triple-crystal combo). Raw ranks sum as prestige. Score equals tableau total plus +25 for beating the CPU. Strategy: seasonal drafts reward committing to one element per stretch of rounds. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SeasonsMagesDraftSettings),
  reducer,
  isTerminal,
  component: SeasonsMagesDraftGame,
};
