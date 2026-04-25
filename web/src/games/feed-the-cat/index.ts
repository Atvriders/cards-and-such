import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FeedTheCatState, FeedAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FeedTheCat } from "./Game.js";

export const feedTheCatPlugin = {
  id: "feed-the-cat",
  title: "Feed the Cat",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap falling food before it hits the ground. Keep your cat's hunger meter full for 30 seconds!",
  howToPlay: `Feed the Cat is a quick-tap arcade game where your hungry feline needs dinner — fast!

Food items fall from the top of the screen: fish, milk, treats, and kibble. Tap or click each item before it hits the ground to feed your cat and earn points. Miss too many and the hunger meter drops!

Different foods give different rewards. Fish restores the most hunger (20 points worth). Treats are worth 20 points but only restore 10 hunger. Kibble and milk fall slower and are easier to catch. Fast-moving treats are high risk, high reward.

The cat's mood tells you how it's feeling: a happy cat means your hunger meter is above 60%, okay means 30–60%, and a sad cat means you're close to losing. If hunger hits zero, the game ends immediately.

You have 30 seconds total. The longer you survive with a full meter, the higher your score. Items spawn faster as the game progresses, so stay sharp and prioritize the food that keeps your cat happiest. Aim for a combo of high-value treats and steady fish catches to maximize your final score!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: FeedTheCatState, action: FeedAction) => FeedTheCatState,
  isTerminal,
  component: FeedTheCat,
} as unknown as GamePlugin;
