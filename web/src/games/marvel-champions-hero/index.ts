import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelChampionsHeroState, MarvelChampionsHeroAction, MarvelChampionsHeroSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarvelChampionsHeroGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const marvelChampionsHeroPlugin: GamePlugin<MarvelChampionsHeroState, MarvelChampionsHeroAction, typeof settings> = {
  id: "marvel-champions-hero",
  title: "Marvel Champions: Hero Crisis",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marvel LCG hero-vs-villain variant — alternating crisis and response decks.",
  howToPlay: "Marvel Champions: Hero Crisis is a cooperative simulation of the LCG. You and your AI hero ally face a villain over ten rounds. Each round both dice represent your attack value (one die) plus your thwart value (the other). Combine to bring the villain to 75 stress points and win the scenario.\n\nPress Play Round to attack and thwart. Then press Next Round, or Finish on round 10.\n\nIn the box, players alternate hero form and alter ego form to balance offence and recovery; this variant abstracts that into combined dice. The Crisis bonus rewards perfect synergy — both heroes contributing high rolls. Stop the villain before the encounter deck fully breaks. Avengers, assemble.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarvelChampionsHeroSettings),
  reducer, isTerminal, component: MarvelChampionsHeroGame,
};
