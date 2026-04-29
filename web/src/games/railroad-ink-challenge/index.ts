import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkChallengeState, RailroadInkChallengeAction, RailroadInkChallengeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkChallengeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkChallengePlugin: GamePlugin<RailroadInkChallengeState, RailroadInkChallengeAction, typeof settings> = {
  id: "railroad-ink-challenge",
  title: "Railroad Ink Challenge",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Revised Railroad Ink with daily challenges and city tokens.",
  howToPlay: "Railroad Ink Challenge is the revised edition with daily challenges and city tokens. In this adaptation you build a rail network on a 4x4 grid by rolling a single d6 each turn and marking a cell with the rolled value. Click Roll, then click any empty cell to record it; you may also Skip a roll. Each marked cell adds the dice pip value to your score. Strategy: chase row and column completions for bonuses (+5 each) plus a +10 board-complete bonus. Skipping is risky because all 12 rolls are limited resources — even skips count toward the cap. The challenge style emphasises efficient marking: prefer 5s and 6s for high cells, accept 1s and 2s only when they help finish a row or column. After 12 rolls the game finalises. A solid Challenge score is 34-48 points; bonus-chasers reach 65+. Each session is a fresh dice puzzle thanks to seeded random rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkChallengeSettings),
  reducer,
  isTerminal,
  component: RailroadInkChallengeGame,
};
