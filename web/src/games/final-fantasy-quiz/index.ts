import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FinalFantasyState, FinalFantasyAction, FinalFantasySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FinalFantasyQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FinalFantasyQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const finalFantasyQuizPlugin: GamePlugin<FinalFantasyState, FinalFantasyAction, typeof settings> = {
  id:"final-fantasy-quiz", title:"Final Fantasy Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Final Fantasy: Square Enix's epic JRPG saga.",
  howToPlay:"Final Fantasy Quiz tests your knowledge of Square Enix's legendary JRPG franchise, from the original 1987 NES adventure to Final Fantasy XVI and the FF7 Remake trilogy. Questions cover the mainline numbered entries — FF1 through FF16 — plus protagonists like Cloud, Tidus, Squall, Lightning, Noctis, and Terra, antagonists like Sephiroth and Kefka, recurring elements (Chocobos, Moogles, Cid, crystals, summons), and the franchise's iconic music by Nobuo Uematsu.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. The crystal awaits!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FinalFantasySettings),
  reducer,isTerminal,
  hint: (state: FinalFantasyState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:FinalFantasyQuizGame,
};
