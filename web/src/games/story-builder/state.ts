import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface StorySettings {
  rounds: "10" | "20" | "30";
  mode: "word" | "sentence";
}

const STORY_STARTERS: string[] = [
  "Once upon a time, in a city made entirely of cheese,",
  "The last robot on Earth woke up one morning and realized",
  "Nobody believed the old lighthouse keeper when she said",
  "It started as a normal Tuesday until the mayor announced",
  "The treasure map led them to a door in the middle of the ocean,",
  "Everyone in the village had a secret, but the baker's secret",
  "When the time machine arrived, it was three sizes too small",
  "The talking cat knocked over the fishbowl and said,",
  "Deep beneath the library there was a room nobody knew about,",
  "The last person on the moon looked down at Earth and thought,",
  "She opened the mysterious box and found exactly what she feared:",
  "The dragon had not spoken in a thousand years, but today",
  "After the storm, everything on the island had changed except",
  "The wizard forgot the spell halfway through, and that is why",
  "When the animals held their annual meeting, the argument was about",
  "Nobody could explain why all the clocks in town showed different times,",
  "The astronaut returned from space to find her hometown had",
  "At precisely midnight, the painting on the wall started to",
  "The detective opened the case file and immediately regretted it,",
  "An envelope arrived with no stamp, no return address, and",
];

export interface StoryState {
  settings: StorySettings;
  starter: string;
  contributions: string[];
  currentRound: number;
  phase: "playing" | "done";
}

export type StoryAction =
  | { type: "add"; text: string }
  | { type: "finish" };

export function initialState(seed: number, settings: StorySettings): StoryState {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * STORY_STARTERS.length);
  const starter = STORY_STARTERS[idx]!;
  return {
    settings,
    starter,
    contributions: [],
    currentRound: 0,
    phase: "playing",
  };
}

export function reducer(state: StoryState, action: StoryAction): StoryState {
  if (state.phase === "done") return state;
  const maxRounds = parseInt(state.settings.rounds, 10);

  switch (action.type) {
    case "add": {
      const contributions = [...state.contributions, action.text];
      const nextRound = state.currentRound + 1;
      if (nextRound >= maxRounds) {
        return { ...state, contributions, currentRound: nextRound, phase: "done" };
      }
      return { ...state, contributions, currentRound: nextRound };
    }
    case "finish":
      return { ...state, phase: "done" };
    default:
      return state;
  }
}

export function isTerminal(state: StoryState): { score: number } | null {
  if (state.phase === "done") return { score: state.contributions.length };
  return null;
}
