import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TarockState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tarock } from "./Tarock.js";

const tarockSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type TarockSettingsType = SettingsOf<typeof tarockSettings>;
type TarockAction = { type: "play"; cardId: string };

export const tarockPlugin: GamePlugin<TarockState, TarockAction, typeof tarockSettings> = {
  id: "tarock",
  title: "Tarock",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Central European trick-taking game with a randomly chosen trump suit.",
  howToPlay: `Tarock is a family of Central European trick-taking card games originating in 15th-century Italy and played widely in Austria, Hungary, and Slovenia. This simplified version uses a standard 52-card deck with 4 players.

At the start of each round a trump suit is randomly determined. All 52 cards are dealt — 8 each to four players, with remaining cards unused.

Rules: You lead the first trick. Players must follow the led suit if possible. If unable to follow suit, they must play trump if they hold any. If unable to do either, they may discard any card. The highest trump wins; if no trump is played, the highest card of the led suit wins.

Scoring: Each trick you win scores 2 points against the bots' combined total. Win the majority of tricks to score positive points for the round.

Strategy: Save high trump for critical tricks. Try to force opponents to use their top trump early by leading your second-highest trump, preserving your best card for when it counts.

Click cards to play. Legal plays are highlighted — you must follow suit or trump if required.`,
  settings: tarockSettings,
  initialState: (seed: number, settings: TarockSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "done") return null;
    if (state.turn !== 0) return null;
    return { selector: '[data-testid="hint-target-tarock-primary"]', pulses: 3 };
  },
  component: Tarock,
};
