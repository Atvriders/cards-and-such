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
  { question: "Which film won the first Academy Award for Best Picture?", choices: ["Sunrise", "Wings", "The Jazz Singer", "Seventh Heaven"], correct: 1 },
  { question: "Who directed 'Schindler's List'?", choices: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg", "Clint Eastwood"], correct: 2 },
  { question: "What 1994 film features the line 'Life is like a box of chocolates'?", choices: ["Philadelphia", "The Shawshank Redemption", "Pulp Fiction", "Forrest Gump"], correct: 3 },
  { question: "Which actor played Iron Man in the Marvel Cinematic Universe?", choices: ["Chris Evans", "Mark Ruffalo", "Robert Downey Jr.", "Chris Hemsworth"], correct: 2 },
  { question: "The movie 'Titanic' (1997) was directed by?", choices: ["Ridley Scott", "James Cameron", "Michael Bay", "Ron Howard"], correct: 1 },
  { question: "Which studio produced 'The Lion King' (1994)?", choices: ["Pixar", "DreamWorks", "Universal", "Walt Disney"], correct: 3 },
  { question: "'You can't handle the truth!' is a line from which film?", choices: ["A Few Good Men", "The Firm", "Primal Fear", "Philadelphia"], correct: 0 },
  { question: "Which 1999 film features a computer simulation of reality?", choices: ["Dark City", "eXistenZ", "The Matrix", "13th Floor"], correct: 2 },
  { question: "Who played Hannibal Lecter in 'The Silence of the Lambs'?", choices: ["Anthony Hopkins", "Gary Oldman", "Ian McKellen", "Daniel Day-Lewis"], correct: 0 },
  { question: "The highest-grossing film of all time (unadjusted) is?", choices: ["Avengers: Endgame", "Titanic", "Avatar: The Way of Water", "Avatar"], correct: 3 },
  { question: "Which Pixar film features the motto 'To infinity and beyond!'?", choices: ["A Bug's Life", "Finding Nemo", "Monsters, Inc.", "Toy Story"], correct: 3 },
  { question: "Who directed 'Pulp Fiction'?", choices: ["David Fincher", "Quentin Tarantino", "Joel Coen", "Oliver Stone"], correct: 1 },
  { question: "'Here's looking at you, kid' is from which classic film?", choices: ["Casablanca", "Gone with the Wind", "The Maltese Falcon", "Rebecca"], correct: 0 },
  { question: "Which actor has won the most Academy Awards for Best Actor?", choices: ["Jack Nicholson", "Marlon Brando", "Daniel Day-Lewis", "Laurence Olivier"], correct: 2 },
  { question: "The 'Star Wars' franchise was created by?", choices: ["Steven Spielberg", "George Lucas", "Ridley Scott", "Francis Ford Coppola"], correct: 1 },
  { question: "Which film features the DeLorean time machine?", choices: ["Ghostbusters", "Back to the Future", "Total Recall", "Bill & Ted's Excellent Adventure"], correct: 1 },
  { question: "Who directed 'The Godfather'?", choices: ["Martin Scorsese", "Brian De Palma", "Francis Ford Coppola", "Sidney Lumet"], correct: 2 },
  { question: "Which film won Best Picture at the 2020 Oscars?", choices: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"], correct: 2 },
  { question: "Audrey Hepburn won her Oscar for which film?", choices: ["Sabrina", "Roman Holiday", "Breakfast at Tiffany's", "My Fair Lady"], correct: 1 },
  { question: "The iconic shower scene is from which Hitchcock film?", choices: ["Vertigo", "Rear Window", "Psycho", "The Birds"], correct: 2 },
  { question: "Which film popularized the phrase 'I'll be back'?", choices: ["Predator", "Total Recall", "Terminator 2", "The Terminator"], correct: 3 },
  { question: "Harry Potter was played by which actor in the film series?", choices: ["Robert Pattinson", "Rupert Grint", "Tom Felton", "Daniel Radcliffe"], correct: 3 },
  { question: "Which 2010 film features dreams within dreams?", choices: ["Shutter Island", "Memento", "The Prestige", "Inception"], correct: 3 },
  { question: "Who composed the music for 'Jaws'?", choices: ["John Williams", "Ennio Morricone", "Bernard Herrmann", "Jerry Goldsmith"], correct: 0 },
  { question: "What is the name of the sled in 'Citizen Kane'?", choices: ["Daydream", "Rosebloom", "Rosebud", "Snowfall"], correct: 2 },
  { question: "Which actress played Clarice Starling in 'The Silence of the Lambs'?", choices: ["Meryl Streep", "Sigourney Weaver", "Jodie Foster", "Glenn Close"], correct: 2 },
  { question: "'Hakuna Matata' is a song from which Disney film?", choices: ["The Jungle Book", "Aladdin", "Mulan", "The Lion King"], correct: 3 },
  { question: "Which director made '2001: A Space Odyssey'?", choices: ["Ridley Scott", "Steven Spielberg", "Stanley Kubrick", "George Lucas"], correct: 2 },
  { question: "In 'The Dark Knight', who played the Joker?", choices: ["Jack Nicholson", "Jared Leto", "Joaquin Phoenix", "Heath Ledger"], correct: 3 },
  { question: "Which film introduced the character James Bond for the first time?", choices: ["Goldfinger", "Thunderball", "Dr. No", "From Russia with Love"], correct: 2 },
  { question: "Which film is based on the book 'Do Androids Dream of Electric Sheep?'", choices: ["Dark City", "Minority Report", "Blade Runner", "Total Recall"], correct: 2 },
  { question: "Who plays the title role in 'Black Panther' (2018)?", choices: ["Michael B. Jordan", "Chadwick Boseman", "Winston Duke", "Lupita Nyong'o"], correct: 1 },
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
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, submitted: true, phase: "result" };
      }
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
