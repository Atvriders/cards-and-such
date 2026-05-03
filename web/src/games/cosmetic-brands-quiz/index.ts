import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CosmeticBrandsQuizState, CosmeticBrandsQuizAction, CosmeticBrandsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CosmeticBrandsQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CosmeticBrandsQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cosmeticBrandsQuizPlugin: GamePlugin<CosmeticBrandsQuizState, CosmeticBrandsQuizAction, typeof settings> = {
  id:"cosmetic-brands-quiz", title:"Cosmetic Brands Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Beauty, makeup and skincare brands across the decades.",
  howToPlay:"Cosmetic Brands Quiz tests your knowledge of beauty and skincare. Questions cover legacy houses (Estée Lauder, L'Oréal, Maybelline, Revlon, Clinique, Lancôme), modern celebrity launches (Fenty, Rare, Kylie), country origins, signature products, and the founders and ad campaigns that shaped the cosmetics industry over a century.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Powder up — see if your beauty IQ shines as bright as a perfect highlight!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CosmeticBrandsQuizSettings),
  reducer,isTerminal,
  hint: (state: CosmeticBrandsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:CosmeticBrandsQuizGame,
};
