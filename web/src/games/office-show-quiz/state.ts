import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OfficeShowSettings { questions: "10" | "20" | "30"; }
export interface OfficeShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OfficeShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Office is set in which city?", choices: ["Buffalo","Scranton","Albany","Stamford"], correct: 1 },
  { question: "Michael Scott is played by?", choices: ["Steve Carell","John Krasinski","Rainn Wilson","Ed Helms"], correct: 0 },
  { question: "What is the company name?", choices: ["Dunder Mifflin","Sabre","Vance Refrigeration","Staples"], correct: 0 },
  { question: "Jim's prank: Dwight's stapler in?", choices: ["Mug","Jello","Drawer","Trash"], correct: 1 },
  { question: "Dwight is an Assistant to the?", choices: ["Manager","Regional Manager","President","VP"], correct: 1 },
  { question: "Andy went to which college?", choices: ["Yale","Cornell","Harvard","Princeton"], correct: 1 },
  { question: "Pam's wedding venue was?", choices: ["Niagara Falls","Vegas","Beach","City Hall"], correct: 0 },
  { question: "Kevin spilled what?", choices: ["Soup","Chili","Salsa","Coffee"], correct: 1 },
  { question: "The HR rep is named?", choices: ["Toby","Holly","Dwight","Gabe"], correct: 0 },
  { question: "Threat Level Midnight is a?", choices: ["Movie","Book","Game","Song"], correct: 0 },
  { question: "Who sells paper at Sabre?", choices: ["Charles Miner","Robert California","Same crew","New crew"], correct: 2 },
  { question: "Pretzel Day brings out?", choices: ["Stanley","Kevin","Phyllis","Meredith"], correct: 0 },
  { question: "Creed's job title is?", choices: ["QA Director","Salesman","HR","Accountant"], correct: 0 },
  { question: "Jim and Pam's daughter?", choices: ["Cece","Phyllis","Karen","Erin"], correct: 0 },
  { question: "Who plays Andy Bernard?", choices: ["Ed Helms","Rainn Wilson","BJ Novak","Mindy Kaling"], correct: 0 },
  { question: "Schrute Farms grows?", choices: ["Beets","Corn","Peppers","Tomatoes"], correct: 0 },
  { question: "The Finer Things Club had?", choices: ["3 members","4 members","5 members","10 members"], correct: 0 },
  { question: "Dunder Mifflin is bought by?", choices: ["Sabre","Vance","Staples","Office Depot"], correct: 0 },
  { question: "Michael's improv class catchphrase?", choices: ["Yes and","Bang!","Action!","Print"], correct: 1 },
  { question: "Who is Prison Mike?", choices: ["Dwight","Michael","Andy","Toby"], correct: 1 },
  { question: "Erin's full name is?", choices: ["Erin Hannon","Erin Bernard","Erin Smith","Erin Howard"], correct: 0 },
  { question: "Michael leaves Scranton for?", choices: ["Colorado","Florida","Texas","Hawaii"], correct: 0 },
  { question: "Who replaces Michael?", choices: ["Robert California","Andy","Deangelo","Dwight"], correct: 2 },
  { question: "Holly Flax is from?", choices: ["Nashua","Buffalo","Philly","NYC"], correct: 0 },
  { question: "Stanley's mug says?", choices: ["World's Best Boss","Pretzel Day","I love beets","Crossword"], correct: 0 },
  { question: "Show ran for how many seasons?", choices: ["7","8","9","10"], correct: 2 },
  { question: "Final episode aired in?", choices: ["2011","2012","2013","2014"], correct: 2 },
  { question: "The pilot episode aired in?", choices: ["2003","2005","2006","2007"], correct: 1 },
  { question: "Who is the documentary crew filming for?", choices: ["PBS","Local News","WVIA","Unknown"], correct: 2 },
  { question: "Robert California is played by?", choices: ["James Spader","Will Ferrell","Kathy Bates","Idris Elba"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OfficeShowSettings): OfficeShowState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OfficeShowState, action: OfficeShowAction): OfficeShowState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OfficeShowState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
