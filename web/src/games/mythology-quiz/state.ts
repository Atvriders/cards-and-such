import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
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
  { question: "In Greek mythology, who is the king of the gods?", choices: ["Poseidon", "Hades", "Apollo", "Zeus"], correct: 3 },
  { question: "The Roman equivalent of the Greek god Ares is?", choices: ["Jupiter", "Mars", "Mercury", "Saturn"], correct: 1 },
  { question: "Who is the Norse god of thunder?", choices: ["Odin", "Loki", "Freyr", "Thor"], correct: 3 },
  { question: "In Greek mythology, who flew too close to the sun?", choices: ["Daedalus", "Icarus", "Perseus", "Heracles"], correct: 1 },
  { question: "Medusa was killed by which Greek hero?", choices: ["Theseus", "Achilles", "Heracles", "Perseus"], correct: 3 },
  { question: "In Norse mythology, what is the world tree called?", choices: ["Midgard", "Asgard", "Yggdrasil", "Valhalla"], correct: 2 },
  { question: "The Minotaur was slain by?", choices: ["Perseus", "Achilles", "Theseus", "Heracles"], correct: 2 },
  { question: "In Egyptian mythology, who is the god of the dead?", choices: ["Ra", "Horus", "Set", "Osiris"], correct: 3 },
  { question: "Prometheus was punished by Zeus for stealing what?", choices: ["Gold", "Ambrosia", "Lightning bolts", "Fire"], correct: 3 },
  { question: "Which goddess is associated with wisdom in Greek mythology?", choices: ["Aphrodite", "Hera", "Artemis", "Athena"], correct: 3 },
  { question: "In Roman mythology, Janus is the god of?", choices: ["War", "Love", "Beginnings and doorways", "Harvest"], correct: 2 },
  { question: "Hercules had to complete how many labors?", choices: ["10", "11", "12", "13"], correct: 2 },
  { question: "The Trojan hero Achilles was vulnerable only at his?", choices: ["Knee", "Wrist", "Elbow", "Heel"], correct: 3 },
  { question: "In Hindu mythology, Vishnu is the god of?", choices: ["Creation", "Preservation", "Destruction", "Knowledge"], correct: 1 },
  { question: "The Egyptian god Ra is associated with?", choices: ["The Moon", "The River Nile", "The Sun", "The Wind"], correct: 2 },
  { question: "In Greek mythology, the underworld river of forgetfulness is called?", choices: ["Styx", "Acheron", "Lethe", "Phlegethon"], correct: 2 },
  { question: "Loki is from which mythology?", choices: ["Greek", "Roman", "Norse", "Celtic"], correct: 2 },
  { question: "The Sphinx in Greek mythology asks travelers a riddle. Who answered it?", choices: ["Heracles", "Oedipus", "Theseus", "Odysseus"], correct: 1 },
  { question: "In Arthurian legend, what is the name of King Arthur's sword?", choices: ["Durendal", "Excalibur", "Curtana", "Claíomh Solais"], correct: 1 },
  { question: "Pandora's box, when opened, released all evils except?", choices: ["Disease", "Death", "Hope", "Hate"], correct: 2 },
  { question: "In Norse mythology, Odin sacrificed his eye for?", choices: ["Power", "Wisdom", "Immortality", "Victory"], correct: 1 },
  { question: "The Amazons in Greek myth were a tribe of warrior?", choices: ["Men", "Women", "Giants", "Centaurs"], correct: 1 },
  { question: "In Japanese mythology, Amaterasu is the goddess of?", choices: ["The Sea", "The Moon", "The Sun", "The Wind"], correct: 2 },
  { question: "Which Greek god is the messenger of the gods?", choices: ["Apollo", "Hermes", "Ares", "Dionysus"], correct: 1 },
  { question: "In Mesopotamian mythology, the epic of Gilgamesh is from?", choices: ["Egypt", "Persia", "Sumer", "Babylon"], correct: 2 },
  { question: "The Hydra was a monster with how many heads (originally)?", choices: ["5", "7", "9", "12"], correct: 2 },
  { question: "In Chinese mythology, the Jade Emperor rules?", choices: ["The underworld", "The heavens", "The ocean", "The earth"], correct: 1 },
  { question: "Cerberus, the three-headed dog, guarded the entrance to?", choices: ["Mount Olympus", "The Underworld", "The Sea", "The Labyrinth"], correct: 1 },
  { question: "In Aztec mythology, Quetzalcoatl is the?", choices: ["God of rain", "Feathered serpent deity", "God of war", "Sun god"], correct: 1 },
  { question: "Aphrodite is the Greek goddess of?", choices: ["Wisdom", "War", "Love and beauty", "Harvest"], correct: 2 },
  { question: "The Cyclops Polyphemus was blinded by?", choices: ["Achilles", "Ajax", "Heracles", "Odysseus"], correct: 3 },
  { question: "In Celtic mythology, the Tuatha De Danann are from?", choices: ["Scotland", "Wales", "Ireland", "Britain"], correct: 2 },
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
