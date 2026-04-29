import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersPyramidExtraState, SevenWondersPyramidExtraAction, SevenWondersPyramidExtraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersPyramidExtraGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersPyramidExtraPlugin: GamePlugin<SevenWondersPyramidExtraState, SevenWondersPyramidExtraAction, typeof settings> = {
  id: "seven-wonders-pyramid-extra",
  title: "7 Wonders: Pyramid Extra",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "7 Wonders Duel-style pyramid extra layer; eight-round draft.",
  howToPlay: "7 Wonders: Pyramid Extra is a draft of cards from the 7 Wonders Duel pyramid. Eight rounds. Suits are ages — Age 1, Age 2, Age 3, Guild.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Build a civilization tableau.\n\nScoring per tableau:\n- Sum of card ranks (1-9 each).\n- +10 per age with 3+ cards (era specialization).\n- +15 additional per age with 5+ cards.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: Pyramid Extra rewards era focus — three Age 2 cards is +10. The greedy CPU spikes rank-9, leaving mid-tier picks for your era. Age 2-3 secures the set. Aim for 60-100 points. 7 Wonders: Pyramid Extra is the duel pyramid expanded into eight drafting rounds. Build your civilization; outscore your rival; ascend.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersPyramidExtraSettings),
  reducer,
  isTerminal,
  component: SevenWondersPyramidExtraGame,
};
