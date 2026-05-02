import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SailorMoonQuizState, SailorMoonQuizAction, SailorMoonQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SailorMoonQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const sailorMoonQuizPlugin: GamePlugin<SailorMoonQuizState, SailorMoonQuizAction, typeof settings> = {
  id:"sailor-moon-quiz", title:"Sailor Moon Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your Sailor Moon knowledge: Sailor Scouts, transformations, and Moon Kingdom lore.",
  howToPlay:`Sailor Moon Quiz tests your knowledge of Naoko Takeuchi's iconic magical girl saga. Questions cover Usagi Tsukino's transformation into Sailor Moon, the Inner Senshi (Mercury, Mars, Jupiter, Venus), the Outer Senshi (Uranus, Neptune, Pluto, Saturn), Tuxedo Mask, the Black Moon Clan, the Death Busters, the Dead Moon Circus, Galaxia, and the Moon Kingdom mythology.

You have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers and timeouts earn nothing.

Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move to the next question.

Choose 10 or 20 questions. Moon Prism Power, make up — and prove you remember every Senshi attack name and transformation phrase!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SailorMoonQuizSettings),
  reducer,isTerminal,
  hint: (state: SailorMoonQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:SailorMoonQuizGame,
};
