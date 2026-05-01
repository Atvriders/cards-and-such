import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Formula1QuizSettings { questions: "10" | "20" | "30"; }
export interface Formula1QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Formula1QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "When did Formula 1 World Championship start?", choices: ["1950", "1955", "1948", "1962"], correct: 0 },
  { question: "Who is the most successful F1 driver by world titles?", choices: ["Lewis Hamilton and Michael Schumacher (7 each)", "Juan Fangio", "Ayrton Senna", "Sebastian Vettel"], correct: 0 },
  { question: "How many F1 titles did Michael Schumacher win?", choices: ["7", "5", "6", "8"], correct: 0 },
  { question: "How many F1 titles has Lewis Hamilton won (through 2024)?", choices: ["7", "6", "8", "5"], correct: 0 },
  { question: "Who broke the all-time wins record (most race victories) overtaking Schumacher?", choices: ["Lewis Hamilton", "Sebastian Vettel", "Fernando Alonso", "Max Verstappen"], correct: 0 },
  { question: "Max Verstappen drives for which team?", choices: ["Red Bull Racing", "Ferrari", "Mercedes", "McLaren"], correct: 0 },
  { question: "Who was the first F1 World Champion?", choices: ["Giuseppe Farina (1950)", "Juan Fangio", "Alberto Ascari", "Stirling Moss"], correct: 0 },
  { question: "How many titles did Juan Manuel Fangio win?", choices: ["5", "4", "3", "6"], correct: 0 },
  { question: "Where is the Monaco Grand Prix held?", choices: ["Monte Carlo street circuit", "Le Mans", "Spa", "Silverstone"], correct: 0 },
  { question: "Where is the British Grand Prix usually held?", choices: ["Silverstone", "Brands Hatch", "Donington", "Aintree"], correct: 0 },
  { question: "Ferrari's home race is at?", choices: ["Monza", "Imola", "Mugello", "Vallelunga"], correct: 0 },
  { question: "Ayrton Senna died at which race in 1994?", choices: ["San Marino GP, Imola", "Monaco", "Brazilian", "Italian"], correct: 0 },
  { question: "How many F1 titles did Senna win?", choices: ["3", "2", "4", "1"], correct: 0 },
  { question: "Who is the youngest ever F1 World Champion?", choices: ["Sebastian Vettel (2010)", "Max Verstappen", "Lewis Hamilton", "Fernando Alonso"], correct: 0 },
  { question: "F1 race weekend qualifying format introduced in 2006 was?", choices: ["Q1, Q2, Q3 knockout", "Single lap", "Aggregate timing", "One-shot"], correct: 0 },
  { question: "How long is a typical F1 race distance?", choices: ["About 305 km", "About 200 km", "About 400 km", "About 500 km"], correct: 0 },
  { question: "What is DRS in F1?", choices: ["Drag Reduction System", "Dynamic Race System", "Driver Reset System", "Direct Race Setup"], correct: 0 },
  { question: "Mercedes won how many constructors' titles in a row from 2014?", choices: ["8 (2014-2021)", "5", "6", "10"], correct: 0 },
  { question: "Red Bull's chief designer in their dominant years?", choices: ["Adrian Newey", "Ross Brawn", "Patrick Head", "Rory Byrne"], correct: 0 },
  { question: "Who was the 2024 F1 World Champion?", choices: ["Max Verstappen", "Lewis Hamilton", "Lando Norris", "Charles Leclerc"], correct: 0 },
  { question: "Charles Leclerc drives for?", choices: ["Ferrari", "Mercedes", "McLaren", "Red Bull"], correct: 0 },
  { question: "Lando Norris drives for?", choices: ["McLaren", "Williams", "Aston Martin", "Alpine"], correct: 0 },
  { question: "Drive to Survive is a documentary on which streaming service?", choices: ["Netflix", "Amazon", "Disney+", "Apple TV+"], correct: 0 },
  { question: "F1 cars use what type of engine since 2014?", choices: ["1.6L V6 turbo hybrid", "2.4L V8", "3.0L V10", "1.5L V4 turbo"], correct: 0 },
  { question: "Who runs Formula 1 today (commercial rights holder)?", choices: ["Liberty Media", "Bernie Ecclestone", "FIA", "FOM"], correct: 0 },
  { question: "What governing body regulates F1?", choices: ["FIA", "FIFA", "FFA", "FFI"], correct: 0 },
  { question: "Sebastian Vettel won 4 titles with which team?", choices: ["Red Bull", "Ferrari", "Mercedes", "Williams"], correct: 0 },
  { question: "Williams F1 was founded by?", choices: ["Frank Williams", "Patrick Head", "Frank Williams and Patrick Head", "Damon Hill"], correct: 0 },
  { question: "Damon Hill is the son of which world champion?", choices: ["Graham Hill", "James Hunt", "John Surtees", "Jackie Stewart"], correct: 0 },
  { question: "How many points are awarded for a win in current F1?", choices: ["25", "10", "15", "30"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Formula1QuizSettings): Formula1QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Formula1QuizState, action: Formula1QuizAction): Formula1QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Formula1QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
