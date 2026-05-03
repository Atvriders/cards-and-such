import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColdWarSpiesQuizState, ColdWarSpiesQuizAction, ColdWarSpiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColdWarSpiesQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColdWarSpiesQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const coldWarSpiesQuizPlugin: GamePlugin<ColdWarSpiesQuizState, ColdWarSpiesQuizAction, typeof settings> = {
  id:"cold-war-spies-quiz", title:"Cold War Spies Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Cold War spies, double agents, and espionage.",
  howToPlay:"Cold War Spies Quiz tests your knowledge of the agents, defectors, and double crosses that defined the shadow conflict between East and West from the late 1940s to 1991. Questions span the Cambridge Five, the Walker spy ring, KGB illegals like Rudolf Abel, atomic spies including the Rosenbergs and Klaus Fuchs, plus iconic incidents like the Berlin Tunnel, the U-2 affair and the Glienicke Bridge exchanges.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue.\n\nChoose 10 or 20 questions in Settings. Whether you're a John le Carré devotee or a casual fan of spy thrillers, this quiz will keep you guessing.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ColdWarSpiesQuizSettings),
  reducer,isTerminal,
  hint: (state: ColdWarSpiesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ColdWarSpiesQuizGame,
};
