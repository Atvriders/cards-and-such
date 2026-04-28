import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TempelDeductionState, TempelDeductionAction, TempelDeductionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TempelDeductionGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const tempelDeductionPlugin: GamePlugin<TempelDeductionState, TempelDeductionAction, typeof settings> = {
  id: "tempel-deduction",
  title: "Tempel des Schreckens Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Tempel des Schreckens (Don't Mess with Cthulhu) deduction.`,
  howToPlay: `Tempel des Schreckens Strategy Quiz tests your knowledge of the 2014 hidden-role push-your-luck game (also published as Don't Mess with Cthulhu). Adventurers and Guardians race to either find all the treasures or trigger the trap card.

Across 10 multiple-choice questions you'll cover: card distribution (Treasure / Empty / Trap), why the Guardian wants the trap revealed, how the key passes between players, the four-round timer, and standard strategies for both teams.

Each correct answer awards 100 points (1000 max).

Tips: in Tempel des Schreckens, the holder of the key chooses whose card to flip — Adventurers want to flip teammates suspected of holding treasures, Guardians want to deflect attention without obviously stalling. Watch how willingly a player cedes turns. The four-round timer creates strong inferences about how many treasures must remain in each round.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TempelDeductionSettings),
  reducer,
  isTerminal,
  component: TempelDeductionGame,
};
