import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NASCARQuizSettings { questions: "10" | "20" | "30"; }
export interface NASCARQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NASCARQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "When was NASCAR founded?", choices: ["1948", "1955", "1962", "1942"], correct: 0 },
  { question: "Who founded NASCAR?", choices: ["Bill France Sr.", "Richard Petty", "Junior Johnson", "Lee Petty"], correct: 0 },
  { question: "Where is NASCAR's HQ?", choices: ["Daytona Beach, Florida", "Charlotte, NC", "Atlanta", "Talladega"], correct: 0 },
  { question: "Who has the most NASCAR Cup Series championships (all-time tied)?", choices: ["Richard Petty, Dale Earnhardt, Jimmie Johnson (7 each)", "Jeff Gordon (4)", "David Pearson (3)", "Tony Stewart (3)"], correct: 0 },
  { question: "Richard Petty's nickname?", choices: ["The King", "The Intimidator", "Rocket Man", "The Kid"], correct: 0 },
  { question: "Dale Earnhardt's nickname?", choices: ["The Intimidator", "The King", "Iceman", "Smoke"], correct: 0 },
  { question: "Dale Earnhardt died at which 2001 race?", choices: ["Daytona 500", "Talladega 500", "Charlotte 500", "Bristol 500"], correct: 0 },
  { question: "What number was Earnhardt's iconic car?", choices: ["3", "24", "8", "43"], correct: 0 },
  { question: "Richard Petty drove what number?", choices: ["43", "3", "24", "11"], correct: 0 },
  { question: "The Daytona 500 first ran in?", choices: ["1959", "1948", "1965", "1955"], correct: 0 },
  { question: "What is the longest oval track in NASCAR?", choices: ["Talladega Superspeedway (2.66 miles)", "Daytona", "Atlanta", "Charlotte"], correct: 0 },
  { question: "What is the shortest track in NASCAR Cup?", choices: ["Martinsville Speedway (0.526 mi)", "Bristol", "Richmond", "Phoenix"], correct: 0 },
  { question: "Bristol Motor Speedway is famous for?", choices: ["High-banked half-mile concrete track", "Road course", "Superspeedway", "Dirt only"], correct: 0 },
  { question: "Jimmie Johnson won 5 championships in a row from?", choices: ["2006-2010", "2010-2014", "2002-2006", "2008-2012"], correct: 0 },
  { question: "Jeff Gordon's car number?", choices: ["24", "3", "43", "88"], correct: 0 },
  { question: "How many championships did Jeff Gordon win?", choices: ["4", "3", "5", "6"], correct: 0 },
  { question: "Who won the 2024 NASCAR Cup Series Championship?", choices: ["Joey Logano", "Kyle Larson", "William Byron", "Christopher Bell"], correct: 0 },
  { question: "What is the Brickyard 400 raced at?", choices: ["Indianapolis Motor Speedway", "Pocono", "Indy 500 track only", "Texas Motor Speedway"], correct: 0 },
  { question: "What is the Charlotte race called (longest in distance)?", choices: ["Coca-Cola 600", "World 600 (historic)", "Both names", "Coca-Cola 500"], correct: 2 },
  { question: "Coca-Cola 600 distance?", choices: ["600 miles (longest)", "500 miles", "400 miles", "300 miles"], correct: 0 },
  { question: "What manufacturer is iconic with Bill Elliott?", choices: ["Ford", "Chevrolet", "Pontiac", "Dodge"], correct: 0 },
  { question: "Chase Elliott is the son of?", choices: ["Bill Elliott", "Davey Allison", "Dale Earnhardt", "Richard Petty"], correct: 0 },
  { question: "What is 'restrictor plate' racing?", choices: ["Cars with restrictor on intake to limit speed (now tapered spacer)", "Speed limit on pit road", "Tire restriction", "Fuel limit"], correct: 0 },
  { question: "What car make does Toyota use in NASCAR Cup?", choices: ["Camry", "Corolla", "Supra (Xfinity)", "Avalon (former)"], correct: 0 },
  { question: "What manufacturer left NASCAR Cup in 2012?", choices: ["Dodge", "Pontiac", "Mercury", "Buick"], correct: 0 },
  { question: "Talladega is in what state?", choices: ["Alabama", "Georgia", "Florida", "Tennessee"], correct: 0 },
  { question: "How many cars typically start a Cup race?", choices: ["About 36-40", "About 20", "About 50", "About 30"], correct: 0 },
  { question: "What playoff format does NASCAR use since 2014?", choices: ["Chase/Playoffs with elimination rounds", "Single race finale", "Season points only", "Two-race playoff"], correct: 0 },
  { question: "Stewart-Haas Racing is co-owned by?", choices: ["Tony Stewart and Gene Haas", "Tony Stewart only", "Gene Haas only", "Joe Gibbs"], correct: 0 },
  { question: "Joe Gibbs (NFL coach) owns which racing team?", choices: ["Joe Gibbs Racing (Toyota)", "Hendrick Motorsports", "Roush Fenway", "Penske"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NASCARQuizSettings): NASCARQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NASCARQuizState, action: NASCARQuizAction): NASCARQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NASCARQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
