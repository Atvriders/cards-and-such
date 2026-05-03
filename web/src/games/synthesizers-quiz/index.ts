import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SynthesizersQuizState, SynthesizersQuizAction, SynthesizersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SynthesizersQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SynthesizersQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const synthesizersQuizPlugin: GamePlugin<SynthesizersQuizState, SynthesizersQuizAction, typeof settings> = {
  id:"synthesizers-quiz", title:"Synthesizers Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"History and tech of synthesizers: Moog, ARP, FM, and beyond.",
  howToPlay:"Synthesizers Quiz traces the history of electronic instruments from Theremin's invention to today's software synths. The questions cover analog and digital synthesis, FM synthesis, sampling, modular gear, MIDI, the Moog and ARP, the Yamaha DX7, the Roland TB-303, the Prophet-5, and the genres that grew from these machines.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Hardcore gear nerds, electronic-music lovers, and curious beginners will all find plenty here to plug in and twist!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SynthesizersQuizSettings),
  reducer,isTerminal,
  hint: (state: SynthesizersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SynthesizersQuizGame,
};
