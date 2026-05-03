import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoTState, GoTAction, GoTSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GoTQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GoTQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gotQuizPlugin: GamePlugin<GoTState, GoTAction, typeof settings> = {
  id:"got-quiz", title:"Game of Thrones Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of HBO's Game of Thrones: Westeros, Essos, dragons, and politics.",
  howToPlay:"Game of Thrones Quiz tests your knowledge of HBO's epic fantasy series based on George R.R. Martin's A Song of Ice and Fire novels. Questions span all eight seasons across Westeros and Essos — the great houses (Stark, Lannister, Targaryen, Baratheon, Tyrell, Greyjoy, Tully, Martell), the Night's Watch, the Wildlings, the Faceless Men, dragons, White Walkers, and political intrigue from the Iron Throne to the Wall.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. Winter is coming — but your high score is now.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GoTSettings),
  reducer,isTerminal,
  hint: (state: GoTState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GoTQuizGame,
};
