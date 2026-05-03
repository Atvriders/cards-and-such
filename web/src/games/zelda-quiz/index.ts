import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZeldaState, ZeldaAction, ZeldaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZeldaQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZeldaQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zeldaQuizPlugin: GamePlugin<ZeldaState, ZeldaAction, typeof settings> = {
  id:"zelda-quiz", title:"Zelda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of The Legend of Zelda: Hyrule, Link, Princess Zelda, and Ganon.",
  howToPlay:"The Legend of Zelda Quiz tests your knowledge of Nintendo's beloved fantasy adventure franchise, from the original 1986 NES game through Tears of the Kingdom. Questions cover the kingdom of Hyrule and beyond — Link, Princess Zelda, Ganon, Ganondorf, Sheik, Navi, Epona, Saria, Malon, the Triforce, Master Sword, and the Sheikah, Goron, Zora, Rito, Gerudo, and Kokiri peoples.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. It's dangerous to go alone — take this quiz!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZeldaSettings),
  reducer,isTerminal,
  hint: (state: ZeldaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ZeldaQuizGame,
};
