import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArtMovementsState, ArtMovementsAction, ArtMovementsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArtMovementsQuiz } from "./Game.js";

const settings = {
  questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const artMovementsQuizPlugin: GamePlugin<ArtMovementsState, ArtMovementsAction, typeof settings> = {
  id: "art-movements-quiz",
  title: "Art Movements Quiz",
  category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of art history's major movements — from Impressionism to Pop Art and beyond.",
  howToPlay: `Art Movements Quiz takes you through the history of visual art from the 17th century Baroque era to the 21st century street art scene. Questions cover the defining features of each movement, their key artists, techniques, and historical context.

You have 15 seconds per question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Answer quickly and accurately to rack up the highest score.

Click your choice, then press Submit. Green highlights the correct answer; red marks any wrong selection. Press Next to move on.

Settings let you choose 10, 20, or 30 questions drawn from a pool of 30 carefully crafted items covering Impressionism, Cubism, Surrealism, Abstract Expressionism, Pop Art, Minimalism, Dadaism, Fauvism, Futurism, Bauhaus, and more.

Whether you are an art student, a museum regular, or simply curious about why those Monet paintings look blurry, this quiz will sharpen your eye for art history!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as ArtMovementsSettings),
  reducer,
  isTerminal,
  component: ArtMovementsQuiz,
};
