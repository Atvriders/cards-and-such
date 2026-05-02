import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuropeanBjState, EuropeanBjAction, EuropeanBjSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EuropeanBjGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const europeanBjPlugin: GamePlugin<EuropeanBjState, EuropeanBjAction, typeof settings> = {
  id: "european-bj", title: "European Blackjack", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "European Blackjack — no hole card, dealer stands on soft 17.",
  howToPlay: "European Blackjack — no hole card, dealer stands on soft 17. Hit to draw, Stand to stop. Bust on 22+ = lose. Doubles down on first two cards. Stand on 17+. Blackjack pays 1.5:1.",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as EuropeanBjSettings),
  hint: (state) => {
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-european-bj-next"]', pulses: 3 };
    if (state.phase !== "play") return null;
    const total = state.yourTotal;
    if (total < 12) return { selector: '[data-testid="hint-target-european-bj-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-european-bj-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-european-bj-hit"]', pulses: 3 };
  },
  reducer, isTerminal, component: EuropeanBjGame,
};
