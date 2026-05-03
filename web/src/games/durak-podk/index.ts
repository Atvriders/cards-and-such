import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DurakPodkState, DurakPodkAction, DurakPodkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DurakPodkGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DurakPodkGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const durakPodkPlugin: GamePlugin<DurakPodkState, DurakPodkAction, typeof settings> = {
  id:"durak-podk", title:"Durak (Podkidnoy)", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Durak (Podkidnoy), the most popular Russian card game.",
  howToPlay:"Durak Trivia is a ten-question quiz about Durak (Podkidnoy or 'thrown-in'), one of the most popular card games in Russia and former Soviet states. Played by 2-6 players with a 36-card deck (6, 7, 8, 9, 10, J, Q, K, A in four suits) and a trump suit determined by an upturned card, players take turns attacking and defending. The goal is to NOT be the last player with cards in hand — that player is the 'durak' (fool). Attackers play cards one at a time and defenders must beat them with higher cards of the same suit or trumps. Up to 6 attacks per round. Each question tests rules, history, and culture of Durak. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DurakPodkSettings),
  reducer,isTerminal,
  hint: (state: any) => {
    if (state.phase === "result") return { selector: '[data-testid="hint-target-durak-podk-next"]', pulses: 3 };
    if (state.phase === "playing" && state.selected !== null) return { selector: '[data-testid="hint-target-durak-podk-submit"]', pulses: 3 };
    return null;
  },component:DurakPodkGame,
};
