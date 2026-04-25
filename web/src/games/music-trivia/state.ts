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
  { question: "Which band released the album 'Abbey Road' in 1969?", choices: ["The Rolling Stones", "The Who", "The Beatles", "Led Zeppelin"], correct: 2 },
  { question: "Michael Jackson's 'Thriller' was released in which year?", choices: ["1979", "1980", "1982", "1985"], correct: 2 },
  { question: "Who is known as the 'Queen of Soul'?", choices: ["Diana Ross", "Tina Turner", "Aretha Franklin", "Whitney Houston"], correct: 2 },
  { question: "Which band performed 'Bohemian Rhapsody'?", choices: ["Aerosmith", "Queen", "Freddie Mercury Solo", "David Bowie"], correct: 1 },
  { question: "Who wrote the opera 'The Magic Flute'?", choices: ["Beethoven", "Haydn", "Mozart", "Schubert"], correct: 2 },
  { question: "What instrument did Jimi Hendrix play?", choices: ["Bass guitar", "Drums", "Piano", "Electric guitar"], correct: 3 },
  { question: "The song 'Yesterday' was performed by?", choices: ["The Rolling Stones", "The Beatles", "The Kinks", "The Hollies"], correct: 1 },
  { question: "Which artist released 'Purple Rain'?", choices: ["Michael Jackson", "Prince", "David Bowie", "Stevie Wonder"], correct: 1 },
  { question: "Bob Dylan won the Nobel Prize in which category?", choices: ["Peace", "Literature", "Music", "Arts"], correct: 1 },
  { question: "The 'King of Rock and Roll' is?", choices: ["Chuck Berry", "Buddy Holly", "Elvis Presley", "Jerry Lee Lewis"], correct: 2 },
  { question: "Which rapper released 'The Marshall Mathers LP'?", choices: ["Jay-Z", "Eminem", "Snoop Dogg", "Dr. Dre"], correct: 1 },
  { question: "Who composed 'Symphony No. 9 in D minor'?", choices: ["Mozart", "Bach", "Brahms", "Beethoven"], correct: 3 },
  { question: "Which band's members include Mick Jagger and Keith Richards?", choices: ["The Who", "Led Zeppelin", "The Rolling Stones", "The Doors"], correct: 2 },
  { question: "What type of voice is the lowest male singing voice?", choices: ["Tenor", "Baritone", "Bass", "Alto"], correct: 2 },
  { question: "Adele's debut album is titled?", choices: ["21", "19", "25", "30"], correct: 1 },
  { question: "Which country is the home of reggae music?", choices: ["Cuba", "Trinidad and Tobago", "Haiti", "Jamaica"], correct: 3 },
  { question: "Who is the lead singer of U2?", choices: ["The Edge", "Adam Clayton", "Larry Mullen Jr.", "Bono"], correct: 3 },
  { question: "'Like a Rolling Stone' was released by?", choices: ["The Rolling Stones", "Bob Dylan", "Bruce Springsteen", "Tom Petty"], correct: 1 },
  { question: "Which instrument has 88 keys?", choices: ["Harpsichord", "Organ", "Piano", "Accordion"], correct: 2 },
  { question: "Taylor Swift's album 'Folklore' was released in?", choices: ["2019", "2020", "2021", "2022"], correct: 1 },
  { question: "Who sang 'Respect' in 1967?", choices: ["Diana Ross", "Gladys Knight", "Patti LaBelle", "Aretha Franklin"], correct: 3 },
  { question: "Which genre originated in New Orleans in the early 20th century?", choices: ["Blues", "Jazz", "Soul", "Gospel"], correct: 1 },
  { question: "The band Nirvana was from which US state?", choices: ["California", "Oregon", "Washington", "Idaho"], correct: 2 },
  { question: "Who wrote 'Imagine'?", choices: ["Paul McCartney", "George Harrison", "Ringo Starr", "John Lennon"], correct: 3 },
  { question: "Which singer is known as 'The Material Girl'?", choices: ["Janet Jackson", "Cyndi Lauper", "Madonna", "Whitney Houston"], correct: 2 },
  { question: "The 'Moonwalk' dance move is associated with?", choices: ["Prince", "James Brown", "Michael Jackson", "Usher"], correct: 2 },
  { question: "Which classical composer went deaf later in life?", choices: ["Mozart", "Bach", "Beethoven", "Chopin"], correct: 2 },
  { question: "What is the standard number of strings on a classical guitar?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "Who is often called the 'Godfather of Soul'?", choices: ["Ray Charles", "Marvin Gaye", "Otis Redding", "James Brown"], correct: 3 },
  { question: "Beyonce's formation world tour was in support of which album?", choices: ["B'Day", "Lemonade", "Dangerously in Love", "4"], correct: 1 },
  { question: "Which duo sang 'I Got You Babe' in 1965?", choices: ["Marvin Gaye & Tammi Terrell", "Sonny & Cher", "Simon & Garfunkel", "Everly Brothers"], correct: 1 },
  { question: "The 'woodwind' family of instruments does NOT include?", choices: ["Flute", "Clarinet", "Saxophone", "Trumpet"], correct: 3 },
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
