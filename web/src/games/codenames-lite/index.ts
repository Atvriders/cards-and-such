import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CodenamesState, CodenamesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CodenamesLiteGame } from "./Game.js";

const settings = {} as const;

export const codenamesLitePlugin: GamePlugin<CodenamesState, CodenamesAction, typeof settings> = {
  id: "codenames-lite",
  title: "Codenames Lite",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click word tiles matching the spymaster's clue. Avoid the assassin!",
  howToPlay: `Codenames Lite is based on the popular word association game. A 5×5 grid of 25 words is dealt face-up. A bot spymaster knows which 9 words are your "agents," 7 are opponents, 7 are neutral, and 1 is the deadly assassin.

The spymaster gives you a one-word clue and a number — the clue relates to N words on the grid that are your agents. Click words on the grid that you think match the clue. Clicking an agent tile reveals it in blue — good! Clicking a neutral tile ends your turn. Clicking an opponent tile also ends your turn and reveals it in red. Clicking the assassin tile immediately loses the game.

You get N+1 guesses per clue (the bonus allows catching up). Click "End Guessing" to voluntarily pass and get a new clue for the next turn.

Win: reveal all 9 agent words before hitting the assassin. Loss: click the assassin tile.

Score: 100 for winning, 0 for hitting the assassin.

Tips: the spymaster's clue word connects multiple tiles thematically. Think about what the hidden agents have in common. When in doubt, avoid tiles that seem risky and end your guessing early to preserve your chance in future turns.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: CodenamesLiteGame,
};
