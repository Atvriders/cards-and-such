import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpadeCasinoState, SpadeCasinoAction, SpadeCasinoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpadeCasinoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SpadeCasinoState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const spadeCasinoPlugin: GamePlugin<SpadeCasinoState, SpadeCasinoAction, typeof settings> = {
  id: "spade-casino", title: "Spade Casino", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino with bonus for capturing spades: bonus when you draw a spade.",
  howToPlay: "Spade Casino is a Casino variant where capturing spades earns a per-spade bonus. In this mini-version, the bonus is folded into the per-round payout via small score boosts whenever you happen to draw a spade.\n\nEach round, you and the CPU each draw one card. Higher rank wins. Aces high (13), twos low (1). Suit normally irrelevant — except that drawing a spade adds 2 sympathy bonus to whatever scoring you got.\n\nScoring: round win awards 10 points (+2 if your card was a spade). Tie awards 4 sympathy points (+2 if your card was a spade). Loss awards 0 (+2 if your card was a spade). Spades benefit you regardless.\n\nTen rounds total. Expected score: 50-75 points (spades come up about 25% of cards).\n\nThe full Spade Casino includes a 1-point bonus per captured spade plus a 2-point bonus for the player capturing the most spades overall. This mini honors that with a steady spade-bonus per round. A nod to the classic Casino-with-spades that 19th-century American players loved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpadeCasinoSettings),
  reducer, isTerminal, hint, component: SpadeCasinoGame,
};
