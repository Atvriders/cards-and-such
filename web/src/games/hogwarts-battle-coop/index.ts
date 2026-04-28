import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsBattleCoopState, HogwartsBattleCoopAction, HogwartsBattleCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HogwartsBattleCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hogwartsBattleCoopPlugin: GamePlugin<HogwartsBattleCoopState, HogwartsBattleCoopAction, typeof settings> = {
  id: "hogwarts-battle-coop",
  title: "Hogwarts Battle Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative deck-builder homage — students of Hogwarts duel the dark.",
  howToPlay: "Hogwarts Battle Co-op tributes USAopoly's beloved Harry Potter deckbuilder. You and an AI Hogwarts ally face seven famous adventures (here compressed into 10 short rounds). Each round you roll dice that represent influence and attack tokens, pooling totals to defeat villains. Reach 70 team points to win and gain a 50-point bonus.\n\nPress Play Round each turn. Both dice resolve and their sum joins your team score. Press Next Round to continue, Finish on round 10.\n\nThe original Hogwarts Battle features asymmetric heroes (Harry, Ron, Hermione, Neville), sealed expansion boxes for each book, and escalating villain decks. This solo dice adaptation distills the cooperative essence: any victory is shared, any setback hits both players.\n\nImagine your AI ally as your favourite Hogwarts companion. Together, with luck and decent rolls, you'll defeat Voldemort and his Death Eaters in just a couple of minutes.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsBattleCoopSettings),
  reducer, isTerminal, component: HogwartsBattleCoopGame,
};
