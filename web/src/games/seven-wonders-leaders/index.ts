import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersLeadersState, SevenWondersLeadersAction, SevenWondersLeadersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersLeadersGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersLeadersPlugin: GamePlugin<SevenWondersLeadersState, SevenWondersLeadersAction, typeof settings> = {
  id: "seven-wonders-leaders",
  title: "7 Wonders: Leaders",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Civic draft with leader bonus tableau-building.",
  howToPlay: "7 Wonders: Leaders is a homage to the Antoine Bauza expansion that adds unique leaders drafted before each age. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a civilization tableau across the four classic suits. Three of one suit earn +10 (a guild bonus); five earn an additional +15 (a wonder stage). Pairs of rank earn +5 (military victory tokens); three-of-a-kind +10 (science triple bonus). Raw ranks sum as civic points. Score is tableau total plus +25 for beating the CPU's civilization. Strategy: leader-style commits early to one suit are very strong. Watch the CPU's pile to deny their guild. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersLeadersSettings),
  reducer,
  isTerminal,
  component: SevenWondersLeadersGame,
};
