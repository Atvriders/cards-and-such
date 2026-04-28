import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LiverpoolRState, LiverpoolRAction, LiverpoolRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LiverpoolRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const liverpoolRPlugin: GamePlugin<LiverpoolRState, LiverpoolRAction, typeof settings> = {
  id: "liverpool-r", title: "Liverpool Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Contract rummy played with wild jokers; complete the round's contract.",
  howToPlay: "Liverpool Rummy is a contract rummy that uses wild jokers. Each round demands a specific combination of melds. Round one: two sets of three. Round two: one set of three and one run of four. Round three: two runs of four. Round four: three sets of three. Round five: two sets and a run. Round six: three runs of four.\n\nEach round you are dealt nine cards plus a chance for one wild joker (~15% probability per hand). The engine auto-melds your hand, with jokers substituting for any missing card. Meeting the contract scores thirty-five points; failing scores zero.\n\nSix rounds are played. Beyond the base score, each extra meld in your hand adds five points, and each joker used adds ten points. The wild jokers boost the chance of completing the harder rounds.\n\nExpected score is around fifty-five to ninety points across six rounds; lucky joker draws can push past 150. Liverpool's wild jokers make it considerably more forgiving than Shanghai. Easy contracts in early rounds; tougher ones at the end where the jokers really earn their keep.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LiverpoolRSettings),
  reducer, isTerminal, component: LiverpoolRGame,
};
