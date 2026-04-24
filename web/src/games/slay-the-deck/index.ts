import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SlayTheDeckState, SlayTheDeckAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SlayTheDeck } from "./Game.js";

export const slayTheDeckPlugin = {
  id: "slay-the-deck",
  title: "Slay the Deck",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A single-lane deckbuilder — play cards, manage energy, and slay 5 escalating enemies.",
  howToPlay: `Slay the Deck is a compact deckbuilder. You face 5 enemies in sequence: Rat, Goblin, Bandit, Orc, and a fearsome Boss. Each enemy shows its Intent — the damage it will deal when your turn ends.

You start each turn with 3 Energy and draw 5 cards. Play cards by clicking them (you must have enough energy). Strike and Fireball cards deal damage to the enemy. Defend cards add Block, which absorbs the enemy's next attack. Power Up permanently boosts your strength, adding to all future attack damage. Card Draw lets you cycle through your deck for more options.

After playing cards, click End Turn. The enemy attacks for its Intent amount, reduced by your Block. Block resets to zero each turn, so use it proactively. After each enemy dies you recover 10 HP and face the next.

Your 10-card deck reshuffles automatically when the draw pile empties. Build up Strength over multiple turns to overwhelm later enemies. Reach the Boss with high HP and strong buffs to win!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SlayTheDeckState, action: SlayTheDeckAction) => SlayTheDeckState,
  isTerminal,
  component: SlayTheDeck,
} as unknown as GamePlugin;
