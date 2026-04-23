import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CharadesCategory = "mixed" | "animals" | "movies" | "activities";

export interface CharadesSettings {
  duration: "60" | "120" | "180";
  category: CharadesCategory;
}

const PROMPTS: Record<Exclude<CharadesCategory, "mixed">, string[]> = {
  animals: [
    "Elephant", "Penguin", "Giraffe", "Kangaroo", "Dolphin", "Octopus", "Flamingo", "Cheetah",
    "Polar Bear", "Gorilla", "Peacock", "Jellyfish", "Crocodile", "Toucan", "Chameleon",
    "Platypus", "Manta Ray", "Porcupine", "Armadillo", "Sloth", "Walrus", "Orangutan",
    "Lemur", "Narwhal", "Komodo Dragon", "Tarantula", "Firefly", "Hummingbird", "Anaconda",
    "Seahorse", "Otter", "Pangolin", "Axolotl", "Capybara", "Falcon", "Meerkat", "Ibis",
    "Bald Eagle", "Blue Whale", "Snow Leopard", "Red Panda", "Flying Squirrel", "Hermit Crab",
    "Sea Turtle", "Mantis Shrimp", "Hammerhead Shark", "Electric Eel", "Flying Fish",
  ],
  movies: [
    "Titanic", "Jurassic Park", "The Lion King", "Forrest Gump", "The Matrix", "Inception",
    "Avengers", "Home Alone", "Toy Story", "Frozen", "The Godfather", "Jaws", "Rocky",
    "Star Wars", "Back to the Future", "The Wizard of Oz", "Ghostbusters", "Indiana Jones",
    "Grease", "E.T.", "Shrek", "Finding Nemo", "The Dark Knight", "Gladiator", "Avatar",
    "Interstellar", "The Shawshank Redemption", "Pulp Fiction", "The Silence of the Lambs",
    "Schindler's List", "Goodfellas", "Fight Club", "The Truman Show", "Cast Away",
    "Pirates of the Caribbean", "The Hunger Games", "Harry Potter", "Lord of the Rings",
    "Moana", "Coco", "Ratatouille", "Up", "WALL-E", "The Incredibles", "Big Hero 6",
    "Zootopia", "Monsters Inc", "Brave", "Tangled", "Mulan",
  ],
  activities: [
    "Swimming", "Rock Climbing", "Cooking Pasta", "Playing Guitar", "Painting a Masterpiece",
    "Surfing", "Skydiving", "Juggling", "Knitting", "Photography", "Gardening", "Yoga",
    "Ice Skating", "Ballet Dancing", "Woodworking", "Pottery", "Beekeeping", "Kayaking",
    "Archery", "Fencing", "Bouldering", "Scuba Diving", "Paragliding", "Bird Watching",
    "Stargazing", "Bread Baking", "Cheese Making", "Wine Tasting", "Sandcastle Building",
    "Origami", "Calligraphy", "Leather Working", "Soap Making", "Candle Making",
    "Mushroom Foraging", "Fly Fishing", "Horseback Riding", "Roller Skating",
    "Skateboarding", "Snowboarding", "Sledding", "Kite Flying", "Dog Training",
    "Mime Performance", "Ventriloquism", "Magic Tricks", "Stand-Up Comedy", "Improv Acting",
    "Lip Reading", "Sign Language",
  ],
};

const ALL_PROMPTS: string[] = [
  ...PROMPTS.animals,
  ...PROMPTS.movies,
  ...PROMPTS.activities,
];

export interface CharadesState {
  settings: CharadesSettings;
  prompts: string[];
  currentIndex: number;
  completedCount: number;
  skippedCount: number;
  timeLeft: number;
  phase: "playing" | "done";
}

export type CharadesAction =
  | { type: "complete" }
  | { type: "skip" }
  | { type: "tick" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: CharadesSettings): CharadesState {
  const rng = mulberry32(seed);
  const duration = parseInt(settings.duration, 10);
  const pool = settings.category === "mixed" ? ALL_PROMPTS : PROMPTS[settings.category];
  const shuffled = shuffle(pool, rng);

  return {
    settings,
    prompts: shuffled,
    currentIndex: 0,
    completedCount: 0,
    skippedCount: 0,
    timeLeft: duration,
    phase: "playing",
  };
}

export function reducer(state: CharadesState, action: CharadesAction): CharadesState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "complete": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.prompts.length) {
        return { ...state, phase: "done", completedCount: state.completedCount + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        completedCount: state.completedCount + 1,
      };
    }

    case "skip": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.prompts.length) {
        return { ...state, phase: "done", skippedCount: state.skippedCount + 1 };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        skippedCount: state.skippedCount + 1,
      };
    }

    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "done" };
      }
      return { ...state, timeLeft: newTime };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CharadesState): { score: number } | null {
  if (state.phase === "done") return { score: state.completedCount };
  return null;
}
