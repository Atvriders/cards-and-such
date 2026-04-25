import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArchitectureQuizState, ArchitectureQuizAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArchitectureQuiz } from "./ArchitectureQuiz.js";
export const architectureQuizSettings = { questionCount: { kind: "enum" as const, label: "Questions", options: ["5", "10", "15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof architectureQuizSettings>;
export const architectureQuizPlugin: GamePlugin<ArchitectureQuizState, ArchitectureQuizAction, typeof architectureQuizSettings> = {
  id: "architecture-quiz", title: "Architecture Quiz", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Test your knowledge of famous buildings, architectural styles, and great architects.",
  howToPlay: `Architecture Quiz explores the world's most iconic buildings, architectural movements, and legendary designers. Questions ask about famous structures and their locations, architects and their signature works, and the defining features of different architectural styles. Select the correct answer from four options. Correct answers turn green; incorrect ones turn red while the right answer is revealed. Earn 10 points per correct answer. Choose 5, 10, or 15 questions in settings. Topics include Gothic, Baroque, Neoclassical, Modernist, and Bauhaus styles, plus landmarks like the Colosseum, Sagrada Familia, Eiffel Tower, and the Sydney Opera House. Tips: Match famous architects to their buildings — Gaudi to Sagrada Familia, Utzon to Sydney Opera House, Frank Lloyd Wright to Fallingwater.`,
  settings: architectureQuizSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, component: ArchitectureQuiz,
};
