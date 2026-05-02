import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type QuizAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

export interface QuizSettings {
  questions: "10" | "20" | "30";
}

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Greek mythology, who is the king of the gods?", choices: ["Poseidon", "Hades", "Apollo", "Zeus"], correct: 3, explanation: "Zeus rules from Mount Olympus, wielding the thunderbolt forged by the Cyclopes." },
  { question: "The Roman equivalent of the Greek god Ares is?", choices: ["Jupiter", "Mars", "Mercury", "Saturn"], correct: 1, explanation: "Mars was far more revered in Rome than Ares was in Greece — March is named after him." },
  { question: "Who is the Norse god of thunder?", choices: ["Odin", "Loki", "Freyr", "Thor"], correct: 3, explanation: "Thor wields Mjolnir, his magical hammer, and rides a chariot pulled by two goats." },
  { question: "In Greek mythology, who flew too close to the sun?", choices: ["Daedalus", "Icarus", "Perseus", "Heracles"], correct: 1, explanation: "Icarus ignored his father Daedalus's warning, melting his wax wings and plunging into the sea." },
  { question: "Medusa was killed by which Greek hero?", choices: ["Theseus", "Achilles", "Heracles", "Perseus"], correct: 3, explanation: "Perseus used a polished shield to look at Medusa indirectly, then beheaded her with Hermes's sword." },
  { question: "In Norse mythology, what is the world tree called?", choices: ["Midgard", "Asgard", "Yggdrasil", "Valhalla"], correct: 2, explanation: "Yggdrasil connects the nine worlds of Norse cosmology and is tended by the Norns." },
  { question: "The Minotaur was slain by?", choices: ["Perseus", "Achilles", "Theseus", "Heracles"], correct: 2, explanation: "Theseus navigated the Cretan labyrinth using Ariadne's thread and slew the half-bull, half-man beast." },
  { question: "In Egyptian mythology, who is the god of the dead?", choices: ["Ra", "Horus", "Set", "Osiris"], correct: 3, explanation: "Osiris, killed by his brother Set and revived by Isis, judges souls in the afterlife." },
  { question: "Prometheus was punished by Zeus for stealing what?", choices: ["Gold", "Ambrosia", "Lightning bolts", "Fire"], correct: 3, explanation: "Prometheus stole fire for humanity; Zeus chained him to a rock where an eagle ate his liver daily." },
  { question: "Which goddess is associated with wisdom in Greek mythology?", choices: ["Aphrodite", "Hera", "Artemis", "Athena"], correct: 3, explanation: "Athena sprang fully grown from Zeus's head; Athens is named for her." },
  { question: "In Roman mythology, Janus is the god of?", choices: ["War", "Love", "Beginnings and doorways", "Harvest"], correct: 2, explanation: "Janus's two faces look to past and future; January is named after him." },
  { question: "Hercules had to complete how many labors?", choices: ["10", "11", "12", "13"], correct: 2, explanation: "Heracles was set 12 labours by King Eurystheus as penance for killing his family in madness." },
  { question: "The Trojan hero Achilles was vulnerable only at his?", choices: ["Knee", "Wrist", "Elbow", "Heel"], correct: 3, explanation: "Thetis dipped baby Achilles in the Styx but held him by the heel — his only mortal spot." },
  { question: "In Hindu mythology, Vishnu is the god of?", choices: ["Creation", "Preservation", "Destruction", "Knowledge"], correct: 1, explanation: "Vishnu the Preserver maintains cosmic order, descending as avatars like Rama and Krishna when needed." },
  { question: "The Egyptian god Ra is associated with?", choices: ["The Moon", "The River Nile", "The Sun", "The Wind"], correct: 2, explanation: "Ra sails his solar barque across the sky daily and battles Apep through the underworld each night." },
  { question: "In Greek mythology, the underworld river of forgetfulness is called?", choices: ["Styx", "Acheron", "Lethe", "Phlegethon"], correct: 2, explanation: "The dead drank from Lethe to forget their past lives before reincarnation." },
  { question: "Loki is from which mythology?", choices: ["Greek", "Roman", "Norse", "Celtic"], correct: 2, explanation: "Loki is the Norse trickster god, blood-brother to Odin and father of Hel, Fenrir, and Jormungandr." },
  { question: "The Sphinx in Greek mythology asks travelers a riddle. Who answered it?", choices: ["Heracles", "Oedipus", "Theseus", "Odysseus"], correct: 1, explanation: "Oedipus answered 'man' (crawls, walks, then uses a cane) — the Sphinx then killed herself." },
  { question: "In Arthurian legend, what is the name of King Arthur's sword?", choices: ["Durendal", "Excalibur", "Curtana", "Claíomh Solais"], correct: 1, explanation: "Excalibur was given to Arthur by the Lady of the Lake; some say it's the same sword pulled from the stone." },
  { question: "Pandora's box, when opened, released all evils except?", choices: ["Disease", "Death", "Hope", "Hate"], correct: 2, explanation: "Hope alone remained inside Pandora's pithos (jar) when she closed the lid." },
  { question: "In Norse mythology, Odin sacrificed his eye for?", choices: ["Power", "Wisdom", "Immortality", "Victory"], correct: 1, explanation: "Odin gave his eye to Mimir's well in exchange for cosmic wisdom." },
  { question: "The Amazons in Greek myth were a tribe of warrior?", choices: ["Men", "Women", "Giants", "Centaurs"], correct: 1, explanation: "The Amazons were a legendary nation of warrior women, said to live near the Black Sea." },
  { question: "In Japanese mythology, Amaterasu is the goddess of?", choices: ["The Sea", "The Moon", "The Sun", "The Wind"], correct: 2, explanation: "Amaterasu, the Shinto sun goddess, is the mythical ancestor of Japan's imperial family." },
  { question: "Which Greek god is the messenger of the gods?", choices: ["Apollo", "Hermes", "Ares", "Dionysus"], correct: 1, explanation: "Hermes, with his winged sandals and caduceus, escorts souls to Hades and delivers Zeus's messages." },
  { question: "In Mesopotamian mythology, the epic of Gilgamesh is from?", choices: ["Egypt", "Persia", "Sumer", "Babylon"], correct: 2, explanation: "The Epic of Gilgamesh (Sumer/Akkad, ~2100 BC) is the world's oldest surviving great work of literature." },
  { question: "The Hydra was a monster with how many heads (originally)?", choices: ["5", "7", "9", "12"], correct: 2, explanation: "The Lernaean Hydra had nine heads; cut one off and two grew back. Heracles used fire to cauterize the stumps." },
  { question: "In Chinese mythology, the Jade Emperor rules?", choices: ["The underworld", "The heavens", "The ocean", "The earth"], correct: 1, explanation: "The Jade Emperor (Yu Huang) is the supreme ruler of the heavens in Chinese folk religion." },
  { question: "Cerberus, the three-headed dog, guarded the entrance to?", choices: ["Mount Olympus", "The Underworld", "The Sea", "The Labyrinth"], correct: 1, explanation: "Cerberus prevented the dead from leaving Hades and the living from entering — Heracles's 12th labour." },
  { question: "In Aztec mythology, Quetzalcoatl is the?", choices: ["God of rain", "Feathered serpent deity", "God of war", "Sun god"], correct: 1, explanation: "Quetzalcoatl, the feathered serpent, is associated with wind, learning, and the morning star." },
  { question: "Aphrodite is the Greek goddess of?", choices: ["Wisdom", "War", "Love and beauty", "Harvest"], correct: 2, explanation: "Born from sea foam, Aphrodite is the goddess of love, beauty, and desire — Roman Venus." },
  { question: "The Cyclops Polyphemus was blinded by?", choices: ["Achilles", "Ajax", "Heracles", "Odysseus"], correct: 3, explanation: "Odysseus blinded the Cyclops with a sharpened stake, escaping under sheep — earning Poseidon's wrath." },
  { question: "In Celtic mythology, the Tuatha De Danann are from?", choices: ["Scotland", "Wales", "Ireland", "Britain"], correct: 2, explanation: "The Tuatha Dé Danann are the divine race of pre-Christian Ireland, said to dwell now in the sídhe (fairy mounds)." },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: QuizSettings): QuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng);
  pool = pool.slice(0, Math.min(count, pool.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: QuizState, action: QuizAction): QuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": {
      if (state.submitted) return state;
      return { ...state, selected: action.choice };
    }
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const speedBonus = isCorrect ? Math.floor(state.timeLeft * 10) : 0;
      const points = isCorrect ? 100 + speedBonus : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      return { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: QuizState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
