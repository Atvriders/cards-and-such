import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DessertQuizState, DessertQuizAction, DessertQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DessertQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DessertQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dessertQuizPlugin: GamePlugin<DessertQuizState, DessertQuizAction, typeof settings> = {
  id:"dessert-quiz", title:"Desserts Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"A sweet thirty-question tour of classic cakes, pies, mousses, and pastries from around the world.",
  howToPlay:"Desserts Quiz tests your knowledge of the world's sweetest ending. Questions cover classic European pastries (croissant, eclair, mille-feuille, opera cake, Black Forest, sachertorte, tiramisu, panna cotta), American mainstays (apple pie, pecan pie, cheesecake, brownies, s'mores), Asian sweets (mochi, dorayaki, bingsu, halo-halo), Middle Eastern delights (baklava, kunafa, basbousa), and the molecular world of mousses, soufflés, and meringues. You'll learn the difference between custard and curd, ganache and pastry cream, and the unique techniques behind classic confections.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice, press Submit. Correct answers light up green; wrong ones turn red and show the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you bake elaborate French pastries or just love a slice of grocery store cheesecake, this quiz delivers a sweet plate of dessert knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DessertQuizSettings),
  reducer,isTerminal,
  hint: (state: DessertQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DessertQuizGame,
};
