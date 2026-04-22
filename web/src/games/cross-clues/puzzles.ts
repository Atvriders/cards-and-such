export interface CrossCluesPuzzle {
  rowCategories: [string, string, string];
  colCategories: [string, string, string];
  /** answers[row][col] — the word that belongs to both categories */
  answers: [[string, string, string], [string, string, string], [string, string, string]];
  difficulty: "easy" | "medium" | "hard";
}

export const PUZZLES: CrossCluesPuzzle[] = [
  {
    rowCategories: ["Types of music", "Colors", "Animals"],
    colCategories: ["Can be light or dark", "Found in the ocean", "Things that can be red"],
    answers: [
      ["jazz",   "wave",   "blues"],
      ["tan",    "coral",  "rose"],
      ["bear",   "seal",   "cardinal"],
    ],
    difficulty: "medium",
  },
  {
    rowCategories: ["Sports", "Foods", "Weather"],
    colCategories: ["Can be fast", "Has seeds", "Played outside"],
    answers: [
      ["track",  "tennis",  "golf"],
      ["berry",  "grape",   "peach"],
      ["wind",   "hail",    "storm"],
    ],
    difficulty: "easy",
  },
  {
    rowCategories: ["Things in a kitchen", "School subjects", "Jobs"],
    colCategories: ["Use your hands", "Involves numbers", "Requires training"],
    answers: [
      ["knife",   "scale",   "oven"],
      ["art",     "math",    "science"],
      ["chef",    "accountant", "doctor"],
    ],
    difficulty: "easy",
  },
  {
    rowCategories: ["Countries", "Cars", "Currencies"],
    colCategories: ["Starts with I", "European", "Has 4 letters"],
    answers: [
      ["italy",  "ireland",  "iran"],
      ["isuzu",  "fiat",     "audi"],
      ["yen",    "euro",     "peso"],
    ],
    difficulty: "hard",
  },
  {
    rowCategories: ["Planets", "Fruits", "Metals"],
    colCategories: ["Round", "Can be yellow", "Named after mythology"],
    answers: [
      ["earth",    "saturn",    "mars"],
      ["orange",   "banana",    "plum"],
      ["gold",     "bronze",    "mercury"],
    ],
    difficulty: "medium",
  },
  {
    rowCategories: ["Dances", "Games", "Instruments"],
    colCategories: ["Has 4 letters", "Played with hands", "From Latin America"],
    answers: [
      ["jive",  "tango",  "salsa"],
      ["golf",  "polo",   "chess"],
      ["drum",  "harp",   "bongo"],
    ],
    difficulty: "medium",
  },
  {
    rowCategories: ["Tree types", "Dog breeds", "Card games"],
    colCategories: ["Can be great", "Often black", "Native to America"],
    answers: [
      ["oak",    "pine",     "maple"],
      ["dane",   "lab",      "husky"],
      ["poker",  "snap",     "war"],
    ],
    difficulty: "easy",
  },
  {
    rowCategories: ["Flowers", "Seas", "Gems"],
    colCategories: ["Can be red", "Mediterranean", "Precious"],
    answers: [
      ["rose",    "carnation", "ruby"],
      ["adriatic","aegean",    "coral"],
      ["garnet",  "jade",      "diamond"],
    ],
    difficulty: "hard",
  },
  {
    rowCategories: ["Birds", "Languages", "Mountains"],
    colCategories: ["In Europe", "Can be golden", "Very high"],
    answers: [
      ["finch",   "eagle",    "crane"],
      ["german",  "latin",    "greek"],
      ["alps",    "andes",    "everest"],
    ],
    difficulty: "hard",
  },
  {
    rowCategories: ["Toys", "Emotions", "Seasons"],
    colCategories: ["Can be bright", "Felt strongly", "Short"],
    answers: [
      ["top",     "kite",   "ball"],
      ["joy",     "rage",   "fear"],
      ["fall",    "spring", "winter"],
    ],
    difficulty: "easy",
  },
];
