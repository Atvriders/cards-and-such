import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PasseDixState, PasseDixAction, PasseDixSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PasseDixGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const passeDixPlugin: GamePlugin<PasseDixState, PasseDixAction, typeof settings> = {
  id:"passe-dix", title:"Passe-dix", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"12th-century three-dice game; pass 10 to win. 12 rounds.",
  howToPlay:"Passe-dix is one of the oldest known dice games, dating to 12th-century Europe and possibly earlier. The name means \"pass ten\" in French — and that's the entire game: roll three dice, and if your sum exceeds 10, you win the round.\n\nIn this 12-round version, you auto-roll three dice each round. Sum > 10 = win = 15 points. Sum ≤ 10 = loss = 0 points. Sum exactly 10 is \"house edge\" (loss). The probability distribution of three dice means sums of 11+ occur about 50% of the time.\n\n12 rounds total. Average expected score: 75-105 points (about 6 wins per session at 15 points each).\n\nThe historical Passe-dix was played in taverns for coins; medieval gamblers loved its simplicity. There's no strategy — just roll and pray. The game's appeal is its purity: ancient, brutal, evergreen.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PasseDixSettings),
  reducer,isTerminal,component:PasseDixGame,
};
