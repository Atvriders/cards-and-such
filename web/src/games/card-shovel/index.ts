import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardShovelState, CardShovelAction, CardShovelSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardShovelGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardShovelGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardShovelPlugin: GamePlugin<CardShovelState, CardShovelAction, typeof settings> = {
  id:"card-shovel", title:"Card Shovel", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Shovel each card into the matching suit bucket — fast, fast, fast.",
  howToPlay:`Card Shovel is a 16-card sorting sprint. Each turn shows one card; below it sit four labeled buckets, one per suit (Spades, Hearts, Diamonds, Clubs). Tap the bucket that matches the card's suit to shovel it home, then the next card slides into place.

Each correct placement scores 10 points. Each wrong placement costs 5 points and adds to your error tally — the buckets ignore the misfile, but the penalty stays on your scoreboard. The game ends when all 16 cards have been shovelled, and your final score is your total points (floored at zero).

Strategy is simple: read the suit glyph (or the colour — red for Hearts/Diamonds, black for Spades/Clubs) and tap before you second-guess yourself. The cards are dealt randomly per seed, so the suit distribution varies — sometimes you get a flood of one colour, sometimes a balanced mix.

A clean run earns 160 points. Lose a few cards to misfiles and you'll still post a respectable score, but speed plus accuracy is the path to the leaderboard.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardShovelSettings),
  reducer, isTerminal,
  hint: (state: any) => {
      if (state.phase === "done") return null;
      return { selector: '[data-testid="hint-target-card-shovel-primary"]', pulses: 3 };
    }, component: CardShovelGame,
};
