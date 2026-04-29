import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldDraftState, WonderfulWorldDraftAction, WonderfulWorldDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WonderfulWorldDraftGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const wonderfulWorldDraftPlugin: GamePlugin<WonderfulWorldDraftState, WonderfulWorldDraftAction, typeof settings> = {
  id: "wonderful-world-draft",
  title: "It's a Wonderful World",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Recycle-or-build development card draft.",
  howToPlay: "It's a Wonderful World is a homage to Frederic Guerard's drafting and engine-building game, where development cards are drafted and either built or recycled for production resources. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau. Three of one suit earn +10 (a production milestone); five earn an additional +15 (an empire bonus). Pairs of rank earn +5 (a recycled cube); three-of-a-kind +10 (a chained production). Raw ranks sum as empire points. Score equals tableau total plus +25 for beating the CPU. Strategy: recycle-then-produce mechanics reward committing to one suit early. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WonderfulWorldDraftSettings),
  reducer,
  isTerminal,
  component: WonderfulWorldDraftGame,
};
