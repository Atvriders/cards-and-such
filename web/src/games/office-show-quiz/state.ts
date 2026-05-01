import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OfficeShowSettings { questions: "10" | "20" | "30"; }
export interface OfficeShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OfficeShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What city is The Office (US) set in?", choices: ["Scranton","Buffalo","Cleveland","Albany"], correct: 0 },
  { question: "What company do they work for?", choices: ["Dunder Mifflin","Sabre","Vance Refrigeration","Staples"], correct: 0 },
  { question: "Who plays Michael Scott?", choices: ["Steve Carell","Rainn Wilson","John Krasinski","Ed Helms"], correct: 0 },
  { question: "Who plays Dwight Schrute?", choices: ["Rainn Wilson","Steve Carell","Ed Helms","Creed Bratton"], correct: 0 },
  { question: "Who plays Jim Halpert?", choices: ["John Krasinski","B.J. Novak","Ed Helms","Steve Carell"], correct: 0 },
  { question: "Who plays Pam Beesly?", choices: ["Jenna Fischer","Angela Kinsey","Mindy Kaling","Ellie Kemper"], correct: 0 },
  { question: "What is Dwight's side business?", choices: ["Beet farm","Vineyard","Apple orchard","Dairy farm"], correct: 0 },
  { question: "What is Jim's prank target most often?", choices: ["Dwight","Michael","Stanley","Kevin"], correct: 0 },
  { question: "Who replaces Michael as regional manager (briefly, then permanently)?", choices: ["Andy Bernard","Jim Halpert","Robert California","Nellie Bertram"], correct: 0 },
  { question: "Who plays Andy Bernard?", choices: ["Ed Helms","John Krasinski","B.J. Novak","Rainn Wilson"], correct: 0 },
  { question: "What is Kevin's last name?", choices: ["Malone","Hudson","Bratton","Howard"], correct: 0 },
  { question: "What is Stanley's preferred crossword time?", choices: ["During work","After lunch","Before noon","Never"], correct: 0 },
  { question: "What is the name of the warehouse foreman (Pam's first fiancé)?", choices: ["Roy Anderson","Mark","Toby Flenderson","Bob Vance"], correct: 0 },
  { question: "Who runs Vance Refrigeration?", choices: ["Bob Vance","Phyllis Lapin","Dwight","Creed"], correct: 0 },
  { question: "What is Creed's job title?", choices: ["Quality Assurance","Salesman","Receptionist","Accountant"], correct: 0 },
  { question: "Who plays Kelly Kapoor?", choices: ["Mindy Kaling","Ellie Kemper","Jenna Fischer","Angela Kinsey"], correct: 0 },
  { question: "What is Michael's improv class catchphrase?", choices: ["I have a gun","That's what she said","No, God, no","Boom! Roasted"], correct: 0 },
  { question: "What is the name of Michael's screenplay?", choices: ["Threat Level Midnight","Agent Michael Scarn","The Scarn","Goldenface"], correct: 0 },
  { question: "Who plays Holly Flax?", choices: ["Amy Ryan","Catherine Tate","Melora Hardin","Jenna Fischer"], correct: 0 },
  { question: "What is Jan's last name?", choices: ["Levinson","Bernard","Flax","Halpert"], correct: 0 },
  { question: "Where do Jim and Pam get married?", choices: ["Niagara Falls","Hawaii","Las Vegas","Scranton"], correct: 0 },
  { question: "What is Andy's a cappella group called?", choices: ["Here Comes Treble","The Tones","Mose's Boys","The Schrutes"], correct: 0 },
  { question: "Who buys Dunder Mifflin in Season 7?", choices: ["Sabre","Staples","Office Depot","Athlead"], correct: 0 },
  { question: "Who plays Robert California?", choices: ["James Spader","Will Ferrell","Idris Elba","Kathy Bates"], correct: 0 },
  { question: "What is the name of Dwight's cousin?", choices: ["Mose","Jeb","Heinrich","Otto"], correct: 0 },
  { question: "What does Kevin spill in the famous chili scene?", choices: ["His chili","Coffee","Punch","Soup"], correct: 0 },
  { question: "What is Toby's role at Dunder Mifflin?", choices: ["HR Representative","Accountant","Salesman","Warehouse"], correct: 0 },
  { question: "Who plays Erin Hannon?", choices: ["Ellie Kemper","Mindy Kaling","Jenna Fischer","Anna Camp"], correct: 0 },
  { question: "What is the name of the documentary crew's show within the show?", choices: ["The Office: An American Workplace","Scranton Stories","Paper Trail","Office Hours"], correct: 0 },
  { question: "Where does Jim eventually move for his sports marketing job?", choices: ["Philadelphia","New York","Boston","Stamford"], correct: 0 },
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
