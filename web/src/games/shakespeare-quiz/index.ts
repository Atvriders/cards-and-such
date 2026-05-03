import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShakespeareQuizState, ShakespeareQuizAction, ShakespeareQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ShakespeareQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ShakespeareQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const shakespeareQuizPlugin: GamePlugin<ShakespeareQuizState, ShakespeareQuizAction, typeof settings> = {
  id:"shakespeare-quiz", title:"Shakespeare Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Plays, sonnets, characters, and the Bard's life and times.",
  howToPlay:`Shakespeare Quiz tests your knowledge of the world's most influential playwright. Questions span the major plays — Hamlet, Macbeth, King Lear, Othello, Romeo and Juliet — along with the comedies (A Midsummer Night's Dream, Twelfth Night, As You Like It), the histories (Henry IV-V, Richard III), and late romances like The Tempest.\n\nYou will be asked about iconic characters: Lady Macbeth, Iago, Falstaff, Puck, Prospero, Shylock, Beatrice, Rosalind. Plus famous lines, key plot moments, settings, and even Shakespeare's own life — born in Stratford-upon-Avon in 1564, died in 1616.\n\nThere are also questions on the 154 sonnets, including the most quoted (Sonnet 18) and the dark lady mysteries.\n\nEach question gives 15 seconds. Correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings. Now — to quiz, or not to quiz: that is the question!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ShakespeareQuizSettings),
  reducer,isTerminal,
  hint: (state: ShakespeareQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ShakespeareQuizGame,
};
