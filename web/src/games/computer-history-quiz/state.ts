import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ComputerHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface ComputerHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ComputerHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is credited as the first programmer?", choices: ["Babbage", "Ada Lovelace", "Turing", "Hopper"], correct: 1 },
  { question: "What did Charles Babbage design but never finish?", choices: ["Telegraph", "Difference Engine", "Telephone", "Radio"], correct: 1 },
  { question: "Who proposed the universal computing machine?", choices: ["Babbage", "Turing", "von Neumann", "Hopper"], correct: 1 },
  { question: "What was ENIAC?", choices: ["A telegraph", "An early electronic computer", "A radio system", "A satellite"], correct: 1 },
  { question: "Where did Alan Turing work in WWII?", choices: ["MIT", "Bletchley Park", "Bell Labs", "Princeton"], correct: 1 },
  { question: "Who invented the World Wide Web?", choices: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Linus Torvalds"], correct: 2 },
  { question: "Who founded Microsoft with Paul Allen?", choices: ["Steve Jobs", "Bill Gates", "Larry Page", "Mark Zuckerberg"], correct: 1 },
  { question: "Who founded Apple with Steve Wozniak?", choices: ["Bill Gates", "Steve Jobs", "Larry Ellison", "Tim Cook"], correct: 1 },
  { question: "When was the first Apple Macintosh released?", choices: ["1976", "1984", "1990", "1995"], correct: 1 },
  { question: "What does CPU stand for?", choices: ["Central Power Unit", "Central Processing Unit", "Computer Power Unit", "Core Process Unit"], correct: 1 },
  { question: "Who developed COBOL and the term 'debug'?", choices: ["Hopper", "Backus", "Dijkstra", "Knuth"], correct: 0 },
  { question: "Who invented the transistor?", choices: ["Bardeen, Brattain, Shockley", "Edison", "Tesla", "Marconi"], correct: 0 },
  { question: "What was the first computer mouse used with?", choices: ["Apple Lisa", "Xerox Alto", "IBM PC", "Macintosh"], correct: 1 },
  { question: "What does GUI stand for?", choices: ["General User Interface", "Graphical User Interface", "Global Universal Interface", "Game User Interface"], correct: 1 },
  { question: "What was the IBM PC released year?", choices: ["1971", "1975", "1981", "1984"], correct: 2 },
  { question: "Who founded Google?", choices: ["Page and Brin", "Gates and Allen", "Jobs and Wozniak", "Zuckerberg and Saverin"], correct: 0 },
  { question: "What was the name of the first commercial laser printer?", choices: ["Xerox 9700", "HP LaserJet", "Canon LBP", "IBM 3800"], correct: 0 },
  { question: "When was the first email sent?", choices: ["1965", "1971", "1980", "1990"], correct: 1 },
  { question: "What was the first programming language?", choices: ["FORTRAN", "COBOL", "BASIC", "C"], correct: 0 },
  { question: "Who created Linux?", choices: ["Stallman", "Gates", "Torvalds", "Ritchie"], correct: 2 },
  { question: "What was Apple's first home computer called?", choices: ["Apple I", "Macintosh", "Lisa", "iMac"], correct: 0 },
  { question: "What replaced vacuum tubes in computers?", choices: ["Transistors", "Capacitors", "Resistors", "Batteries"], correct: 0 },
  { question: "Who designed the von Neumann architecture?", choices: ["John von Neumann", "Turing", "Babbage", "Atanasoff"], correct: 0 },
  { question: "When did the personal computer revolution start (approx)?", choices: ["1960s", "Late 1970s", "1990s", "2000s"], correct: 1 },
  { question: "What was Compaq?", choices: ["A company that made IBM-compatible PCs", "An OS", "A database", "A printer"], correct: 0 },
  { question: "What is Moore's Law?", choices: ["Battery doubles", "Transistor count doubles ~2 years", "Storage halves", "Speed slows"], correct: 1 },
  { question: "Who invented the C programming language?", choices: ["Ritchie", "Stroustrup", "Knuth", "Hoare"], correct: 0 },
  { question: "What was Xerox PARC famous for?", choices: ["Mainframes", "GUI/networking innovations", "Microchips", "Hard drives"], correct: 1 },
  { question: "What was the first widely-used spreadsheet?", choices: ["VisiCalc", "Excel", "Lotus 1-2-3", "Multiplan"], correct: 0 },
  { question: "What did Konrad Zuse build?", choices: ["First photocopier", "Z3 (early computer)", "First chip", "First mouse"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ComputerHistoryQuizSettings): ComputerHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ComputerHistoryQuizState, action: ComputerHistoryQuizAction): ComputerHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ComputerHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
