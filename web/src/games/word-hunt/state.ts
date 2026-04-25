import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Word Hunt: find words hidden in a category list
// Player sees a category and must type words that belong to it
export interface WordHuntCategory {
  name: string;
  words: string[];
  hint: string;
}

export interface WordHuntState {
  category: WordHuntCategory;
  found: string[];
  input: string;
  timeLeft: number;
  score: number;
  lastMessage: string;
  phase: "playing" | "done";
}

export type WordHuntAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "tick" };

const CATEGORIES: WordHuntCategory[] = [
  {
    name: "Colors",
    words: ["RED", "BLUE", "GREEN", "YELLOW", "ORANGE", "PURPLE", "PINK", "BROWN", "BLACK", "WHITE",
            "GRAY", "TEAL", "CYAN", "MAROON", "NAVY", "LIME", "GOLD", "SILVER", "VIOLET", "INDIGO",
            "CORAL", "MAGENTA", "BEIGE", "TAN", "CRIMSON", "SCARLET", "AMBER", "TURQUOISE", "LAVENDER", "OLIVE"],
    hint: "Name any color you can think of!",
  },
  {
    name: "Animals",
    words: ["CAT", "DOG", "LION", "TIGER", "BEAR", "WOLF", "FOX", "DEER", "RABBIT", "HORSE",
            "COW", "PIG", "SHEEP", "GOAT", "MONKEY", "GORILLA", "ELEPHANT", "GIRAFFE", "ZEBRA", "HIPPO",
            "RHINO", "CAMEL", "KANGAROO", "KOALA", "PANDA", "CHEETAH", "JAGUAR", "LEOPARD", "CHIMPANZEE", "PENGUIN",
            "DOLPHIN", "WHALE", "SHARK", "OCTOPUS", "CRAB", "LOBSTER", "TURTLE", "SNAKE", "LIZARD", "FROG",
            "EAGLE", "OWL", "PARROT", "FLAMINGO", "PEACOCK"],
    hint: "Name any animal — wild or domestic!",
  },
  {
    name: "Countries",
    words: ["FRANCE", "GERMANY", "SPAIN", "ITALY", "JAPAN", "CHINA", "INDIA", "BRAZIL", "CANADA", "MEXICO",
            "AUSTRALIA", "RUSSIA", "USA", "EGYPT", "NIGERIA", "KENYA", "ARGENTINA", "CHILE", "PERU", "COLOMBIA",
            "SWEDEN", "NORWAY", "DENMARK", "FINLAND", "NETHERLANDS", "BELGIUM", "PORTUGAL", "GREECE", "TURKEY", "IRAN",
            "IRAQ", "PAKISTAN", "BANGLADESH", "INDONESIA", "THAILAND", "VIETNAM", "PHILIPPINES", "MALAYSIA", "SINGAPORE", "TAIWAN"],
    hint: "Name any country in the world!",
  },
  {
    name: "Fruits",
    words: ["APPLE", "BANANA", "ORANGE", "GRAPE", "MANGO", "PEAR", "PEACH", "PLUM", "CHERRY", "STRAWBERRY",
            "BLUEBERRY", "RASPBERRY", "BLACKBERRY", "PINEAPPLE", "COCONUT", "PAPAYA", "GUAVA", "KIWI", "LEMON", "LIME",
            "WATERMELON", "MELON", "AVOCADO", "FIG", "DATE", "POMEGRANATE", "LYCHEE", "PASSION", "PERSIMMON", "APRICOT"],
    hint: "Name any fruit — tropical or local!",
  },
  {
    name: "Sports",
    words: ["FOOTBALL", "BASKETBALL", "BASEBALL", "TENNIS", "GOLF", "SWIMMING", "RUNNING", "CYCLING", "BOXING", "WRESTLING",
            "SOCCER", "RUGBY", "CRICKET", "HOCKEY", "VOLLEYBALL", "BADMINTON", "PING PONG", "ARCHERY", "FENCING", "ROWING",
            "SAILING", "SURFING", "SKIING", "SNOWBOARD", "SKATEBOARD", "GYMNASTICS", "TRACK", "MARATHON", "TRIATHLON", "DIVING"],
    hint: "Name any sport or athletic event!",
  },
  {
    name: "Musical Instruments",
    words: ["GUITAR", "PIANO", "VIOLIN", "DRUMS", "FLUTE", "TRUMPET", "SAXOPHONE", "CELLO", "HARP", "CLARINET",
            "OBOE", "TROMBONE", "TUBA", "BASS", "BANJO", "UKULELE", "MANDOLIN", "ACCORDION", "HARMONICA", "ORGAN",
            "SITAR", "TABLA", "DIDGERIDOO", "BAGPIPES", "XYLOPHONE", "VIBRAPHONE", "MARIMBA", "VIOLA", "LUTE", "ZITHER"],
    hint: "Name any musical instrument!",
  },
  {
    name: "Vegetables",
    words: ["CARROT", "POTATO", "ONION", "TOMATO", "BROCCOLI", "SPINACH", "LETTUCE", "CUCUMBER", "PEPPER", "CELERY",
            "CABBAGE", "CAULIFLOWER", "CORN", "PEAS", "BEANS", "ASPARAGUS", "ARTICHOKE", "BEETROOT", "RADISH", "TURNIP",
            "PARSNIP", "LEEK", "GARLIC", "GINGER", "ZUCCHINI", "EGGPLANT", "SQUASH", "KALE", "BRUSSELS", "CHARD"],
    hint: "Name any vegetable you might eat!",
  },
  {
    name: "World Capitals",
    words: ["PARIS", "LONDON", "BERLIN", "MADRID", "ROME", "TOKYO", "BEIJING", "DELHI", "BRASILIA", "OTTAWA",
            "CANBERRA", "MOSCOW", "CAIRO", "NAIROBI", "JAKARTA", "BANGKOK", "SEOUL", "ANKARA", "TEHRAN", "BAGHDAD",
            "RIYADH", "ISLAMABAD", "DHAKA", "MANILA", "KUALA LUMPUR", "WASHINGTON", "LIMA", "BOGOTA", "SANTIAGO", "BUENOS AIRES"],
    hint: "Name any capital city of a country!",
  },
  {
    name: "Planets and Space",
    words: ["MERCURY", "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "SUN",
            "MOON", "ASTEROID", "COMET", "NEBULA", "GALAXY", "STAR", "SUPERNOVA", "BLACK HOLE", "QUASAR", "PULSAR",
            "METEOR", "SATELLITE", "ORBIT", "COSMOS", "MILKY WAY", "ANDROMEDA", "TITAN", "EUROPA", "GANYMEDE", "IO"],
    hint: "Name anything found in space!",
  },
  {
    name: "Card Games",
    words: ["POKER", "BRIDGE", "BLACKJACK", "RUMMY", "SOLITAIRE", "SNAP", "WAR", "CRAZY EIGHTS", "GO FISH", "HEARTS",
            "SPADES", "CLUBS", "CANASTA", "CRIBBAGE", "PINOCHLE", "BACCARAT", "EUCHRE", "WHIST", "PIQUET", "GIN",
            "OLD MAID", "MEMORY", "UNO", "SEVENS", "SLAP JACK", "SPEED", "FISH", "KNOCKOUT WHIST", "RAUBER", "MILLE BORNES"],
    hint: "Name any card game!",
  },
  {
    name: "Elements",
    words: ["HYDROGEN", "OXYGEN", "CARBON", "NITROGEN", "IRON", "GOLD", "SILVER", "COPPER", "ZINC", "CALCIUM",
            "SODIUM", "POTASSIUM", "MAGNESIUM", "SULFUR", "CHLORINE", "PHOSPHORUS", "ALUMINUM", "SILICON", "TITANIUM", "PLATINUM",
            "URANIUM", "PLUTONIUM", "HELIUM", "NEON", "ARGON", "KRYPTON", "XENON", "MERCURY", "LEAD", "TIN"],
    hint: "Name any chemical element!",
  },
  {
    name: "Mythical Creatures",
    words: ["DRAGON", "UNICORN", "PHOENIX", "GRIFFIN", "CENTAUR", "MERMAID", "WEREWOLF", "VAMPIRE", "TROLL", "GOBLIN",
            "FAIRY", "ELF", "GNOME", "LEPRECHAUN", "KRAKEN", "BASILISK", "CHIMERA", "SPHINX", "MINOTAUR", "CYCLOPS",
            "MEDUSA", "HYDRA", "PEGASUS", "SIREN", "BANSHEE", "YETI", "BIGFOOT", "CHUPACABRA", "KELPIE", "RUSALKA"],
    hint: "Name any creature from myths and legends!",
  },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number): WordHuntState {
  const rng = mulberry32(seed);
  const cats = shuffle([...CATEGORIES], rng);
  const cat = cats[0]!;
  return {
    category: cat,
    found: [],
    input: "",
    timeLeft: 90,
    score: 0,
    lastMessage: "",
    phase: "playing",
  };
}

export function reducer(state: WordHuntState, action: WordHuntAction): WordHuntState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      return { ...state, input: action.text.toUpperCase().replace(/[^A-Z ]/g, "") };
    }
    case "submit": {
      const word = state.input.trim();
      if (!word) return { ...state, lastMessage: "Type a word!" };
      if (state.found.includes(word)) return { ...state, lastMessage: `Already found "${word}"!`, input: "" };
      if (!state.category.words.includes(word)) return { ...state, lastMessage: `"${word}" is not in this category`, input: "" };
      const pts = Math.max(5, word.length * 5);
      return {
        ...state,
        found: [...state.found, word],
        input: "",
        score: state.score + pts,
        lastMessage: `+${pts}! Great!`,
      };
    }
    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, phase: "done" };
      return { ...state, timeLeft: newTime };
    }
    default:
      return state;
  }
}

export function isTerminal(state: WordHuntState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
