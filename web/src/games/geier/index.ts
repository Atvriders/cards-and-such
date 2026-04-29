import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GeierGame } from "./Game.js";

const settings = {} as const;
type S = SettingsOf<typeof settings>;
type GAction = { type: "play"; cardId: string };

export const geierPlugin: GamePlugin<GState, GAction, typeof settings> = {
  id: "geier",
  title: "Geier",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Schafkopf 'Vulture' contract with only Obers (Queens) as trump.",
  howToPlay: "Geier ('Vulture') is the Schafkopf solo contract where only the four Obers (in the German deck — Queens in this implementation) act as trump. In this 1v1 simulator you and the bot each receive ten cards; queens dominate within their suits for a similar effect.\n\nFollow the led suit if you can. If you cannot, any card may be played, but only led-suit cards can win the trick. The highest card of the led suit wins — ace high, then king, queen, jack, ten through two. Queen rank is naturally high (12), giving the queens their 'Geier' dominance within each suit.\n\nWin if you take five or more of the ten tricks. Geier is the defensive cousin of Wenz: holding multiple queens gives a structural advantage, but the rest of your hand still matters. The bot plays a measured defense. Click any legal card; the bot responds immediately. Seeds with two or three queens plus a side ace typically convert reliably; thinner hands struggle.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed),
  reducer,
  isTerminal,
  component: GeierGame,
};
