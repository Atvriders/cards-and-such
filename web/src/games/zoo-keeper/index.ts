import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ZooState, ZooAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZooKeeper } from "./Game.js";

export const zooKeeperPlugin = {
  id: "zoo-keeper",
  title: "Zoo Keeper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Feed and clean 5 animals across 30 days. Keep everyone happy to attract visitors!",
  howToPlay: `Zoo Keeper puts you in charge of five animals — a Lion, Penguin, Giraffe, Elephant, and Monkey — over 30 days. Your goal is to keep all five as happy as possible while earning revenue from visitors.

Each day, every animal automatically gets hungrier and dirtier. Hunger and dirt reduce happiness over time, so you must stay on top of maintenance. Watch the Hunger and Dirt bars for each animal: red means critical, orange means attention needed, green means fine.

You have three actions available each day. Feed an animal to reduce its hunger by 40 points and boost its happiness. Clean a habitat to reduce dirt by 50 points and improve the animal's mood. The bigger the need (high hunger or dirt), the bigger the happiness boost from your action. You can take as many actions as you want before ending the day.

Once you have cared for your animals, click "Open to Visitors" to collect ticket revenue based on your average animal happiness. High happiness means more visitors at $2 per head. Then click "End Day" to advance time.

Random events occur occasionally — a hungry lion, or a crowd favorite — so watch the event banner each morning. Keep all five meters in the green zone simultaneously for the best score. Your final score is the average happiness of all five animals at the end of day 30.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: ZooState, action: ZooAction) => ZooState,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".zoo-btn", pulses: 3 }; },
  component: ZooKeeper,
} as unknown as GamePlugin;
