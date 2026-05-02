import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GeometryQuizState, GeometryQuizAction, GeometryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GeometryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const geometryQuizPlugin: GamePlugin<GeometryQuizState, GeometryQuizAction, typeof settings> = {
  id:"geometry-quiz", title:"Geometry Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your geometry: shapes, areas, angles, theorems.",
  howToPlay:"Geometry Quiz challenges your knowledge of shapes, formulas, and proofs. Questions cover the basics — points, lines, planes — through angles, polygons, circles, triangles (right, isosceles, equilateral), congruence, similarity, area and perimeter, the Pythagorean theorem, volumes of solids, coordinate geometry, transformations, and even a few classic puzzlers.\n\nYou have 15 seconds per question. Correct answers earn 100 points plus 10 per second left on the clock. Wrong answers earn zero, but the right answer is revealed.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you're brushing up for SATs, prepping for an engineering interview, or just love the elegance of Euclid, this quiz will test the breadth of your geometric intuition. No protractors needed — just clear thinking.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GeometryQuizSettings),
  reducer,isTerminal,
  hint: (state: GeometryQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:GeometryQuizGame,
};
