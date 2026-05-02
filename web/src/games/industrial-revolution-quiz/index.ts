import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IndustrialRevolutionQuizState, IndustrialRevolutionQuizAction, IndustrialRevolutionQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IndustrialRevolutionQuizGame } from "./Game.js";
const settings = { questionCount: { kind:"enum" as const, label:"Questions", options:["5","10","15"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const industrialRevolutionQuizPlugin: GamePlugin<IndustrialRevolutionQuizState, IndustrialRevolutionQuizAction, typeof settings> = {
  id:"industrial-revolution-quiz", title:"Industrial Revolution Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Industrial Revolution — inventions, factories, steam power, and social change.",
  howToPlay:`Industrial Revolution Quiz tests your knowledge of the period from the mid-18th to 19th century when machines transformed manufacturing and society. Questions cover key inventors like James Watt, George Stephenson, Eli Whitney, and Thomas Edison; pivotal technologies like the steam engine, spinning jenny, and Bessemer steel process; and social changes like urbanization, the rise of the middle class, and the labor movement.

Each question offers four choices. Pick the correct one to earn 10 points. Green means right; red means wrong.

Press Next to continue. Choose 5, 10, or 15 questions in Settings.

Key facts: The revolution began in Britain; James Watt improved the steam engine; the spinning jenny mechanized textiles; the Luddites destroyed machines in protest; Marx and Engels wrote the Communist Manifesto; coal was the main fuel; the middle class grew dramatically. Know these to achieve a perfect score!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IndustrialRevolutionQuizSettings),
  reducer,isTerminal,
  hint: (state: IndustrialRevolutionQuizState): HintTarget | null => !state.done ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:IndustrialRevolutionQuizGame,
};
