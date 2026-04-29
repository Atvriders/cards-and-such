import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkarneyRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const skarneyRPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "skarney-r", title: "Skarney", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "John Scarne's rummy variant with strict meld requirements.",
  howToPlay: "Skarney is John Scarne's rummy variant, designed in the 1960s to elevate the rummy family with stricter melding rules and meaningful penalties. Six rounds are played; each round you receive seven cards which the engine auto-melds into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards).\n\nEach meld scores twenty base points plus five for every additional card past three. Deadwood — cards remaining outside any meld — has values: aces one, two through ten their face value, and jacks/queens/kings ten each. Hands with no melds receive a small consolation based on deadwood reduction.\n\nGoing out clean (zero deadwood) adds the Skarney bonus of twenty-five points. Across six rounds, expected totals range from fifty to one-eighty. Click 'Auto-score' to evaluate the round and 'Next' to deal the next. Skarney rewards seeds where rank clusters dominate — three or four of a kind, and tight runs at the low or high end of a suit.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, { dummy: false }),
  reducer, isTerminal, component: SkarneyRGame,
};
