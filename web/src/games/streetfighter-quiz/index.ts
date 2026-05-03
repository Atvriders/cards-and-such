import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StreetfighterState, StreetfighterAction, StreetfighterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StreetfighterQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StreetfighterQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const streetfighterQuizPlugin: GamePlugin<StreetfighterState, StreetfighterAction, typeof settings> = {
  id:"streetfighter-quiz", title:"Street Fighter Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Street Fighter: Capcom's legendary fighting game series.",
  howToPlay:"Street Fighter Quiz tests your knowledge of Capcom's legendary fighting game franchise, from Street Fighter (1987) and the world-shaking Street Fighter II (1991) all the way through to Street Fighter 6. Questions cover the World Warriors — Ryu, Ken, Chun-Li, Guile, Blanka, E. Honda, Zangief, Dhalsim — plus the boss roster (M. Bison, Sagat, Vega, Balrog), Akuma, the SF Alpha and SF3 cast, and the franchise's signature special moves and crossover history.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. HADOUKEN!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StreetfighterSettings),
  reducer,isTerminal,
  hint: (state: StreetfighterState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StreetfighterQuizGame,
};
