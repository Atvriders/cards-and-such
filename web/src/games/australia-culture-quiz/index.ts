import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AustraliaCultureQuizState, AustraliaCultureQuizAction, AustraliaCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AustraliaCultureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const australiaCultureQuizPlugin: GamePlugin<AustraliaCultureQuizState, AustraliaCultureQuizAction, typeof settings> = {
  id:"australia-culture-quiz", title:"Australia Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Australian culture: outback, animals, surf, and history.",
  howToPlay:"Australia Culture Quiz tests your knowledge of Down Under. Questions span the Aboriginal Dreamtime, Captain Cook's arrival, the convict colonies, federation in 1901, the gold rush, the ANZAC legend, modern politics, iconic wildlife from kangaroos to platypuses, surf culture from Bondi to the Gold Coast, AFL and rugby league, and global icons including Crocodile Dundee, Vegemite, and the Sydney Opera House.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn zero but reveal the right answer.\n\nTap a choice and press Submit. Green is correct, red is wrong. Press Next to continue.\n\nChoose 10 or 20 questions in Settings. Whether you're a born-and-bred Aussie battler, a tourist who has petted a koala in Queensland, or just a fan of Crocodile Dundee, this quiz will test your knowledge of the Lucky Country.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AustraliaCultureQuizSettings),
  reducer,isTerminal,component:AustraliaCultureQuizGame,
};
