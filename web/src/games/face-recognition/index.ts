import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FaceRecognitionState, FRAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FaceRecognition } from "./Game.js";

export const faceRecognitionSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Memorize Time",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type FRSettings = SettingsOf<typeof faceRecognitionSettings>;

export const faceRecognitionPlugin: GamePlugin<FaceRecognitionState, FRAction, typeof faceRecognitionSettings> = {
  id: "face-recognition",
  title: "Face Recognition",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Study an emoji face portrait, then pick it from 4 look-alike choices!",
  howToPlay: `Face Recognition challenges your ability to encode and recall visual details — the same cognitive skill used when remembering people you've met. Each round, a unique face is constructed from emoji components: a skin tone, a hair color, eye style, and an accessory.

You have a limited time to memorize the face — 5 seconds on Easy, 3 seconds on Medium, and 2 seconds on Hard. When the face disappears, four similar-looking faces appear as choices. Only one of them is the face you just memorized. Study the choices carefully and click the correct one.

A correct answer scores 10 points. There are 10 rounds per game, for a maximum possible score of 100.

Tips: Instead of trying to memorize the face as a whole, focus on a single distinctive feature. Pick one component that stands out — for example, the hat or the unusual eye color — and anchor your memory to that single detail. If you see a top hat (🎩) on a yellow face, just remember "yellow + top hat." On Medium and Hard, prioritize the most unusual or rare-looking component since that is your best discriminating cue. With practice, you will learn which combinations are rarest and therefore most useful for identification.`,
  settings: faceRecognitionSettings,
  initialState: (seed: number, settings: FRSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FaceRecognition,
};
