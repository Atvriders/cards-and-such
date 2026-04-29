import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DuelPantheonGodsState, DuelPantheonGodsAction, DuelPantheonGodsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DuelPantheonGodsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const duelPantheonGodsPlugin: GamePlugin<DuelPantheonGodsState, DuelPantheonGodsAction, typeof settings> = {
  id: "duel-pantheon-gods",
  title: "7 Wonders Duel: Pantheon",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Gods grant special abilities in two-player draft.",
  howToPlay: "7 Wonders Duel: Pantheon is a homage to the Antoine Bauza and Bruno Cathala expansion that adds gods to the two-player Duel pyramid draft. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a divine favor); five earn an additional +15 (a god's blessing). Pairs of rank earn +5 (a temple offering); three-of-a-kind +10 (a god's intervention). Raw ranks sum as worship. Score equals tableau total plus +25 for beating the CPU. Strategy: in Pantheon the choice of which gods enter play matters; here, your suit-commitment is the equivalent — commit early. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DuelPantheonGodsSettings),
  reducer,
  isTerminal,
  component: DuelPantheonGodsGame,
};
