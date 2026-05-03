import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IslandQuizState, IslandQuizAction, IslandQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IslandQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IslandQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const islandQuizPlugin: GamePlugin<IslandQuizState, IslandQuizAction, typeof settings> = {
  id:"island-quiz", title:"Island Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the world's famous islands. 10 or 20 questions.",
  howToPlay:"Island Quiz tests your knowledge of the world's notable islands and archipelagos. The pool covers the giants (Greenland, New Guinea, Borneo, Madagascar), the iconic (Iceland, Easter, Gal\u00e1pagos, Hawaii), and the geographically tricky (Hispaniola split between Haiti and the DR, Borneo split among three countries).\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 answer quickly to maximize your score. Wrong answers earn nothing.\n\nSome classic facts: Greenland is the world's largest island that's not a continent (Australia outranks it but counts as a continent). Borneo is the third largest island and split among Indonesia, Malaysia, and Brunei. Hispaniola houses two distinct nations. The Gal\u00e1pagos belong to Ecuador, Easter Island to Chile, and the Canaries to Spain.\n\nChoose 10 or 20 questions in Settings. Whether you've sailed the Caribbean or just dreamed of it, this quiz will show how well you've mapped the world's offshore real estate!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IslandQuizSettings),
  reducer,isTerminal,
  hint: (state: IslandQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:IslandQuizGame,
};
