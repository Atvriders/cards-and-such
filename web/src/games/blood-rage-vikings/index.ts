import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BloodRageVikingsState, BloodRageVikingsAction, BloodRageVikingsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BloodRageVikingsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const bloodRageVikingsPlugin: GamePlugin<BloodRageVikingsState, BloodRageVikingsAction, typeof settings> = {
  id: "blood-rage-vikings",
  title: "Blood Rage: Vikings",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-only Viking draft homage.",
  howToPlay: "Blood Rage: Vikings is a homage to Eric Lang's Viking-themed card drafting and area-control game, here in the simplified card-only style without miniatures. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across the four suits (the four Norse clans). Three of one suit earn +10 (a clan bonus); five earn an additional +15 (Ragnarok scoring). Pairs of rank earn +5 (a quest token); three-of-a-kind +10 (a god's favor). Raw ranks sum as glory. Score equals tableau total plus +25 for beating the CPU. Strategy: Blood Rage's apocalypse scoring rewards committing to one clan early. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BloodRageVikingsSettings),
  reducer,
  isTerminal,
  component: BloodRageVikingsGame,
};
