import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComposersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComposersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
export interface ComposersQuizSettings { questions: "10" | "20" | "30"; }

const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who composed the Fifth Symphony starting with four famous notes?", choices: ["Brahms", "Mozart", "Beethoven", "Haydn"], correct: 2 },
  { question: "The Four Seasons is a set of violin concertos by?", choices: ["Bach", "Handel", "Vivaldi", "Telemann"], correct: 2 },
  { question: "Which composer went deaf but continued to compose?", choices: ["Schubert", "Beethoven", "Schumann", "Smetana"], correct: 1 },
  { question: "The Messiah oratorio was composed by?", choices: ["Bach", "Handel", "Haydn", "Purcell"], correct: 1 },
  { question: "Swan Lake and The Nutcracker were composed by?", choices: ["Prokofiev", "Stravinsky", "Tchaikovsky", "Rimsky-Korsakov"], correct: 2 },
  { question: "Wolfgang Amadeus Mozart was from which country?", choices: ["Germany", "Austria", "Hungary", "Czech Republic"], correct: 1 },
  { question: "The Rite of Spring caused a riot at its 1913 premiere. Its composer was?", choices: ["Debussy", "Ravel", "Stravinsky", "Bartók"], correct: 2 },
  { question: "Which composer wrote the opera The Magic Flute?", choices: ["Haydn", "Gluck", "Mozart", "Salieri"], correct: 2 },
  { question: "Clair de lune is a famous piano piece by?", choices: ["Ravel", "Debussy", "Fauré", "Saint-Saëns"], correct: 1 },
  { question: "The opera La Traviata was composed by?", choices: ["Puccini", "Donizetti", "Verdi", "Bellini"], correct: 2 },
  { question: "Who composed the Brandenburg Concertos?", choices: ["Handel", "Vivaldi", "Bach", "Scarlatti"], correct: 2 },
  { question: "Chopin was known primarily as a composer for which instrument?", choices: ["Violin", "Cello", "Piano", "Harpsichord"], correct: 2 },
  { question: "The Unfinished Symphony (No. 8) was composed by?", choices: ["Brahms", "Schubert", "Schumann", "Mendelssohn"], correct: 1 },
  { question: "Which composer wrote the opera Carmen?", choices: ["Gounod", "Massenet", "Bizet", "Saint-Saëns"], correct: 2 },
  { question: "Moonlight Sonata was composed by?", choices: ["Mozart", "Haydn", "Beethoven", "Schubert"], correct: 2 },
  { question: "Which Russian composer wrote Pictures at an Exhibition?", choices: ["Tchaikovsky", "Rimsky-Korsakov", "Mussorgsky", "Borodin"], correct: 2 },
  { question: "The opera Madama Butterfly was composed by?", choices: ["Verdi", "Puccini", "Mascagni", "Leoncavallo"], correct: 1 },
  { question: "Bolero, an orchestral piece that builds continuously, was composed by?", choices: ["Debussy", "Fauré", "Saint-Saëns", "Ravel"], correct: 3 },
  { question: "Which composer was known as 'the father of the symphony'?", choices: ["Mozart", "Haydn", "Bach", "Beethoven"], correct: 1 },
  { question: "The Goldberg Variations were composed by?", choices: ["Handel", "Bach", "Telemann", "Buxtehude"], correct: 1 },
  { question: "Which Norwegian composer wrote Peer Gynt?", choices: ["Sibelius", "Nielsen", "Grieg", "Stenhammar"], correct: 2 },
  { question: "The opera Rigoletto was composed by?", choices: ["Donizetti", "Bellini", "Verdi", "Puccini"], correct: 2 },
  { question: "Which American composer wrote Rhapsody in Blue?", choices: ["Aaron Copland", "George Gershwin", "Leonard Bernstein", "Samuel Barber"], correct: 1 },
  { question: "Symphony No. 9 'From the New World' was composed by?", choices: ["Brahms", "Bruckner", "Dvořák", "Mahler"], correct: 2 },
  { question: "Which composer is associated with the 'Romantic' period and nocturnes?", choices: ["Liszt", "Chopin", "Schumann", "Weber"], correct: 1 },
  { question: "The opera The Barber of Seville was composed by?", choices: ["Mozart", "Rossini", "Donizetti", "Bellini"], correct: 1 },
  { question: "Who composed Finlandia, a patriotic tone poem?", choices: ["Grieg", "Nielsen", "Sibelius", "Alfvén"], correct: 2 },
  { question: "The piano suite Children's Corner was composed by?", choices: ["Ravel", "Debussy", "Fauré", "Poulenc"], correct: 1 },
  { question: "Which composer was a child prodigy who began performing at age 3?", choices: ["Beethoven", "Chopin", "Mozart", "Liszt"], correct: 2 },
  { question: "The opera Turandot was left unfinished at the death of which composer?", choices: ["Verdi", "Leoncavallo", "Puccini", "Mascagni"], correct: 2 },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function initialState(seed: number, settings: ComposersQuizSettings): ComposersQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  let pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: shuffled.map(x => x.c) as [string, string, string, string], correct: newCorrect };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}

export function reducer(state: ComposersQuizState, action: ComposersQuizAction): ComposersQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const isCorrect = state.selected === q.correct;
      const points = isCorrect ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + points, correctCount: state.correctCount + (isCorrect ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      return newTime <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: newTime };
    }
    case "next": {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: nextIndex, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}

export function isTerminal(state: ComposersQuizState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
