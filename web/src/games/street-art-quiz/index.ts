import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StreetArtQuizState, StreetArtQuizAction, StreetArtQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StreetArtQuizGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StreetArtQuizGame as unknown as React.ComponentType<unknown> })));
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const streetArtQuizPlugin: GamePlugin<StreetArtQuizState, StreetArtQuizAction, typeof settings> = {
  id:"street-art-quiz", title:"Street Art Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Street art and graffiti: Banksy, Basquiat, murals, and the urban canvas.",
  howToPlay:`Street Art Quiz takes you out of the gallery and into the alleys, subway cars, and freeway underpasses where graffiti became art. Questions span the New York taggers of the '70s and '80s (Cornbread, Taki 183), gallery crossover stars (Basquiat, Haring, Futura), the global stencil and mural movement (Banksy, Shepard Fairey, JR), and today's mural festivals and Instagram superstars.

You have 15 seconds per question. A correct answer is worth 100 base points plus 10 points for every second remaining. Wrong answers earn nothing.

Tap a choice and press Submit. Correct answers glow green; wrong ones turn red, and the right answer is revealed before you advance. Press Next to move on.

Choose 10, 20, or 30 questions in Settings. Whether you tag, paste, paint, or just love a good mural, get hyped — class is in session.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StreetArtQuizSettings),
  reducer,isTerminal,
  hint: (state: StreetArtQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:StreetArtQuizGame,
};
