import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TehonbikiSettings { questions: "10"; }
export interface TehonbikiState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TehonbikiAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Tehonbiki, who selects the secret card?", choices: ["Random draw","Dealer","Highest player","First bettor"], correct: 1 },
  { question: "Tehonbiki uses how many possible card values?", choices: ["3","5","6","8"], correct: 2 },
  { question: "Which deck is used for Tehonbiki?", choices: ["Hanafuda","Tehonbiki cards (1-6)","Western 52","Mahjong tiles"], correct: 1 },
  { question: "Tehonbiki is associated historically with which group?", choices: ["Samurai","Yakuza","Daimyo","Monks"], correct: 1 },
  { question: "Players in Tehonbiki are betting on?", choices: ["Their own card","The dealer's chosen card","The deck order","Random suit"], correct: 1 },
  { question: "Which kind of bet exists in Tehonbiki?", choices: ["High/low","Single number / pair / range","Trump suit","Numeric sum"], correct: 1 },
  { question: "Tehonbiki is primarily a game of?", choices: ["Skill","Pure chance with reading","Memorisation","Calculation"], correct: 1 },
  { question: "The pay-outs in Tehonbiki vary based on?", choices: ["Hand size","Bet type chosen","Time of day","Number of players"], correct: 1 },
  { question: "Tehonbiki is best described as?", choices: ["Trick-taking","Banking gambling game","Solitaire","Trick-and-meld"], correct: 1 },
  { question: "A typical Tehonbiki round is?", choices: ["Multi-hour","Brief and rapid","Two-day","Weekly"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TehonbikiSettings): TehonbikiState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TehonbikiState, action: TehonbikiAction): TehonbikiState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TehonbikiState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
