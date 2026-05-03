import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ParthenonQuizState, ParthenonQuizAction, ParthenonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ParthenonQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ParthenonQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const parthenonQuizPlugin: GamePlugin<ParthenonQuizState, ParthenonQuizAction, typeof settings> = {
  id:"parthenon-quiz", title:"Parthenon Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Parthenon, Athens, and ancient Greek architecture.",
  howToPlay:`Parthenon Quiz tests your knowledge of the masterpiece of classical Greek architecture. Questions cover the temple built between 447-432 BC on the Acropolis of Athens, dedicated to the goddess Athena, the city's patron. You'll be quizzed on the architects Ictinus and Callicrates, the sculptor Phidias who created the great statue of Athena Parthenos, and the political backing of Pericles.

Topics include Doric architectural elements, the 46 columns of the perimeter, the famous entasis (subtle column curvature) used to correct optical illusions, the Pentelic marble construction, and the Parthenon's surprising history as a Christian church, then an Ottoman-era mosque, then a powder magazine that exploded under Venetian artillery in 1687. The ongoing 'Elgin Marbles' dispute between Greece and the British Museum is also covered, along with the Panathenaia festival the building was central to.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Channel your inner classicist!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ParthenonQuizSettings),
  reducer,isTerminal,
  hint: (state: ParthenonQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ParthenonQuizGame,
};
