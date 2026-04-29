import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrunkStonedStupidState, DrunkStonedStupidAction, DrunkStonedStupidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrunkStonedStupidGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const drunkStonedStupidPlugin: GamePlugin<DrunkStonedStupidState, DrunkStonedStupidAction, typeof settings> = {
  id: "drunk-stoned-stupid", title: "Drunk Stoned or Stupid", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Party-card quiz. Match scenario to most-fitting party-archetype label.",
  howToPlay: "Drunk Stoned or Stupid is a party card game where you assign labels to friends in your group — 'Most likely to call their ex at 2am,' 'Most likely to start a band' — and the group votes on who fits best. Our quiz version presents a label and four candidate archetypes, asking which best fits the popular consensus. Twelve rounds, ten points each, 120 max. The original card game was published in 2015 by Kheper Games and works for 4-20 players, ages 17+. The cards are deliberately provocative and meant to start arguments. Hardcore party-game fans hit 100+; casual quizzers can still expect 60-80. Run takes around two minutes. Submit each guess and Next to advance. Drunk Stoned or Stupid sits in the same comedic genre as Cards Against Humanity, Joking Hazard, What Do You Meme, and Disturbed Friends — adult, social, often profane. Our quiz keeps it PG.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DrunkStonedStupidSettings),
  reducer, isTerminal, component: DrunkStonedStupidGame,
};
