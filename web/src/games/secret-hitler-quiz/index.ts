import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SecretHitlerQuizState, SecretHitlerQuizAction, SecretHitlerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SecretHitlerQuizGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const secretHitlerQuizPlugin: GamePlugin<SecretHitlerQuizState, SecretHitlerQuizAction, typeof settings> = {
  id: "secret-hitler-quiz",
  title: "Secret Hitler Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Secret Hitler's policy-deck deduction and mechanics.`,
  howToPlay: `Secret Hitler Strategy Quiz tests your knowledge of the 2016 hidden-role classic. The Liberal majority races to enact 5 Liberal policies before the Fascists enact 6 Fascist policies — or before Hitler is elected Chancellor after 3 Fascist policies.

Across 10 multiple-choice questions you'll cover: deck composition (6L/11F), president and chancellor flow, executive actions unlocked at fascist policy thresholds, Hitler's win conditions, and standard Liberal/Fascist strategies.

Each correct answer is 100 points for a 1000 max. The right answer is revealed each round.

Topics include: when investigations become available, why veto unlocks at 5 fascists, why Hitler should sandbag early, optimal claim patterns when receiving the policy hand, and the power dynamics of forced government rejections.

Tips: in standard play, the deck is 6 Liberal / 11 Fascist policies — most random hands favour Fascists. Track the deck so you can call out lying chancellors. Hitler's biggest tells are knowing too little about other Fascists or being too eager to be Chancellor after the third Fascist policy.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SecretHitlerQuizSettings),
  reducer,
  isTerminal,
  component: SecretHitlerQuizGame,
};
