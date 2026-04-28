import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarvelChampionsCoopState, MarvelChampionsCoopAction, MarvelChampionsCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MarvelChampionsCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const marvelChampionsCoopPlugin: GamePlugin<MarvelChampionsCoopState, MarvelChampionsCoopAction, typeof settings> = {
  id: "marvel-champions-coop",
  title: "Marvel Champions Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative superhero showdown — heroes pool power against the villain.",
  howToPlay: "Marvel Champions Co-op tributes Fantasy Flight's hit hero-vs-villain LCG. Across ten rounds, you play a Marvel hero alongside an AI hero ally; both characters roll dice each round and combine their results into a shared team score. Reach 70 to defeat the villain and earn a 50-point bonus.\n\nPress Play Round each turn. Two dice resolve and the sum joins your shared score. Press Next Round to continue, Finish on round 10.\n\nThe actual Marvel Champions has hero-villain decks, schemes, encounter sets, and the elegant alter-ego/hero flip mechanic. This compact homage strips away the deckbuilding to celebrate one thing: cooperative scoring. You and your AI hero rise or fall together, just as Captain America and Spider-Man would in the comics.\n\nLet your imagination cast the heroes. Maybe you're Black Panther teamed with Captain Marvel, or Spider-Woman with Hulk. The rolls don't care — they just demand teamwork.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MarvelChampionsCoopSettings),
  reducer, isTerminal, component: MarvelChampionsCoopGame,
};
