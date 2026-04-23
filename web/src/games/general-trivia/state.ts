import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type TriviaCategory = "mixed" | "history" | "science" | "geography" | "arts" | "sports";

export interface TriviaSettings {
  questions: "10" | "20" | "50";
  category: TriviaCategory;
}

export interface TriviaQuestion {
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  category: Exclude<TriviaCategory, "mixed">;
}

export interface TriviaState {
  settings: TriviaSettings;
  questions: TriviaQuestion[];
  currentIndex: number;
  selected: number | null;
  submitted: boolean;
  timeLeft: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type TriviaAction =
  | { type: "select"; choice: number }
  | { type: "submit" }
  | { type: "next" }
  | { type: "tick" };

const ALL_QUESTIONS: TriviaQuestion[] = [
  // History
  { question: "In what year did World War II end?", choices: ["1943", "1944", "1945", "1946"], correct: 2, category: "history" },
  { question: "Who was the first President of the United States?", choices: ["John Adams", "Thomas Jefferson", "Benjamin Franklin", "George Washington"], correct: 3, category: "history" },
  { question: "The Great Wall of China was primarily built during which dynasty?", choices: ["Han", "Tang", "Ming", "Qing"], correct: 2, category: "history" },
  { question: "Which country did Napoleon Bonaparte come from?", choices: ["France", "Italy", "Corsica", "Spain"], correct: 2, category: "history" },
  { question: "In what year did the Berlin Wall fall?", choices: ["1987", "1988", "1989", "1991"], correct: 2, category: "history" },
  { question: "The ancient city of Rome was said to be built on how many hills?", choices: ["5", "6", "7", "8"], correct: 2, category: "history" },
  { question: "Which civilization built the pyramids at Giza?", choices: ["Roman", "Greek", "Egyptian", "Mesopotamian"], correct: 2, category: "history" },
  { question: "Who led the Cuban Revolution?", choices: ["Che Guevara", "Fidel Castro", "Raul Castro", "Camilo Cienfuegos"], correct: 1, category: "history" },
  { question: "The Magna Carta was signed in which century?", choices: ["11th", "12th", "13th", "14th"], correct: 2, category: "history" },
  { question: "Which empire was ruled by Genghis Khan?", choices: ["Ottoman", "Mongol", "Roman", "Persian"], correct: 1, category: "history" },
  { question: "The Renaissance began in which country?", choices: ["France", "Spain", "Germany", "Italy"], correct: 3, category: "history" },
  { question: "Who discovered America in 1492?", choices: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "John Cabot"], correct: 2, category: "history" },
  { question: "The French Revolution began in which year?", choices: ["1776", "1783", "1789", "1799"], correct: 2, category: "history" },
  { question: "Ancient Greek democracy was founded in which city-state?", choices: ["Sparta", "Corinth", "Thebes", "Athens"], correct: 3, category: "history" },
  { question: "Which US President abolished slavery?", choices: ["Ulysses Grant", "Abraham Lincoln", "Andrew Johnson", "James Buchanan"], correct: 1, category: "history" },

  // Science
  { question: "What is the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Ag"], correct: 2, category: "science" },
  { question: "How many bones are in the adult human body?", choices: ["196", "206", "216", "226"], correct: 1, category: "science" },
  { question: "What planet is closest to the Sun?", choices: ["Venus", "Earth", "Mars", "Mercury"], correct: 3, category: "science" },
  { question: "What is the speed of light (approximately) in km/s?", choices: ["200,000", "300,000", "400,000", "500,000"], correct: 1, category: "science" },
  { question: "DNA stands for what?", choices: ["Deoxyribonucleic Acid", "Deoxyribose Nucleic Acid", "Dinucleotide Acid", "Dyadic Nucleic Amplifier"], correct: 0, category: "science" },
  { question: "The periodic table element with atomic number 1 is?", choices: ["Helium", "Lithium", "Hydrogen", "Carbon"], correct: 2, category: "science" },
  { question: "What is the powerhouse of the cell?", choices: ["Nucleus", "Ribosome", "Golgi apparatus", "Mitochondria"], correct: 3, category: "science" },
  { question: "Which gas makes up most of Earth's atmosphere?", choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2, category: "science" },
  { question: "How many planets are in our solar system?", choices: ["7", "8", "9", "10"], correct: 1, category: "science" },
  { question: "Albert Einstein's famous equation relates mass and what?", choices: ["Time", "Force", "Energy", "Momentum"], correct: 2, category: "science" },
  { question: "What is the boiling point of water in Celsius at sea level?", choices: ["90", "95", "100", "105"], correct: 2, category: "science" },
  { question: "Which organ produces insulin?", choices: ["Liver", "Kidney", "Pancreas", "Spleen"], correct: 2, category: "science" },
  { question: "Light from the Sun takes approximately how long to reach Earth?", choices: ["4 minutes", "8 minutes", "15 minutes", "30 minutes"], correct: 1, category: "science" },
  { question: "The theory of evolution was published by?", choices: ["Isaac Newton", "Louis Pasteur", "Charles Darwin", "Gregor Mendel"], correct: 2, category: "science" },
  { question: "What is H2O commonly known as?", choices: ["Salt", "Water", "Hydrogen peroxide", "Ammonia"], correct: 1, category: "science" },

  // Geography
  { question: "What is the capital of Australia?", choices: ["Sydney", "Melbourne", "Brisbane", "Canberra"], correct: 3, category: "geography" },
  { question: "Which is the longest river in the world?", choices: ["Amazon", "Yangtze", "Mississippi", "Nile"], correct: 3, category: "geography" },
  { question: "Mount Everest is located in which mountain range?", choices: ["Andes", "Alps", "Himalayas", "Rockies"], correct: 2, category: "geography" },
  { question: "What is the capital of Canada?", choices: ["Toronto", "Vancouver", "Montreal", "Ottawa"], correct: 3, category: "geography" },
  { question: "Which continent is the Sahara Desert located on?", choices: ["Asia", "South America", "Australia", "Africa"], correct: 3, category: "geography" },
  { question: "The Amazon River flows primarily through which country?", choices: ["Colombia", "Peru", "Brazil", "Venezuela"], correct: 2, category: "geography" },
  { question: "Which country has the most natural lakes?", choices: ["USA", "Russia", "Finland", "Canada"], correct: 3, category: "geography" },
  { question: "What is the smallest country in the world by area?", choices: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2, category: "geography" },
  { question: "The Strait of Gibraltar connects the Atlantic Ocean to which sea?", choices: ["Red Sea", "Black Sea", "Caspian Sea", "Mediterranean Sea"], correct: 3, category: "geography" },
  { question: "Which country has the longest coastline?", choices: ["Russia", "Australia", "Norway", "Canada"], correct: 3, category: "geography" },
  { question: "What is the capital of Japan?", choices: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"], correct: 2, category: "geography" },
  { question: "Which ocean is the largest?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "geography" },
  { question: "The Great Barrier Reef is located off the coast of which country?", choices: ["New Zealand", "Australia", "Philippines", "Indonesia"], correct: 1, category: "geography" },
  { question: "What is the tallest mountain in Africa?", choices: ["Mount Kenya", "Mount Kilimanjaro", "Atlas Mountain", "Drakensberg"], correct: 1, category: "geography" },
  { question: "Lake Baikal, the world's deepest lake, is located in?", choices: ["Kazakhstan", "Mongolia", "China", "Russia"], correct: 3, category: "geography" },

  // Arts
  { question: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Botticelli"], correct: 2, category: "arts" },
  { question: "Which composer wrote the 'Moonlight Sonata'?", choices: ["Mozart", "Bach", "Chopin", "Beethoven"], correct: 3, category: "arts" },
  { question: "Who wrote 'Romeo and Juliet'?", choices: ["Christopher Marlowe", "Ben Jonson", "John Milton", "William Shakespeare"], correct: 3, category: "arts" },
  { question: "The Sistine Chapel ceiling was painted by?", choices: ["da Vinci", "Botticelli", "Michelangelo", "Raphael"], correct: 2, category: "arts" },
  { question: "Which author wrote 'Don Quixote'?", choices: ["Lope de Vega", "Miguel de Cervantes", "Federico García Lorca", "Antonio Machado"], correct: 1, category: "arts" },
  { question: "'The Starry Night' was painted by?", choices: ["Paul Gauguin", "Claude Monet", "Paul Cézanne", "Vincent van Gogh"], correct: 3, category: "arts" },
  { question: "The opera 'La Traviata' was composed by?", choices: ["Puccini", "Rossini", "Mozart", "Verdi"], correct: 3, category: "arts" },
  { question: "Who wrote '1984'?", choices: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "H.G. Wells"], correct: 2, category: "arts" },
  { question: "The ballerina painting series is by which artist?", choices: ["Renoir", "Monet", "Degas", "Toulouse-Lautrec"], correct: 2, category: "arts" },
  { question: "Which composer wrote 'The Four Seasons'?", choices: ["Handel", "Vivaldi", "Bach", "Telemann"], correct: 1, category: "arts" },
  { question: "Who wrote 'Pride and Prejudice'?", choices: ["Charlotte Brontë", "Emily Brontë", "Mary Shelley", "Jane Austen"], correct: 3, category: "arts" },
  { question: "'The Scream' was painted by?", choices: ["Gustav Klimt", "Ernst Kirchner", "Edvard Munch", "Emil Nolde"], correct: 2, category: "arts" },
  { question: "Which ancient Greek philosopher wrote 'The Republic'?", choices: ["Aristotle", "Socrates", "Plato", "Epicurus"], correct: 2, category: "arts" },
  { question: "Who composed 'Symphony No. 5 in C minor'?", choices: ["Brahms", "Schumann", "Beethoven", "Schubert"], correct: 2, category: "arts" },
  { question: "The novel 'Moby Dick' was written by?", choices: ["Mark Twain", "Herman Melville", "Nathaniel Hawthorne", "Edgar Allan Poe"], correct: 1, category: "arts" },

  // Sports
  { question: "How many players are on a standard basketball team on the court?", choices: ["4", "5", "6", "7"], correct: 1, category: "sports" },
  { question: "In which sport is the Wimbledon tournament held?", choices: ["Badminton", "Squash", "Table Tennis", "Tennis"], correct: 3, category: "sports" },
  { question: "How many rings are on the Olympic flag?", choices: ["4", "5", "6", "7"], correct: 1, category: "sports" },
  { question: "The FIFA World Cup is held every how many years?", choices: ["2", "3", "4", "5"], correct: 2, category: "sports" },
  { question: "In baseball, how many strikes make an out?", choices: ["2", "3", "4", "5"], correct: 1, category: "sports" },
  { question: "How long is a standard marathon race?", choices: ["26.0 miles", "26.2 miles", "26.4 miles", "27 miles"], correct: 1, category: "sports" },
  { question: "In soccer, how many players are on each team including the goalkeeper?", choices: ["10", "11", "12", "13"], correct: 1, category: "sports" },
  { question: "Which country has won the most FIFA World Cups?", choices: ["Germany", "Argentina", "Italy", "Brazil"], correct: 3, category: "sports" },
  { question: "How many holes are in a standard round of golf?", choices: ["9", "15", "18", "21"], correct: 2, category: "sports" },
  { question: "Which sport uses a puck?", choices: ["Lacrosse", "Field Hockey", "Ice Hockey", "Polo"], correct: 2, category: "sports" },
  { question: "What is the maximum score in a single frame of bowling?", choices: ["10", "20", "30", "300"], correct: 2, category: "sports" },
  { question: "In tennis, what does 'love' mean?", choices: ["Win", "Zero", "Tie", "Advantage"], correct: 1, category: "sports" },
  { question: "The Tour de France is a race for which sport?", choices: ["Running", "Rowing", "Cycling", "Triathlon"], correct: 2, category: "sports" },
  { question: "What sport features a pommel horse?", choices: ["Athletics", "Swimming", "Gymnastics", "Equestrian"], correct: 2, category: "sports" },
  { question: "How many points is a touchdown worth in American football?", choices: ["3", "5", "6", "7"], correct: 2, category: "sports" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: TriviaSettings): TriviaState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const cat = settings.category;

  let pool = cat === "mixed" ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.category === cat);
  pool = shuffle(pool, rng);
  const questions = pool.slice(0, Math.min(count, pool.length));

  // Shuffle each question's choices and remap correct index
  const shuffledQuestions = questions.map(q => {
    const indexed = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffle(indexed, rng);
    const newCorrect = shuffled.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return {
      ...q,
      choices: shuffled.map(x => x.c) as [string, string, string, string],
      correct: newCorrect,
    };
  });

  return {
    settings,
    questions: shuffledQuestions,
    currentIndex: 0,
    selected: null,
    submitted: false,
    timeLeft: 15,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: TriviaState, action: TriviaAction): TriviaState {
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
      return {
        ...state,
        submitted: true,
        score: state.score + points,
        correctCount: state.correctCount + (isCorrect ? 1 : 0),
        phase: "result",
      };
    }

    case "tick": {
      if (state.submitted) return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        // Time out - auto-submit with no answer
        const q = state.questions[state.currentIndex]!;
        return {
          ...state,
          timeLeft: 0,
          submitted: true,
          selected: state.selected,
          score: state.score,
          correctCount: state.correctCount + (state.selected === q.correct ? 1 : 0),
          phase: "result",
        };
      }
      return { ...state, timeLeft: newTime };
    }

    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        selected: null,
        submitted: false,
        timeLeft: 15,
        phase: "playing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TriviaState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
