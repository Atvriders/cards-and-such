import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BirdsWorldQuizState, BirdsWorldQuizAction, BirdsWorldQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BirdsWorldQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BirdsWorldQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const birdsWorldQuizPlugin: GamePlugin<BirdsWorldQuizState, BirdsWorldQuizAction, typeof settings> = {
  id:"birds-world-quiz", title:"Birds of the World Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Soar through thirty questions on birds across continents — from raptors to songbirds to flightless giants.",
  howToPlay:"Birds of the World Quiz tests your knowledge of avian life across every continent. Questions cover the major orders — raptors (eagles, hawks, owls, falcons), waterfowl (ducks, geese, swans), seabirds (albatrosses, penguins, frigatebirds), perching songbirds (robins, sparrows, mockingbirds, finches), flightless ratites (ostrich, emu, kiwi, cassowary), parrots, hummingbirds, and many more. You'll see questions on geographic ranges, migrations, signature features (like the peacock's tail or the toucan's bill), and famous endangered or extinct species.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong choices turn red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you carry binoculars to a marsh every Saturday or just love a backyard cardinal, this quiz delivers a flock of avian knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BirdsWorldQuizSettings),
  reducer,isTerminal,
  hint: (state: BirdsWorldQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BirdsWorldQuizGame,
};
