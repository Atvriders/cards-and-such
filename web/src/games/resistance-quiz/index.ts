import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ResistanceQuizState, ResistanceQuizAction, ResistanceQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ResistanceQuizGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const resistanceQuizPlugin: GamePlugin<ResistanceQuizState, ResistanceQuizAction, typeof settings> = {
  id: "resistance-quiz",
  title: "Resistance Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on The Resistance hidden-role mission rules and strategy.`,
  howToPlay: `The Resistance Strategy Quiz tests your knowledge of the modern hidden-role classic by Don Eskridge. Players are split into Resistance operatives (good) and Imperial spies (bad), with spies knowing each other and the Resistance not knowing anyone.

Across 10 multiple-choice questions you'll be asked about mission sizes, vote sequences, fail-card mechanics, optimal Resistance strategy, common spy tells, and the psychological dynamics of a five-mission game. Correct answers each award 100 points for a 1000 max.

Topics include: how many fails sink a mission, when spies should sandbag, why the third mission is most pivotal in 5–6 player games, and how leader rotation interacts with the five-vote-fail rule.

Tap a choice, press Submit, then see whether you nailed it. The right answer is shown each round to teach as you play. Press Next to advance.

Tips: the most common Resistance error is approving any team without scrutiny. Memorise the mission-size table and learn the early-vote heuristics — they're tested.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ResistanceQuizSettings),
  reducer,
  isTerminal,
  component: ResistanceQuizGame,
};
