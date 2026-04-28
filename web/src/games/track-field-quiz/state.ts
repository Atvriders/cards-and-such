import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrackFieldQuizSettings { questions: "10" | "20"; }
export interface TrackFieldQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrackFieldQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many lanes are typically on an outdoor running track?", choices: ["6", "8", "10", "12"], correct: 1 },
  { question: "How long is a standard outdoor running track?", choices: ["300m", "400m", "500m", "1000m"], correct: 1 },
  { question: "What is the longest standard track sprint?", choices: ["100m", "200m", "400m", "800m"], correct: 2 },
  { question: "The marathon is how many kilometers?", choices: ["26.2 km", "32 km", "42.2 km", "50 km"], correct: 2 },
  { question: "Which event combines 10 different track and field disciplines?", choices: ["Heptathlon", "Decathlon", "Pentathlon", "Triathlon"], correct: 1 },
  { question: "Which jump uses a fiberglass implement to vault athletes over a bar?", choices: ["High jump", "Long jump", "Pole vault", "Triple jump"], correct: 2 },
  { question: "What is Usain Bolt's world record in the 100m?", choices: ["9.58s", "9.69s", "9.84s", "10.02s"], correct: 0 },
  { question: "Which throwing event uses a metal ball on a wire?", choices: ["Shot put", "Discus", "Hammer throw", "Javelin"], correct: 2 },
  { question: "How heavy is the men's shot put?", choices: ["5.4 kg", "7.26 kg", "9 kg", "10 kg"], correct: 1 },
  { question: "Which jump features three phases (hop, step, jump)?", choices: ["Triple jump", "Long jump", "High jump", "Pole vault"], correct: 0 },
  { question: "What is the women's heptathlon's number of events?", choices: ["5", "7", "8", "10"], correct: 1 },
  { question: "Steeplechase distance for men is?", choices: ["1500m", "2000m", "3000m", "5000m"], correct: 2 },
  { question: "How tall is a standard hurdle in 110m hurdles (men)?", choices: ["91.4 cm (3'0\")", "106.7 cm (3'6\")", "122 cm (4'0\")", "152 cm (5'0\")"], correct: 1 },
  { question: "How many hurdles in a 110m hurdle race?", choices: ["8", "10", "12", "15"], correct: 1 },
  { question: "Who broke the 4-minute mile barrier?", choices: ["Roger Bannister", "Hicham El Guerrouj", "Jim Ryun", "John Walker"], correct: 0 },
  { question: "In what year did Bannister break the 4-minute mile?", choices: ["1948", "1954", "1960", "1968"], correct: 1 },
  { question: "Which event is Olympic but not held indoors?", choices: ["High jump", "Hammer throw", "60m dash", "Long jump"], correct: 1 },
  { question: "How long is the men's javelin?", choices: ["1.5-1.7m", "2.6-2.7m", "3.5-4m", "5m"], correct: 1 },
  { question: "Which surface is typical for modern outdoor tracks?", choices: ["Cinder", "Polyurethane (Mondo/synthetic)", "Concrete", "Grass"], correct: 1 },
  { question: "How many laps is a 1500m race on a standard track?", choices: ["3.75", "4", "5", "6"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TrackFieldQuizSettings): TrackFieldQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrackFieldQuizState, action: TrackFieldQuizAction): TrackFieldQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrackFieldQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
