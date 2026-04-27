import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EndangeredSpeciesQuizState, EndangeredSpeciesQuizAction, EndangeredSpeciesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EndangeredSpeciesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const endangeredSpeciesQuizPlugin: GamePlugin<EndangeredSpeciesQuizState, EndangeredSpeciesQuizAction, typeof settings> = {
  id:"endangered-species-quiz", title:"Endangered Species Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"A solemn thirty-question tour of threatened species and global conservation efforts.",
  howToPlay:"Endangered Species Quiz tests your knowledge of the world's most threatened wildlife and the fight to save them. Questions cover IUCN Red List categories, flagship endangered animals (giant pandas, tigers, rhinos, mountain gorillas, blue whales, sea turtles, monarchs, vaquitas, kakapos, snow leopards, polar bears), critical habitats, the major drivers of decline (habitat loss, poaching, climate change, invasive species), and major conservation success stories like the bald eagle and humpback whale recovery.\n\nEach question allows 15 seconds. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.\n\nTap a choice and press Submit. Correct answers turn green; wrong ones flash red and reveal the truth. Press Next to continue. Choose 10 or 20 questions in Settings. The animals depending on us deserve our attention. Whether you work in conservation, donate to wildlife funds, or simply care, this quiz delivers urgent knowledge of species at the brink and those we have helped pull back.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EndangeredSpeciesQuizSettings),
  reducer,isTerminal,component:EndangeredSpeciesQuizGame,
};
