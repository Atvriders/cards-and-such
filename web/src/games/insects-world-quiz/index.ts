import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { InsectsWorldQuizState, InsectsWorldQuizAction, InsectsWorldQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InsectsWorldQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const insectsWorldQuizPlugin: GamePlugin<InsectsWorldQuizState, InsectsWorldQuizAction, typeof settings> = {
  id:"insects-world-quiz", title:"Insects World Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Buzz through thirty questions on bees, beetles, butterflies, and the most numerous animals on Earth.",
  howToPlay:"Insects World Quiz tests your knowledge of class Insecta. Questions cover the major orders — Coleoptera (beetles), Lepidoptera (butterflies and moths), Diptera (flies), Hymenoptera (bees, wasps, ants), Hemiptera (true bugs), Orthoptera (grasshoppers and crickets), Odonata (dragonflies and damselflies), and more. You'll see questions on metamorphosis, social structures of bees and ants, famous migrations like the monarch butterfly, pollination, agricultural pests, and the surprising scale of insect biomass and biodiversity worldwide.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers light up green; wrong ones turn red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. Whether you collect specimens, manage hives, or just appreciate fireflies on a summer evening, this quiz delivers a swarm of entomology knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as InsectsWorldQuizSettings),
  reducer,isTerminal,
  hint: (state: InsectsWorldQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:InsectsWorldQuizGame,
};
