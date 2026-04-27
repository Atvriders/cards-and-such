import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WildCatsQuizState, WildCatsQuizAction, WildCatsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WildCatsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wildCatsQuizPlugin: GamePlugin<WildCatsQuizState, WildCatsQuizAction, typeof settings> = {
  id:"wild-cats-quiz", title:"Wild Cats Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of lions, tigers, leopards and more.",
  howToPlay:"Wild Cats Quiz tests your knowledge of the world's wild felids — from the iconic African lion to the elusive snow leopard, the lightning-fast cheetah to the misunderstood lynx. Questions cover species ranges, distinctive markings, hunting techniques, conservation status, and the unique adaptations of each big and small wild cat.\n\nEach correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer. Wrong answers earn nothing. There are 10 questions per game.\n\nTap a choice, then press Submit. The right answer is revealed before you continue. Whether you're a wildlife documentary buff, a zoo regular, or a conservation supporter, this quiz puts your big-cat literacy to the test.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WildCatsQuizSettings),
  reducer,isTerminal,component:WildCatsQuizGame,
};
