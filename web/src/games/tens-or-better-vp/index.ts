import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TensOrBetterVpState, TensOrBetterVpAction, TensOrBetterVpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TensOrBetterVpGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tensOrBetterVpPlugin: GamePlugin<TensOrBetterVpState, TensOrBetterVpAction, typeof settings> = {
  id: "tens-or-better-vp", title: "Tens or Better Video Poker", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Video poker variant where pairs of tens-or-better pay.",
  howToPlay: "Tens or Better Video Poker is a draw-poker machine variant in which the minimum-paying pair is lowered from jacks to tens, increasing the base-rate payouts at the cost of slightly worse high-end pay. The variant is gentler than Jacks or Better.\n\nIn this single-player drill you play fifteen rounds. Each round the engine deals five cards and pays out using a poker-rank schedule: any pair of tens-or-better pays one point, two pair two, three-of-a-kind three, straight four, flush six, full house nine, four-of-a-kind twenty-five, straight flush fifty, royal flush two hundred and fifty.\n\nPairs of nine or lower pay nothing — the tens-or-better lowered threshold is preserved by treating the pair-rank in the engine.\n\nExpected score across fifteen rounds is thirty-five to seventy. Tens or Better's looser threshold produces more frequent small payouts; the tail toward huge wins is unchanged. Expect a couple of small pair-pays per fifteen rounds plus the occasional bigger hand.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TensOrBetterVpSettings),
  reducer, isTerminal, component: TensOrBetterVpGame,
};
