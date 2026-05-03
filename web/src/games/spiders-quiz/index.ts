import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpidersQuizState, SpidersQuizAction, SpidersQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpidersQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpidersQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spidersQuizPlugin: GamePlugin<SpidersQuizState, SpidersQuizAction, typeof settings> = {
  id:"spiders-quiz", title:"Spiders Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of arachnids.",
  howToPlay:"Spiders Quiz challenges your knowledge of the order Araneae — the spiders. Questions cover web architectures, hunting strategies (orb-weavers vs jumping spiders), venomous species (black widow, brown recluse, funnel-web), tarantulas, spider size and lifespan, and the surprising biology that makes spiders one of Earth's most successful predator groups.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you're an arachnologist, a backyard naturalist, or just curious about the eight-legged neighbors, this quiz invites you to spin a web of knowledge. Climb on in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SpidersQuizSettings),
  reducer,isTerminal,
  hint: (state: SpidersQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SpidersQuizGame,
};
