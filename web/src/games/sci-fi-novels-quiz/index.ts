import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SciFiNovelsQuizState, SciFiNovelsQuizAction, SciFiNovelsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SciFiNovelsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SciFiNovelsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sciFiNovelsQuizPlugin: GamePlugin<SciFiNovelsQuizState, SciFiNovelsQuizAction, typeof settings> = {
  id:"sci-fi-novels-quiz", title:"Sci-Fi Novels Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Asimov, Heinlein, Le Guin, Dick, and the masters of science fiction.",
  howToPlay:`Sci-Fi Novels Quiz tests your knowledge of science fiction's golden age, new wave, and modern era. Questions cover the Big Three of classic sci-fi — Isaac Asimov (Foundation, I Robot), Robert Heinlein (Stranger in a Strange Land, Starship Troopers), and Arthur C. Clarke (2001, Childhood's End) — alongside Frank Herbert's Dune, Ursula K. Le Guin's Earthsea and Hainish books, and Philip K. Dick's reality-bending novels.\n\nYou will also see questions on cyberpunk masters (Gibson, Stephenson), space opera (Simmons's Hyperion, Card's Ender's Game, Niven's Ringworld), Bradbury's poetic dystopias, and contemporary giants like Liu Cixin (The Three-Body Problem) and Margaret Atwood.\n\nEach question has a 15-second timer. Correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings. May the spice flow — and good luck, traveler!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SciFiNovelsQuizSettings),
  reducer,isTerminal,
  hint: (state: SciFiNovelsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SciFiNovelsQuizGame,
};
