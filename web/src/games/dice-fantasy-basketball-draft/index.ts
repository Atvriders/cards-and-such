import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftStateAction, DiceFantasyBasketballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyBasketballDraftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFantasyBasketballDraftPlugin: GamePlugin<DiceFantasyBasketballDraftState, DiceFantasyBasketballDraftStateAction, typeof settings> = {
  id: "dice-fantasy-basketball-draft", title: "Dice Fantasy Basketball Draft", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "NBA fantasy draft sim; weekly box-score scoring.",
  howToPlay: "Dice Fantasy Basketball Draft models a fantasy NBA league. Owners draft NBA cards, manage roster, and weekly stats determine wins. Standard categories include points, rebounds, assists, steals, blocks, three-pointers, and free-throw plus field-goal percentages. The NBA's 82-game season splits into 24 weekly fantasy weeks.\n\nThis dice-only sim treats each round as one fantasy week. Each round, you Roll three dice. Outcomes: triple (8-1 dominant week +10), sum >= 14 (5-4 winning week +6), sum <= 6 (3-6 losing week, opp +6), otherwise tied 4.5-4.5 (+3 each).\n\nGame ends at 70 your points or 14 rounds. Final score formula: 80 + (2 × your points) - (1 × opponent points) + (3 × rounds remaining if you finish early). NBA fantasy rewards punting (giving up entire categories) — an extreme strategy that punishes balanced opponents. Average runs 120 to 175. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceFantasyBasketballDraftSettings),
  reducer, isTerminal, component: DiceFantasyBasketballDraftGame,
};
