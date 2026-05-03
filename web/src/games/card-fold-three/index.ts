import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardFoldThreeState, CardFoldThreeAction, CardFoldThreeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardFoldThree } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardFoldThreePlugin: GamePlugin<CardFoldThreeState, CardFoldThreeAction, typeof settings> = {
  id: "card-fold-three", title: "Card Fold Three", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "See 3 face-up cards, then choose to fold (score the lowest rank) or stand (score the highest rank).",
  howToPlay: `Card Fold Three shows you three face-up cards each round, then gives you a strategic choice: Fold or Stand.

Fold scores you points equal to the lowest card's rank (2 through Ace = 2 through 14). Stand scores you the highest card's rank. Three high cards make standing an easy call — but a hand like 3, 4, 14 makes it tricky. Fold gives you 5 points guaranteed; Stand gives you 16 but requires confidence.

Over 10 or 20 rounds, small consistent gains from folding bad hands and standing on good ones add up. The aim is to maximize your total by reading each hand and choosing wisely.

Cards are dealt sequentially from a shuffled 52-card deck. Use Settings to choose your round count and chase your best score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardFoldThreeSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-card-fold-three-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-fold-three-stand"]', pulses: 3 };
  }, component: CardFoldThree,
};
