import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HasamiShogiState, HasamiShogiAction, HasamiShogiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const HasamiShogiGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.HasamiShogiGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hasamiShogiPlugin: GamePlugin<HasamiShogiState, HasamiShogiAction, typeof settings> = {
  id:"hasami-shogi-quiz", title:"Hasami Shogi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hasami Shogi, the sandwiching capture variant.",
  howToPlay:"Hasami Shogi is a simple Shogi-derived game played on a 9x9 Shogi board (or a 7x7 reduced board) using only pawns. Each side starts with a row of nine pawns; players move pieces orthogonally and capture by sandwiching an opposing piece between two of their own. The win condition has two main flavors: removing a fixed number of opposing pieces, or in another variant, getting five-in-a-row of your own.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HasamiShogiSettings),
  reducer,isTerminal,
  hint: (state: HasamiShogiState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HasamiShogiGame,
};
