import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuicideSpadesState, SuicideSpadesAction, SuicideSpadesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuicideSpadesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const suicideSpadesPlugin: GamePlugin<SuicideSpadesState, SuicideSpadesAction, typeof settings> = {
  id: "suicide-spades", title: "Suicide Spades", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spades variant where one partner must bid nil — risky penalties for failed nils.",
  howToPlay: "Suicide Spades is a Spades variant where in each partnership one player is forced to bid nil — to take zero tricks for the entire hand. The non-nil partner picks up all the trick-taking responsibility while the nil bidder must dump high cards onto opponents. In this simplified one-on-one duel, you and the CPU each represent a partnership and play across six rounds of thirteen-card hands with spades trump. You score one hundred points if your nil holds and your partner makes their bid, lose one hundred if the nil is broken, and small partials based on tricks captured. Strategy revolves around shedding dangerous queens and kings safely, preserving low spades to dodge late-round forced wins, and timing your aces to clear the table. Click Play Round to simulate the bidding and play. Aim for at least two clean nil rounds across the six-round match — three or four is excellent.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SuicideSpadesSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-suicide-spades-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-suicide-spades-next"]', pulses: 3 };
    return null;
  }, component: SuicideSpadesGame,
};
