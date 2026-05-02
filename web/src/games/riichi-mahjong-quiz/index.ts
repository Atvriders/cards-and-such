import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RiichiMahjongState, RiichiMahjongAction, RiichiMahjongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RiichiMahjongGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const riichiMahjongPlugin: GamePlugin<RiichiMahjongState, RiichiMahjongAction, typeof settings> = {
  id:"riichi-mahjong-quiz", title:"Riichi Mahjong Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Riichi (Japanese) Mahjong rules and strategy.",
  howToPlay:"Japanese Riichi Mahjong is the structured competitive form of Mahjong played in Japan. Each player builds a 14-tile hand using draws and discards; before completing the hand, a player one tile away (tenpai) may declare 'riichi', betting 1000 points and locking the hand. Scoring is a complex set of yaku, dora indicators, and limit hands. Riichi Mahjong's discipline, with red five tiles (akadora), pao penalties, and structured ruleset (e.g., Japanese Pro Mahjong League rules), is the pinnacle of Japanese tile play.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RiichiMahjongSettings),
  reducer,isTerminal,
  hint: (state: RiichiMahjongState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:RiichiMahjongGame,
};
