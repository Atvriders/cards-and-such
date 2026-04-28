import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClueMiniState, ClueMiniAction, ClueMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClueMiniGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const clueMiniPlugin: GamePlugin<ClueMiniState, ClueMiniAction, typeof settings> = {
  id: "clue-mini",
  title: "Clue Mystery Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on the classic Clue / Cluedo murder-mystery board game.`,
  howToPlay: `Clue Mystery Quiz tests your knowledge of Anthony E. Pratt's 1949 murder-mystery classic Clue (Cluedo outside the US). Three secret cards — one suspect, one weapon, one room — comprise the murder. Players use suggestions and refutations to deduce them.

Across 10 multiple-choice questions you'll cover: standard suspect / weapon / room counts, the suggestion-and-refutation mechanic, why "marking off" cards systematically wins games, why room-restriction is essential to suggestion mechanics, and what an accusation costs if wrong.

Each correct answer earns 100 points (1000 max).

Tips: track every refutation publicly visible — even if you don't see which card was shown, the fact that someone could refute eliminates one of the three suggested elements. Make accusations only when you're certain (a wrong accusation eliminates you from winning). Use the secret passages aggressively to access distant rooms.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClueMiniSettings),
  reducer,
  isTerminal,
  component: ClueMiniGame,
};
