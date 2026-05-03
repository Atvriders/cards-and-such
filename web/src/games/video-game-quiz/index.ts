import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VideoGameQuizState, VideoGameQuizAction, VideoGameQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const VideoGameQuiz = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.VideoGameQuiz as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const videoGameQuizPlugin: GamePlugin<VideoGameQuizState, VideoGameQuizAction, typeof settings> = {
  id:"video-game-quiz", title:"Video Game Quiz", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Test your gaming knowledge — studios, characters, platforms, and iconic moments.",
  howToPlay:`Video Game Quiz challenges your knowledge of the gaming world. From classic arcade legends to modern open-world epics, questions span consoles, studios, characters, and defining moments in gaming history.

Select one of four answers and press Submit. Each correct answer earns 100 points. After submitting, the correct answer is revealed so you can learn and improve.

Topics include: Nintendo characters (Mario, Link, Pikachu), PlayStation and Xbox history, iconic RPG franchises (Final Fantasy, The Witcher, Mass Effect), battle royale games, sandbox titles like Minecraft, and legendary developers like FromSoftware and CD Projekt Red.

Use Settings to choose 10 or 20 questions. Questions are randomly drawn and answer choices are shuffled every game for replayability. Whether you grew up on an Atari or are a current-gen gamer, this quiz covers the breadth of interactive entertainment history. How many can you get right?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VideoGameQuizSettings),
  reducer, isTerminal, 
  hint: (state: VideoGameQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:VideoGameQuiz,
};
