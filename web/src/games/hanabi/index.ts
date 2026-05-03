import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { HanabiState, HanabiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanabiGame } from "./Game.js";

const settings = {} as const;

export const hanabiPlugin: GamePlugin<HanabiState, HanabiAction, typeof settings> = {
  id: "hanabi",
  title: "Hanabi",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative fireworks card game. Work with bots to build perfect sequences of 1-2-3-4-5 in each color.",
  howToPlay: `Hanabi is a cooperative card game where you and three bot teammates build firework sequences in five colors (red, yellow, green, blue, white). Each color must be played in order: 1, 2, 3, 4, 5. The team wins by completing all five fireworks for a perfect score of 25.

The twist: you cannot see your own hand! In this version your cards are shown reversed at the top (showing only what clues have revealed), while the full cards appear below for reference. Each turn you may: Play a card from your hand — valid if it advances a color sequence; Discard a card to regain a clue token (only when below 8 tokens); Give a clue to a bot teammate, spending one token, telling them "these are [color]" or "these are [number]" — touching all matching cards.

You start with 8 clue tokens and 3 lives. Misplaying a card costs one life. Three misplays ends the game. Bots play automatically and will use clues you have given them. Bots also give you color or number clues when they see a card in your hand you can safely play.

Scoring: each completed firework contributes 1-5 points per card played in sequence. Maximum 25. Perfect play is rare — aim for 20+.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: HanabiState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-hanabi-primary"]', pulses: 3 };
  },
  component: HanabiGame,
};
