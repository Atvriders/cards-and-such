import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanamikojiState, HanamikojiAction, HanamikojiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanamikojiGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const hanamikojiPlugin: GamePlugin<HanamikojiState, HanamikojiAction, typeof settings> = {
  id:"hanamikoji-quiz", title:"Hanamikoji Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Hanamikoji, the geisha-favour card game.",
  howToPlay:"Hanamikoji is a modern two-player card game by Kota Nakayama in which both players try to win the favour of seven geishas, each holding a fan worth a specific number of victory tokens. Each round, players draw cards representing favours and choose four actions to play them: gift, dump, withhold-secret, and offer-choice. After all cards are committed, each geisha awards her fan to whoever offered her the most cards. Win by securing four geishas or 11 points.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HanamikojiSettings),
  reducer,isTerminal,
  hint: (state: HanamikojiState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:HanamikojiGame,
};
