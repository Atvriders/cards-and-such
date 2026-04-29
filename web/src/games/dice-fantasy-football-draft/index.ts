import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFantasyFootballDraftState, DiceFantasyFootballDraftStateAction, DiceFantasyFootballDraftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFantasyFootballDraftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFantasyFootballDraftPlugin: GamePlugin<DiceFantasyFootballDraftState, DiceFantasyFootballDraftStateAction, typeof settings> = {
  id: "dice-fantasy-football-draft", title: "Dice Fantasy Football Draft", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Card-draft fantasy football sim; weekly stat rolls.",
  howToPlay: "Dice Fantasy Football Draft models the fantasy football experience — drafting NFL players with cards and accumulating points based on real weekly stats. A typical fantasy football season runs 13 to 17 weeks; 100 points per week is dominant performance.\n\nThis dice-only sim treats each round as one fantasy week. Each round, you Roll three dice. Outcomes: triple (boom week, +20 your fantasy points), sum >= 14 (solid week +10 fantasy points), sum <= 6 (bust week, opp +10), otherwise average (+5 fantasy points).\n\nGame ends at 100 your points or 13 rounds. Final score formula: 80 + (1 × your fantasy points) - (1 × opponent points) + (5 × rounds remaining if you finish early). Fantasy is driven by variance — a single boom week can carry an otherwise mediocre roster, and the dice respect that volatility. Average runs 110 to 160. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceFantasyFootballDraftSettings),
  reducer, isTerminal, component: DiceFantasyFootballDraftGame,
};
