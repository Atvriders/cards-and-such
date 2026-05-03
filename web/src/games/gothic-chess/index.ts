import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GothicChessState, GothicChessAction, GothicChessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GothicChessGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GothicChessGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const gothicChessPlugin: GamePlugin<GothicChessState, GothicChessAction, typeof settings> = {
  id:"gothic-chess", title:"Gothic Chess", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Capablanca-style 10×8 with Gothic's specific starting square arrangement.",
  howToPlay:"Gothic Chess is a fast-paced quiz built around the rules, history, and tactical themes of Gothic Chess. Each question describes a position, a rule, or a strategic choice unique to this variant, and asks you to pick the right answer from four choices.\n\nYou have 15 seconds per question. A correct answer awards 100 base points plus 10 points for every second remaining on the clock — so think fast and decide. Wrong answers and timeouts score zero, but the correct choice is always revealed before you continue, turning every miss into a learning moment.\n\nTap a choice to select it, then press Submit. Selected choices glow blue, correct answers turn green, and wrong picks turn red. Press Next to continue to the next question. After ten questions you'll see your final score and how many you nailed.\n\nWhether you've never played this variant or you've studied it for years, the quiz mixes flavor questions, rule trivia, and tactical motifs that capture what makes this version of chess unique.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as GothicChessSettings),
  reducer,isTerminal,hint: (state: GothicChessState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-gothic-chess-answer-0"]', pulses: 3 } : null, component:GothicChessGame,
};
