import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WerewolfQuizState, WerewolfQuizAction, WerewolfQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WerewolfQuizGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const werewolfQuizPlugin: GamePlugin<WerewolfQuizState, WerewolfQuizAction, typeof settings> = {
  id: "werewolf-quiz",
  title: "Werewolf Strategy Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on classic Werewolf / Mafia hidden-role play.`,
  howToPlay: `Werewolf Strategy Quiz tests your knowledge of the granddaddy of social-deduction games (also known as Mafia). Villagers and Werewolves alternate Day and Night phases — Wolves murder by night, the Village lynches by day.

Across 10 multiple-choice questions you'll explore: standard role distributions, the Seer / Doctor dynamic, hammer thresholds, the cost of premature claims, and classic Wolf strategies for blending in.

Each correct answer earns 100 points (1000 max) and the right answer is shown each round.

Topics include: ratio of Wolves to Villagers, optimal Seer reveal timing, why Wolves often counter-claim Seer, the impact of bodyguard / Doctor protection, and what Village should do if the Seer dies in night 1.

Tips: in standard play 1 Wolf per 4 Villagers is balanced. Wolves win by parity (=). The Seer is the Village's strongest unit but also the Wolves' top kill target — they should commit a soft-claim early via behavioural cues rather than a public name. Out-of-order discussion patterns are the strongest Wolf tell.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WerewolfQuizSettings),
  reducer,
  isTerminal,
  component: WerewolfQuizGame,
};
