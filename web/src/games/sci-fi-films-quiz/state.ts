import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SciFiFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface SciFiFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SciFiFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Star Wars: A New Hope' director?", choices: ["George Lucas", "Steven Spielberg", "Irvin Kershner", "Richard Marquand"], correct: 0 },
  { question: "Year 'Star Wars' (A New Hope) released?", choices: ["1975", "1977", "1979", "1981"], correct: 1 },
  { question: "Luke Skywalker's lightsaber color in 'Return of the Jedi'?", choices: ["Blue", "Green", "Red", "Purple"], correct: 1 },
  { question: "Yoda's species?", choices: ["Yoda's race (unknown)", "Wookiee", "Jawa", "Ewok"], correct: 0 },
  { question: "Death Star is destroyed by?", choices: ["Han Solo", "Luke Skywalker", "Princess Leia", "Lando Calrissian"], correct: 1 },
  { question: "'Blade Runner' (1982) director?", choices: ["Ridley Scott", "James Cameron", "Steven Spielberg", "Stanley Kubrick"], correct: 0 },
  { question: "'Blade Runner' is based on a Philip K. Dick story called?", choices: ["Do Androids Dream of Electric Sheep?", "Ubik", "The Man in the High Castle", "A Scanner Darkly"], correct: 0 },
  { question: "Replicants are?", choices: ["Aliens", "Bioengineered humans", "Robots", "Clones"], correct: 1 },
  { question: "'Alien' (1979) director?", choices: ["Ridley Scott", "James Cameron", "John Carpenter", "Steven Spielberg"], correct: 0 },
  { question: "Ellen Ripley actress?", choices: ["Sigourney Weaver", "Jamie Lee Curtis", "Linda Hamilton", "Sarah Connor"], correct: 0 },
  { question: "'2001: A Space Odyssey' director?", choices: ["Stanley Kubrick", "Arthur C. Clarke", "George Lucas", "Steven Spielberg"], correct: 0 },
  { question: "HAL 9000 is what?", choices: ["Spaceship", "AI computer", "Astronaut", "Alien"], correct: 1 },
  { question: "'The Matrix' (1999) directors?", choices: ["The Wachowskis", "James Cameron", "The Coen brothers", "Ridley Scott"], correct: 0 },
  { question: "Neo's player in 'The Matrix'?", choices: ["Keanu Reeves", "Lawrence Fishburne", "Hugo Weaving", "Joe Pantoliano"], correct: 0 },
  { question: "'Star Trek' captain in original series?", choices: ["Picard", "Kirk", "Janeway", "Sisko"], correct: 1 },
  { question: "'E.T.' director?", choices: ["George Lucas", "Steven Spielberg", "James Cameron", "Robert Zemeckis"], correct: 1 },
  { question: "Year of 'E.T.'?", choices: ["1980", "1982", "1984", "1986"], correct: 1 },
  { question: "'Back to the Future' time machine?", choices: ["DeLorean", "Mustang", "Camaro", "Phone booth"], correct: 0 },
  { question: "Marty's friend?", choices: ["Doc Brown", "Biff Tannen", "George McFly", "Lorraine"], correct: 0 },
  { question: "'Star Wars' creator?", choices: ["George Lucas", "Gene Roddenberry", "Frank Herbert", "Isaac Asimov"], correct: 0 },
  { question: "'Inception' director?", choices: ["Christopher Nolan", "Denis Villeneuve", "James Cameron", "Ridley Scott"], correct: 0 },
  { question: "Skynet is from which franchise?", choices: ["The Matrix", "Terminator", "Blade Runner", "Alien"], correct: 1 },
  { question: "'The Terminator' (1984) director?", choices: ["James Cameron", "Ridley Scott", "John Carpenter", "Paul Verhoeven"], correct: 0 },
  { question: "Arnold's catchphrase?", choices: ["I'll be back", "Hasta la vista", "Both", "Get to the chopper"], correct: 2 },
  { question: "'Interstellar' director?", choices: ["Christopher Nolan", "Denis Villeneuve", "Alfonso Cuarón", "Ridley Scott"], correct: 0 },
  { question: "'Dune' (2021) director?", choices: ["Denis Villeneuve", "David Lynch", "Christopher Nolan", "Ridley Scott"], correct: 0 },
  { question: "'The Empire Strikes Back' director?", choices: ["George Lucas", "Irvin Kershner", "Richard Marquand", "J.J. Abrams"], correct: 1 },
  { question: "'Star Trek: The Next Generation' captain?", choices: ["Kirk", "Picard", "Janeway", "Sisko"], correct: 1 },
  { question: "Mandalorian's child companion's nickname?", choices: ["Grogu / Baby Yoda", "Yaddle", "Yoda Jr.", "Mini-Yoda"], correct: 0 },
  { question: "'Arrival' (2016) director?", choices: ["Denis Villeneuve", "Christopher Nolan", "James Cameron", "Steven Spielberg"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SciFiFilmsQuizSettings): SciFiFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SciFiFilmsQuizState, action: SciFiFilmsQuizAction): SciFiFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SciFiFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
