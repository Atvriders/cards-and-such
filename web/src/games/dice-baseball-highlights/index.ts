import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBaseballHighlightsState, DiceBaseballHighlightsStateAction, DiceBaseballHighlightsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBaseballHighlightsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBaseballHighlightsPlugin: GamePlugin<DiceBaseballHighlightsState, DiceBaseballHighlightsStateAction, typeof settings> = {
  id: "dice-baseball-highlights", title: "Dice Baseball Highlights 2045", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Future card baseball; 20-card decks face off in series.",
  howToPlay: "Dice Baseball Highlights 2045 is a futuristic card-game baseball where 20-card decks represent teams. Each card is a player or robot with a hit, out, or field action. The card-driven mechanics produce three-game and seven-game series outcomes that mimic real baseball's drama.\n\nThis dice-only sim drops the cards but mirrors the scoring patterns. Each round (a half-inning), you Roll three dice. Outcomes: triple (grand slam +4 your team), sum >= 15 (RBI hit +2 your team), sum <= 6 (rally killed, opp +2), otherwise routine (no change).\n\nGame ends at 10 your points or 12 rounds. Final score formula: 80 + (5 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Baseball Highlights games are quick — 30 minute sessions versus Strat's 90 minute games. Average runs 105 to 145. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceBaseballHighlightsSettings),
  reducer, isTerminal, component: DiceBaseballHighlightsGame,
};
