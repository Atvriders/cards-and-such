import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeartsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hearts } from "./Hearts.js";

export const heartsSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["random", "heuristic"] as const,
    default: "heuristic" as const,
  },
} as const;

type HeartsSettingsType = SettingsOf<typeof heartsSettings>;

type HeartsAction = { type: "play"; cardId: string };

export const heartsPlugin: GamePlugin<HeartsState, HeartsAction, typeof heartsSettings> = {
  id: "hearts",
  title: "Hearts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-player trick-taking — avoid hearts and the Queen of Spades.",
  howToPlay: `Avoid taking hearts and the Queen of Spades in tricks. The player with the lowest score at the end wins.

Setup: 52 cards are dealt evenly to 4 players (13 each). Before play, each player passes 3 cards to the left (then right, then across, then no passing, cycling each round).

Tricks: The player holding the 2 of Clubs leads the first trick. Each player in turn must follow suit if possible; otherwise any card may be played. The highest card of the led suit wins the trick. Hearts may not be led until a heart has been played (broken) in an earlier trick.

Scoring: Each heart taken = 1 penalty point. Queen of Spades = 13 penalty points. Exception — Shooting the Moon: if one player takes ALL 13 hearts and the Queen of Spades, they score 0 and all opponents score 26 instead. The game ends when any player reaches 100 points; lowest score wins.

Controls: Click any legal card in your hand to play it. You play as the bottom player; the three bots are controlled by the difficulty setting (random or heuristic). Your score is 100 minus your final penalty total.

Tips: Pass your highest hearts and the Queen of Spades early. Watch who is collecting hearts — someone may be trying to Shoot the Moon.`,
  settings: heartsSettings,
  initialState: (seed: number, settings: HeartsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-hearts-action"]', pulses: 3 }; },
  component: Hearts,
};
