import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type RollASixState, type RollASixAction } from "./state.js";
import { RollASix } from "./RollASix.js";

export const rollASixSettings = {} as const;

export const rollASixPlugin: GamePlugin<RollASixState, RollASixAction, typeof rollASixSettings> = {
  id: "roll-a-six",
  title: "Roll a 6",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll one die repeatedly. Get 10 sixes in the fewest rolls possible.",
  howToPlay: `Roll a 6 is a pure dice luck game. Your goal is to roll 10 sixes using a single six-sided die, in as few total rolls as possible.

Each time you click Roll Die, one die is cast. If it shows a 6, your six-counter goes up by one and the pip fills in. If it shows any other number, nothing changes — just roll again.

The game ends the moment you collect your 10th six. Your score is calculated as: max(0, 100 minus the number of rolls used). So if you roll exactly 10 times, you get a perfect score of 90. If you need 100 or more rolls, your score is 0 — but you still finish!

Statistically, the expected number of rolls to get 10 sixes is 60 (10 ÷ 1/6 = 60). Breaking 40 rolls is excellent; breaking 30 is exceptional luck.

There is no strategy — every roll is independent and the die is perfectly fair. The fun is in watching the pips fill up and cheering for that next six. Try multiple games to compare your luck across runs.

Tips: track your rolling average over many games. The law of large numbers means your average will approach 60 rolls per game. Anything under 50 is a great result worth celebrating!`,
  settings: rollASixSettings,
  initialState,
  reducer,
  isTerminal,
  component: RollASix,
};
