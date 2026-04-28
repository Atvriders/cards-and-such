import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CareersState, CareersAction, CareersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CareersMiniGame } from "./Game.js";

const settings = {
  path: { kind: "enum" as const, label: "Career Path", options: ["business", "sports", "hollywood"] as const, default: "business" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const careersMiniPlugin: GamePlugin<CareersState, CareersAction, typeof settings> = {
  id: "careers-mini",
  title: "Careers Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick a career — Business, Sports, or Hollywood — and chase your personal success formula.",
  howToPlay: `Careers Mini is a single-player career race inspired by the classic 1955 Parker Brothers board game. You pick one of three life paths and try to hit your personal "success formula" of Money, Fame, and Happiness goals before the path runs out.

How to play:
1. Choose your path in settings: Business, Sports, or Hollywood. Each has a 20-square career track and its own goal totals.
2. On every turn press Roll Dice to advance 1-6 squares along the track. You start with $50 cash, 0 fame, and 50 happiness.
3. Each square you land on is a flavored career event — Office, Big Game, Award Show, Sabbatical, etc. — that adjusts your money, fame, and happiness.
4. Press Next to take another turn. Stay strategic about resting (happy but no cash) versus grinding (cash but burnt out).

The game ends when you hit ALL three goals (a clean win), reach the final square, or finish 18 turns. Final score awards 100 bonus points per goal met, plus weighted totals. Aim for over 400 to feel like a real success.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CareersSettings),
  reducer,
  isTerminal,
  component: CareersMiniGame,
};
