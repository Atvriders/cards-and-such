import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CountryCapitalsMiniState, CountryCapitalsMiniAction, CountryCapitalsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CountryCapitalsMiniGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const countryCapitalsMiniPlugin: GamePlugin<CountryCapitalsMiniState, CountryCapitalsMiniAction, typeof settings> = {
  id:"country-capitals-mini", title:"Country Capitals Mini", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Quick country capitals quiz. 10 or 20 questions, 15s each.",
  howToPlay:"Country Capitals Mini is a fast world-geography quiz. Each question presents a country and four candidate capital cities. Pick the correct one and hit Submit.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong or timed-out answers score zero. The right answer is revealed at the end of each round before you continue.\n\nThe pool covers major countries from every populated continent. Beware of the classic gotchas: Australia's capital is Canberra (not Sydney). Canada's is Ottawa (not Toronto). Brazil moved its capital to Bras\u00edlia in 1960. Turkey's is Ankara (not Istanbul). South Africa has three capitals \u2014 Pretoria is the executive seat. Switzerland is Bern. Vietnam is Hanoi (not Ho Chi Minh City).\n\nChoose 10 or 20 questions in Settings. With 24 countries in the pool, every game shuffles a fresh subset. Whether you're a trivia veteran or brushing up before a flight, this is a quick way to test how well your mental atlas holds up.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CountryCapitalsMiniSettings),
  reducer,isTerminal,component:CountryCapitalsMiniGame,
};
