import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CidersQuizState, CidersQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CidersQuiz } from "./Game.js";

export const cidersQuizSettings = {
  questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof cidersQuizSettings>;

export const cidersQuizPlugin: GamePlugin<CidersQuizState, CidersQuizAction, typeof cidersQuizSettings> = {
  id: "ciders-quiz",
  title: "Ciders Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Explore cider styles, apple varieties, and regional traditions from England to Asturias.",
  howToPlay: `Ciders Quiz dives into the world of fermented apple beverages — from rustic farmhouse scrumpy to refined ice cider. Each question asks about cider styles, production methods, regional traditions, or apple varieties.

Select the correct answer to earn 10 points. Right answers glow green; wrong ones go red with the correct option shown. Press Next to move on.

Questions cover English, French, Spanish, American, and Canadian cider traditions. You will learn about keeving, lees, méthode traditionnelle, perry, and the difference between commercial and craft ciders.

Choose 5, 10, or 15 questions per session to match your interest level.

Tips: Geographic clues are crucial — Normandy means French cider and Calvados; Asturias points to Spanish sidra; Herefordshire to English farmhouse styles. Production clues help too: 'concentrated frozen juice' means ice cider; 'arrested fermentation' means keeving technique. When a question mentions pears instead of apples, the answer is usually perry. Alcohol content clues — 'session' suggests under 4%, high-gravity suggests over 8%. When in doubt, eliminate styles that don't match the described flavor profile.`,
  settings: cidersQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CidersQuiz,
};
