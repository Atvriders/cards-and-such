import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarineBioQuizState, MarineBioQuizAction, MarineBioQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarineBioQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const marineBioQuizPlugin: GamePlugin<MarineBioQuizState, MarineBioQuizAction, typeof settings> = {
  id:"marine-bio-quiz", title:"Marine Biology Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of oceans, fish, coral reefs, and the deep sea.",
  howToPlay:"Marine Biology Quiz challenges you on life beneath the waves: ocean zones, coral reefs, fish, marine mammals, deep-sea creatures, and the threats facing our oceans. Questions span everything from the Mariana Trench to the Great Barrier Reef, from blue whales to bioluminescent jellyfish.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Dive deep into ocean lore \u2014 perfect for snorkelers, scuba divers, marine biology students, and anyone fascinated by the watery world that covers most of our planet!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MarineBioQuizSettings),
  reducer,isTerminal,
  hint: (state: MarineBioQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MarineBioQuizGame,
};
