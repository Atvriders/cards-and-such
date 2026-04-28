import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NetflixHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface NetflixHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NetflixHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Netflix was founded in what year?", choices: ["1995","1997","1999","2001"], correct: 1 },
  { question: "Netflix's co-founders were Reed Hastings and?", choices: ["Marc Randolph","Ted Sarandos","Wilmot Reed","Jeff Bewkes"], correct: 0 },
  { question: "Netflix originally rented?", choices: ["VHS","DVDs","Blu-rays","Games"], correct: 1 },
  { question: "Netflix streaming launched in?", choices: ["2005","2007","2009","2011"], correct: 1 },
  { question: "Netflix's first original series was?", choices: ["House of Cards","Lilyhammer","Orange Is the New Black","Hemlock Grove"], correct: 1 },
  { question: "Stranger Things first aired in?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Netflix acquired the rights to House of Cards from?", choices: ["BBC","MRC","Working Title","Lionsgate"], correct: 1 },
  { question: "Netflix launched globally to ~190 countries in?", choices: ["2014","2015","2016","2017"], correct: 2 },
  { question: "Netflix's password-sharing crackdown peaked in?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Squid Game became Netflix's biggest hit in?", choices: ["2019","2020","2021","2022"], correct: 2 },
  { question: "Reed Hastings stepped down as co-CEO in?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Netflix's headquarters is in?", choices: ["Los Gatos","Mountain View","Cupertino","San Francisco"], correct: 0 },
  { question: "Netflix's mascot in the early DVD era was?", choices: ["Red envelope","Blue envelope","Pop-up DVD","Reed himself"], correct: 0 },
  { question: "Netflix Prize for recommendation algorithms paid?", choices: ["$500K","$1M","$2M","$5M"], correct: 1 },
  { question: "Netflix's ad-supported tier launched in?", choices: ["2021","2022","2023","2024"], correct: 1 },
  { question: "Netflix's content chief is?", choices: ["Ted Sarandos","Bela Bajaria","Greg Peters","Multiple"], correct: 0 },
  { question: "Netflix's 'Skip Intro' button was added in?", choices: ["2015","2017","2019","2021"], correct: 1 },
  { question: "Netflix's first Oscar nomination for Best Picture was?", choices: ["Roma","The Irishman","Mank","Marriage Story"], correct: 0 },
  { question: "Netflix's logo is sometimes called?", choices: ["The N","Tudum","The Red","Stream"], correct: 1 },
  { question: "Netflix's first Korean drama hit before Squid Game was?", choices: ["Crash Landing on You","Kingdom","My Mister","Sweet Home"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NetflixHistoryQuizSettings): NetflixHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NetflixHistoryQuizState, action: NetflixHistoryQuizAction): NetflixHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NetflixHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
