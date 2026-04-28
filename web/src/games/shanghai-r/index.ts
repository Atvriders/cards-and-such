import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShanghaiRState, ShanghaiRAction, ShanghaiRSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ShanghaiRGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const shanghaiRPlugin: GamePlugin<ShanghaiRState, ShanghaiRAction, typeof settings> = {
  id: "shanghai-r", title: "Shanghai Rummy", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Contract rummy — meet the round's required combination of sets and runs.",
  howToPlay: "Shanghai Rummy is a contract rummy where each round demands a specific combination of melds before you can lay down. Round one: two sets of three. Round two: one set and one run. Round three: two runs of four. Round four: three sets. Round five: two sets and one run. Round six: two runs of four and one set.\n\nEach round you are dealt nine cards. The engine auto-melds your hand into sets (three or more of the same rank) and runs (three or more consecutive same-suit cards). It then checks whether the round's contract is met.\n\nSix rounds are played. Meeting a contract scores thirty-five points plus five points per extra meld in your hand. Failing the contract scores five consolation points per partial meld (sets or runs of two).\n\nExpected score is around fifty-five to ninety points across six rounds. Difficult round contracts (two runs of four) push success rates near twenty per cent; simpler contracts hit fifty per cent. A clean six-round sweep would push past 250 — a remarkable run.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShanghaiRSettings),
  reducer, isTerminal, component: ShanghaiRGame,
};
