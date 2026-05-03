import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { DungeonHeroCardsState, DungeonHeroCardsAction, DungeonHeroCardsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DungeonHeroCardsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.DungeonHeroCardsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dungeonHeroCardsPlugin: GamePlugin<DungeonHeroCardsState, DungeonHeroCardsAction, typeof settings> = {
  id: "dungeon-hero-cards",
  title: "Dungeon Hero: Card Crawl",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; dungeon flip cards drive choices.",
  howToPlay: "Dungeon Hero: Card Crawl is a solo journaling homage to Dungeon Hero, a solo dungeon RPG in which you flip room cards, draw monster cards, and write the brief diary of a delver who may not return.\n\nAcross ten room flips you choose how to enter, what to confront, what to spare, and what to carry out. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Dungeon Hero uses two decks (rooms and monsters), a tracking sheet, and a single hero-token. This solo digital homage compresses the deck-mechanics into prompt-and-roll while preserving the lone-delver tone of choosing whether each step is brave or just inevitable.\n\nNot every door must be opened. But the ones you don't open haunt the diary too.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DungeonHeroCardsSettings),
  reducer, isTerminal, hint: (state: DungeonHeroCardsState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-dungeon-hero-cards-primary"]', pulses: 3 } : null), component: DungeonHeroCardsGame,
};
