import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TidesOfMadnessDraftState, TidesOfMadnessDraftAction, TidesOfMadnessDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TidesOfMadnessDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tidesOfMadnessDraftPlugin: GamePlugin<TidesOfMadnessDraftState, TidesOfMadnessDraftAction, typeof settings> = {
  id: "tides-of-madness-draft",
  title: "Tides of Madness",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player Lovecraftian card draft.",
  howToPlay: "Tides of Madness is a homage to Kristian Curla's two-player draft, a Lovecraftian sequel to Tides of Time with a madness penalty track. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a sanity bonus); five earn an additional +15 (a kingdom triumph). Pairs of rank earn +5 (a paired arcanum); three-of-a-kind +10 (a forbidden tome). Raw ranks sum as influence. Score equals tableau total plus +25 for beating the CPU. Strategy: two-player drafts let you deny the CPU's preferred suit aggressively. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TidesOfMadnessDraftSettings),
  reducer,
  isTerminal,
  component: TidesOfMadnessDraftGame,
};
