import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AlCaponeQuizState, AlCaponeQuizAction, AlCaponeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AlCaponeQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AlCaponeQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const alCaponeQuizPlugin: GamePlugin<AlCaponeQuizState, AlCaponeQuizAction, typeof settings> = {
  id:"al-capone-quiz", title:"Al Capone Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Chicago crime boss Al Capone.",
  howToPlay:"Al Capone Quiz tests your knowledge of America's most famous mob boss. Alphonse \"Scarface\" Capone dominated Chicago organized crime during Prohibition, running bootlegging, gambling and prostitution rackets from his South Side base. His name became synonymous with the era's violence and the rise of the modern American mafia.\n\nQuestions cover his Brooklyn youth, his rise under Johnny Torrio, the St. Valentine's Day Massacre, his rivalry with Bugs Moran's North Side Gang, Eliot Ness and the Untouchables, his eventual prosecution by federal agent Frank Wilson — not for murder but for tax evasion — and his time at Alcatraz before retirement on his Palm Island estate.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn zero. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AlCaponeQuizSettings),
  reducer,isTerminal,
  hint: (state: AlCaponeQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:AlCaponeQuizGame,
};
