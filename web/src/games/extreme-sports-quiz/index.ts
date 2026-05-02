import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ExtremeSportsQuizState, ExtremeSportsQuizAction, ExtremeSportsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ExtremeSportsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const extremeSportsQuizPlugin: GamePlugin<ExtremeSportsQuizState, ExtremeSportsQuizAction, typeof settings> = {
  id:"extreme-sports-quiz", title:"Extreme Sports Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of extreme sports and athletes.",
  howToPlay:"Extreme Sports Quiz tests your knowledge of high-adrenaline sports. Questions cover BASE jumping, free solo climbing (with Alex Honnold's El Capitan ascent), big-wave surfing at Mavericks and Nazaré, wingsuit flying, downhill mountain biking, freestyle motocross, and skateboarding legends like Tony Hawk. You'll be asked about famous events like the X Games, dangerous spots, equipment, and groundbreaking athletes who pushed the limits of human achievement.\\n\\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\\n\\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on. Choose 10, 20, or 30 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ExtremeSportsQuizSettings),
  reducer,isTerminal,
  hint: (state: ExtremeSportsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ExtremeSportsQuizGame,
};
