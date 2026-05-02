import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PineappleOfcCasState, PineappleOfcCasAction, PineappleOfcCasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PineappleOfcCasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: PineappleOfcCasState): HintTarget | null => (state.phase === "see" ? { selector: '[data-testid="hint-target-pineapple-ofc-cas-primary"]', pulses: 3 } : null);
export const pineappleOfcCasPlugin: GamePlugin<PineappleOfcCasState, PineappleOfcCasAction, typeof settings> = {
  id: "pineapple-ofc-cas", title: "Pineapple OFC (Casino)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pineapple Open-Face Chinese Poker against the dealer.",
  howToPlay: "Pineapple Open-Face Chinese Poker (OFC) is a draft-style three-row poker variant: each turn you receive three cards and place two while discarding one. The game ends when each player has thirteen cards arranged in three rows: 5-5-3.\n\nIn this single-player casino adaptation you play against the dealer over eight rounds, each round simulating a single drafted hand of five cards. You may play (compare) or fold. The comparison uses sum-of-rank, aces high.\n\nA win pays fourteen points (with a king bonus of three); a tie pays five; a fold or loss pays zero. Eight rounds are played.\n\nExpected score across eight rounds is forty to sixty. Pineapple's draft tension is approximated by the round-on-round comparison — each round is a fresh draft and a fresh confrontation. Fold weak draws, play strong ones, and watch for kings to net the bonus. Two strong rounds in eight is the path to the upper band.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PineappleOfcCasSettings),
  reducer, isTerminal, hint, component: PineappleOfcCasGame,
};
