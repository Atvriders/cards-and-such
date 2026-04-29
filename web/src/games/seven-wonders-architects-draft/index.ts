import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftAction, SevenWondersArchitectsDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersArchitectsDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersArchitectsDraftPlugin: GamePlugin<SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftAction, typeof settings> = {
  id: "seven-wonders-architects-draft",
  title: "7 Wonders Architects",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Streamlined draft with progress tokens.",
  howToPlay: "7 Wonders Architects is a homage to Antoine Bauza's streamlined version of the 7 Wonders system, where money is removed and progress tokens drive strategic differentiation. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a progress token); five earn an additional +15 (a wonder stage). Pairs of rank earn +5 (a small bonus); three-of-a-kind +10 (a wonder-completion). Raw ranks sum as construction. Score equals tableau total plus +25 for beating the CPU. Strategy: simpler expansions reward commitment to a single suit. Watch the CPU and deny their pile when close to a +10. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersArchitectsDraftSettings),
  reducer,
  isTerminal,
  component: SevenWondersArchitectsDraftGame,
};
