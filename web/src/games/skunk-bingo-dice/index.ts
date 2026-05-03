import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkunkBingoDiceState, SkunkBingoDiceAction, SkunkBingoDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkunkBingoDiceGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const skunkBingoDicePlugin: GamePlugin<SkunkBingoDiceState, SkunkBingoDiceAction, typeof settings> = {
  id:"skunk-bingo-dice", title:"Skunk (Dice)", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Skunk, a bingo-card-style push-your-luck dice game.",
  howToPlay:"Skunk Trivia is a ten-question quiz about Skunk, a school-classroom-favorite push-your-luck dice game. Each player has a card divided into S-K-U-N-K columns. Each round, players roll two dice and may bank or continue. The sum is added to that letter's column total — but if a 1 appears on either die, the column scores zero (or its current round score is wiped). If both dice show 1, that letter and all earlier letters' scores are wiped. Players choose to stop or continue rolling each turn, with the player having the highest total at the end of all five letters winning. Each question tests rules and strategy. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SkunkBingoDiceSettings),
  reducer,isTerminal,
  hint: (state: SkunkBingoDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-skunk-bingo-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-skunk-bingo-dice-submit"]', pulses: 3 };
  },
  component:SkunkBingoDiceGame,
};
