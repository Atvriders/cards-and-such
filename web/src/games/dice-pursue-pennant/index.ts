import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePursuePennantState, DicePursuePennantStateAction, DicePursuePennantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePursuePennantGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dicePursuePennantPlugin: GamePlugin<DicePursuePennantState, DicePursuePennantStateAction, typeof settings> = {
  id: "dice-pursue-pennant", title: "Dice Pursue Pennant", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Park effects baseball sim; historical sets.",
  howToPlay: "Dice Pursue Pennant models the Pursue the Pennant baseball simulation, an advanced statistically-driven sim notable for incorporating park effects (some stadiums favor hitters, others pitchers) and historical season sets reaching back to 1901. Coors Field's thin air boosts home runs; Citi Field's deep fences crush them.\n\nThis dice-only sim treats your home park as standard but the dice probability mimics neutral-park outcomes. Each round (an at-bat), you Roll three dice. Outcomes: triple (home run +3 your team), sum >= 14 (single +1 your team), sum <= 6 (strikeout opp gain +1), otherwise out or foul (no change).\n\nGame ends at 15 your points or 13 rounds. Final score formula: 80 + (4 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). Pursue's depth shines in season replay where year-long stats accumulate. Average runs 110 to 145. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DicePursuePennantSettings),
  reducer, isTerminal, component: DicePursuePennantGame,
};
