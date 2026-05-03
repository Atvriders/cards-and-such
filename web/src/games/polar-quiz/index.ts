import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PolarQuizState, PolarQuizAction, PolarQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PolarQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PolarQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const polarQuizPlugin: GamePlugin<PolarQuizState, PolarQuizAction, typeof settings> = {
  id:"polar-quiz", title:"Polar Expeditions Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the great polar expeditions and explorers.",
  howToPlay:"Polar Expeditions Quiz tests your knowledge of humanity's quest to explore the Arctic and Antarctic. Questions cover Roald Amundsen's race against Robert Falcon Scott to the South Pole, Ernest Shackleton's heroic survival of the Endurance disaster, Robert Peary and Frederick Cook's contested North Pole claims, and modern Antarctic stations. You'll be asked about famous ships like the Fram and Endurance, sled dogs versus ponies, frostbite and scurvy, and the age of polar exploration.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PolarQuizSettings),
  reducer,isTerminal,
  hint: (state: PolarQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:PolarQuizGame,
};
