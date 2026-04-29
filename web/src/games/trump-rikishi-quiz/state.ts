import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TrumpRikishiSettings { questions: "10"; }
export interface TrumpRikishiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TrumpRikishiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What sport is Trump Rikishi themed around?", choices: ["Karate","Sumo wrestling","Judo","Aikido"], correct: 1 },
  { question: "What does 'rikishi' mean in Japanese?", choices: ["Tournament","Sumo wrestler","Stable master","Referee"], correct: 1 },
  { question: "The highest sumo rank depicted in Trump Rikishi is typically?", choices: ["Komusubi","Sekiwake","Ozeki","Yokozuna"], correct: 3 },
  { question: "Trump Rikishi is classified as what kind of card game?", choices: ["Solitaire","Trick-taking","Shedding","Auction"], correct: 1 },
  { question: "Trump Rikishi typically plays with how many players?", choices: ["1","2-4","6","10+"], correct: 1 },
  { question: "A 'bout' in Trump Rikishi corresponds to?", choices: ["A round","A trick","An entire game","A bid"], correct: 1 },
  { question: "The word 'trump' in Trump Rikishi refers to?", choices: ["A US president","The lead suit beating others","A bonus card","An honour token"], correct: 1 },
  { question: "Sumo's basho tournament happens how often per year?", choices: ["3","5","6","12"], correct: 2 },
  { question: "A typical sumo match ends when?", choices: ["Time runs out","One wrestler is forced out or down","A judge stops it","Three falls"], correct: 1 },
  { question: "Sumo wrestlers traditionally wear?", choices: ["Gi","Mawashi","Hakama","Yukata"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TrumpRikishiSettings): TrumpRikishiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TrumpRikishiState, action: TrumpRikishiAction): TrumpRikishiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TrumpRikishiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
