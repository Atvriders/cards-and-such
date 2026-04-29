import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IDoubtItState, IDoubtItAction, IDoubtItSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IDoubtItGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const iDoubtItPlugin: GamePlugin<IDoubtItState, IDoubtItAction, typeof settings> = {
  id: "i-doubt-it", title: "I Doubt It", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "British BS variant: doubt the CPU's card; high card wins.",
  howToPlay: "I Doubt It is the British name for Cheat or BS — players claim ranks for their face-down plays, and the call \"I doubt it!\" forces a reveal. This mini-version simplifies to a 9-round face-down reveal race against the CPU.\n\nEach round, both players \"lay\" one card face down. The higher rank wins, period; what either party \"claimed\" is implicit and unscored. Aces are highest (rank 13), twos are lowest (rank 1). Suits don't matter.\n\nScoring: round win awards 12 points. Tie awards 4 sympathy points. Loss awards zero.\n\nNine rounds total. Expected score sits around 55-75 points; particularly lucky play can push past 90.\n\nIn the full game, you'd be passing claims like \"two threes\" up the line, and a bold call of \"I doubt it!\" forces a flip with stakes. This mini distills that to the underlying randomness — every play is essentially a doubt-and-reveal. Light bluff energy without the conversation.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as IDoubtItSettings),
  reducer, isTerminal, component: IDoubtItGame,
};
