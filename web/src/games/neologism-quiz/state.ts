import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NeologismQuizSettings { questions: "8" | "10" | "12"; }
export interface NeologismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NeologismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who coined ROBOT in 1920?",
    "choices": [
      "Karel Capek",
      "Isaac Asimov",
      "H.G. Wells",
      "Mary Shelley"
    ],
    "correct": 0
  },
  {
    "question": "Who coined CYBERSPACE?",
    "choices": [
      "William Gibson",
      "Tim Berners-Lee",
      "Vint Cerf",
      "Alan Turing"
    ],
    "correct": 0
  },
  {
    "question": "Who coined NERD (1950)?",
    "choices": [
      "Dr. Seuss",
      "Mark Twain",
      "J.D. Salinger",
      "Stephen King"
    ],
    "correct": 0
  },
  {
    "question": "Who coined SERENDIPITY?",
    "choices": [
      "Horace Walpole",
      "Samuel Johnson",
      "Jane Austen",
      "Charles Dickens"
    ],
    "correct": 0
  },
  {
    "question": "Who coined CHORTLE?",
    "choices": [
      "Lewis Carroll",
      "Edward Lear",
      "Roald Dahl",
      "Tolkien"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GRINCH?",
    "choices": [
      "Dr. Seuss",
      "Roald Dahl",
      "C.S. Lewis",
      "L. Frank Baum"
    ],
    "correct": 0
  },
  {
    "question": "Who coined YAHOO (the brutes)?",
    "choices": [
      "Jonathan Swift",
      "Daniel Defoe",
      "Voltaire",
      "Henry Fielding"
    ],
    "correct": 0
  },
  {
    "question": "Who coined UTOPIA?",
    "choices": [
      "Thomas More",
      "Plato",
      "Francis Bacon",
      "Karl Marx"
    ],
    "correct": 0
  },
  {
    "question": "Who coined PANDEMONIUM?",
    "choices": [
      "John Milton",
      "Dante",
      "Chaucer",
      "Shakespeare"
    ],
    "correct": 0
  },
  {
    "question": "Who coined MEME?",
    "choices": [
      "Richard Dawkins",
      "Carl Sagan",
      "Stephen Jay Gould",
      "E.O. Wilson"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GENOCIDE?",
    "choices": [
      "Raphael Lemkin",
      "Hannah Arendt",
      "Winston Churchill",
      "FDR"
    ],
    "correct": 0
  },
  {
    "question": "Who coined COLD WAR?",
    "choices": [
      "George Orwell",
      "Walter Lippmann",
      "Churchill",
      "Truman"
    ],
    "correct": 0
  },
  {
    "question": "Who coined MULTIVERSE (1895)?",
    "choices": [
      "William James",
      "H.G. Wells",
      "Hugh Everett",
      "Carl Jung"
    ],
    "correct": 0
  },
  {
    "question": "Who coined OK (1839)?",
    "choices": [
      "Charles Gordon Greene",
      "Andrew Jackson",
      "Noah Webster",
      "P.T. Barnum"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GAS (chemistry)?",
    "choices": [
      "J.B. van Helmont",
      "Lavoisier",
      "Priestley",
      "Boyle"
    ],
    "correct": 0
  },
  {
    "question": "Who coined SCIENTIST (1834)?",
    "choices": [
      "William Whewell",
      "Charles Darwin",
      "Michael Faraday",
      "John Herschel"
    ],
    "correct": 0
  },
  {
    "question": "Who coined DINOSAUR (1841)?",
    "choices": [
      "Richard Owen",
      "Charles Darwin",
      "Mary Anning",
      "Cuvier"
    ],
    "correct": 0
  },
  {
    "question": "Who coined ASSASSINATION?",
    "choices": [
      "Shakespeare",
      "Marlowe",
      "Milton",
      "Chaucer"
    ],
    "correct": 0
  },
  {
    "question": "Who coined BLURB?",
    "choices": [
      "Gelett Burgess",
      "P.G. Wodehouse",
      "Dorothy Parker",
      "Ogden Nash"
    ],
    "correct": 0
  },
  {
    "question": "Who coined QUARK?",
    "choices": [
      "Murray Gell-Mann",
      "Richard Feynman",
      "Niels Bohr",
      "Schrodinger"
    ],
    "correct": 0
  },
  {
    "question": "Who coined HOBBIT?",
    "choices": [
      "J.R.R. Tolkien",
      "C.S. Lewis",
      "Lewis Carroll",
      "George MacDonald"
    ],
    "correct": 0
  },
  {
    "question": "Who coined CATCH-22?",
    "choices": [
      "Joseph Heller",
      "Kurt Vonnegut",
      "Norman Mailer",
      "Saul Bellow"
    ],
    "correct": 0
  },
  {
    "question": "Who coined BIG BANG?",
    "choices": [
      "Fred Hoyle",
      "Edwin Hubble",
      "Einstein",
      "Lemaitre"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GAYDAR-style WORKAHOLIC (1968)?",
    "choices": [
      "Wayne Oates",
      "Tim Ferriss",
      "Studs Terkel",
      "Peter Drucker"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GERRYMANDER?",
    "choices": [
      "Boston Gazette editors",
      "Daniel Webster",
      "Henry Clay",
      "John Adams"
    ],
    "correct": 0
  },
  {
    "question": "Who coined SOFTWARE (1958)?",
    "choices": [
      "John Tukey",
      "Alan Turing",
      "Grace Hopper",
      "Donald Knuth"
    ],
    "correct": 0
  },
  {
    "question": "Who coined ARTIFICIAL INTELLIGENCE?",
    "choices": [
      "John McCarthy",
      "Marvin Minsky",
      "Alan Turing",
      "Norbert Wiener"
    ],
    "correct": 0
  },
  {
    "question": "Who coined GENERATION X (1991 novel)?",
    "choices": [
      "Douglas Coupland",
      "Bret Easton Ellis",
      "Chuck Palahniuk",
      "David Foster Wallace"
    ],
    "correct": 0
  },
  {
    "question": "Who coined STAGFLATION?",
    "choices": [
      "Iain Macleod",
      "Milton Friedman",
      "Paul Samuelson",
      "John Maynard Keynes"
    ],
    "correct": 0
  },
  {
    "question": "Who coined PARADIGM SHIFT?",
    "choices": [
      "Thomas Kuhn",
      "Karl Popper",
      "Imre Lakatos",
      "Paul Feyerabend"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NeologismQuizSettings): NeologismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NeologismQuizState, action: NeologismQuizAction): NeologismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NeologismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
