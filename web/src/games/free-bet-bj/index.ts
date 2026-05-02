import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FreeBetBjState, FreeBetBjAction, FreeBetBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FreeBetBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const freeBetBjPlugin: GamePlugin<FreeBetBjState, FreeBetBjAction, typeof settings> = {
  id: "free-bet-bj", title: "Free Bet Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack where doubles and splits on certain hands are free.",
  howToPlay: "Free Bet Blackjack is a casino variant where the house pays for your double-down on hard nines, tens, and elevens — and pays for splits on most pairs. The trade-off is that any time the dealer busts with exactly 22, all remaining player bets push instead of winning.\n\nEach round you place a one-credit bet, draw two cards, and decide to hit or stand. The dealer shows one upcard, then plays out a standard hand: hit on sixteen, stand on seventeen. Standard blackjack values apply.\n\nTwelve rounds are played. Wins pay twelve points; ties (pushes) pay six points. A bonus of ten points is awarded for any win on a hand with a free-double opportunity (i.e. an opening total of nine, ten, or eleven). A loss pays zero.\n\nExpected score across twelve rounds is around fifty points. Particularly hot runs with several free doubles can push past eighty. The variant trades the chance of a big push-on-22 against frequent free doubles, which on balance favours the player slightly compared to plain blackjack.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FreeBetBjSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-free-bet-bj-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.total;
    if (total < 12) return { selector: '[data-testid="hint-target-free-bet-bj-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-free-bet-bj-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-free-bet-bj-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: FreeBetBjGame,
};
