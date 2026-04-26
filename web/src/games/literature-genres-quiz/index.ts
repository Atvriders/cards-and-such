import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LitGenresState, LitGenresAction, LitGenresSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LiteratureGenresQuiz } from "./Game.js";

const settings = {
  questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const literatureGenresQuizPlugin: GamePlugin<LitGenresState, LitGenresAction, typeof settings> = {
  id: "literature-genres-quiz",
  title: "Literature Genres Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of literary genres — from realism and gothic to spy fiction and magical realism.",
  howToPlay: `Literature Genres Quiz tests your understanding of the major categories and styles of written fiction and non-fiction. Questions cover everything from ancient forms like epic poetry and tragedy to modern genres like cyberpunk, flash fiction, and magical realism.

Each question offers four choices. You have 15 seconds to answer. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining — so quick, confident answers score highest.

Click your choice, then press Submit. After submitting, the correct answer highlights green and any wrong selection turns red. Press Next to advance.

Use Settings to select 10, 20, or 30 questions. Topics include the defining features of each genre, famous examples, and tricky distinctions such as naturalism versus realism or satire versus parody.

By the end you will be able to identify a bildungsroman, explain what makes something gothic, and distinguish hard-boiled noir from a cozy mystery. Perfect for literature students, avid readers, and anyone who loves books!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as LitGenresSettings),
  reducer,
  isTerminal,
  component: LiteratureGenresQuiz,
};
