import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CodenamesFullState, CodenamesFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const CodenamesFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.CodenamesFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {} as const;

export const codenamesFullPlugin: GamePlugin<CodenamesFullState, CodenamesFullAction, typeof settings> = {
  id: "codenames-full",
  title: "Codenames",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Word-association deduction: the spymaster gives one-word clues; you guess which agents belong to your team.",
  howToPlay: `Codenames is a word-association deduction game played on a 5×5 grid of 25 random words drawn from a 400-word vocabulary.

Hidden behind the grid is a key card that secretly assigns each word a type:
- 9 RED agents
- 8 BLUE agents
- 7 BYSTANDERS (innocent civilians)
- 1 ASSASSIN

RED always goes first. The CPU plays the role of spymaster for BOTH teams — it can see the full key card and gives each team's operative a one-word clue plus a number. The clue word relates (thematically) to that number of unrevealed words belonging to the team's color.

You play the RED operative. On your turn, click the words you believe match your spymaster's clue. You may make up to clue-count + 1 guesses; click "End Guessing" to voluntarily stop and pass the turn to BLUE.

Each guess reveals the tile's true color:
- A RED tile (your team) → keep guessing (one guess used).
- A BLUE tile (opponent) → turn ends, blue gets that point.
- A BYSTANDER (tan tile) → turn ends, no one scores.
- The ASSASSIN (black tile) → you lose the game instantly.

On BLUE's turn, the CPU controls the BLUE operative as well; it picks tiles whose words plausibly match the spymaster's clue category.

Win: be the team that reveals all of its agents first. RED wins → you score 100. BLUE wins or RED hits the assassin → you score 0.

Tips:
- Read the clue carefully — the CPU spymaster picks clues based on word categories (animals, weapons, body parts, jobs, etc.).
- Don't be greedy. If you've already gotten the clue's expected count, consider passing rather than risking the bonus guess.
- The assassin is the single black tile — if your clue covers a word you'd never think of, it could be the trap.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s) => {
    if (isTerminal(s) !== null) return null;
    if (s.turn !== "red") return null;
    return { selector: '[data-testid="hint-target-codenames-full-tile"]', pulses: 3 };
  },
  component: CodenamesFullGame,
};
