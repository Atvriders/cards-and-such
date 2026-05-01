import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChristRedeemerQuizSettings { questions: "10" | "20"; }
export interface ChristRedeemerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChristRedeemerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "City of Christ the Redeemer?", choices: ["S\u00e3o Paulo", "Rio de Janeiro", "Lisbon", "Salvador"], correct: 1 },
  { question: "Mountain it stands on?", choices: ["Sugarloaf", "Corcovado", "P\u00e3o de A\u00e7\u00facar", "Pedra da G\u00e1vea"], correct: 1 },
  { question: "Year inaugurated?", choices: ["1911", "1931", "1951", "1971"], correct: 1 },
  { question: "Height of the statue (without pedestal)?", choices: ["~10 m", "~30 m", "~60 m", "~100 m"], correct: 1 },
  { question: "Total height with pedestal?", choices: ["~20 m", "~38 m", "~70 m", "~150 m"], correct: 1 },
  { question: "Arm span (approx)?", choices: ["~10 m", "~28 m", "~50 m", "~100 m"], correct: 1 },
  { question: "Material of the statue?", choices: ["Bronze", "Reinforced concrete & soapstone", "Marble", "Steel"], correct: 1 },
  { question: "Soapstone came from?", choices: ["Italy", "Sweden (originally)", "Brazil quarries", "Argentina"], correct: 1 },
  { question: "Lead sculptor?", choices: ["Paul Landowski", "Bartholdi", "Rodin", "Niemeyer"], correct: 0 },
  { question: "Brazilian engineer who led project?", choices: ["Heitor da Silva Costa", "Niemeyer", "Costa", "Lemos"], correct: 0 },
  { question: "Country/elevation of Corcovado peak (approx)?", choices: ["~700 m", "~1,200 m", "~2,000 m", "~3,000 m"], correct: 0 },
  { question: "Arms outstretched symbolize?", choices: ["Power", "Welcome/peace", "Surrender", "Sky"], correct: 1 },
  { question: "National park surrounding it?", choices: ["Pantanal", "Tijuca", "Igua\u00e7u", "Amazon"], correct: 1 },
  { question: "UNESCO recognition for Rio includes Christ since?", choices: ["1985", "2002", "2012", "2020"], correct: 2 },
  { question: "Named one of New 7 Wonders in?", choices: ["2005", "2007", "2010", "2015"], correct: 1 },
  { question: "How many tiles cover the surface?", choices: ["~2,000", "~6 million", "~25 million", "~100 million"], correct: 1 },
  { question: "Statue is struck by lightning roughly?", choices: ["Yearly once", "Several times yearly", "Once a decade", "Never"], correct: 1 },
  { question: "Repairs after lightning are done with?", choices: ["Glue", "Soapstone replacement", "Paint", "Wax"], correct: 1 },
  { question: "Year project funding began (approx)?", choices: ["1850", "1900", "1922", "1945"], correct: 2 },
  { question: "Funding came mostly from?", choices: ["State budget", "Catholic donations", "Lottery", "Sponsorship"], correct: 1 },
  { question: "Religion most associated?", choices: ["Catholicism", "Protestantism", "Orthodox", "Buddhism"], correct: 0 },
  { question: "First mass at the statue led by?", choices: ["Local priest", "Pope", "Cardinal", "Bishop of Rio"], correct: 3 },
  { question: "Visitor access today via?", choices: ["Stairs only", "Cog train + escalators/elevators", "Helicopter only", "Cable car only"], correct: 1 },
  { question: "Cog railway built in?", choices: ["1884", "1922", "1955", "1985"], correct: 0 },
  { question: "Annual visitors (approx)?", choices: ["~100,000", "~2 million", "~25 million", "~100 million"], correct: 1 },
  { question: "Statue weighs approximately?", choices: ["~100 t", "~635 t", "~5,000 t", "~25,000 t"], correct: 1 },
  { question: "Restoration in 2010 included?", choices: ["New crown", "Repairs to soapstone", "New arms", "New base"], correct: 1 },
  { question: "Olympics opened in Rio in?", choices: ["1992", "2008", "2016", "2020"], correct: 2 },
  { question: "Visible from how many parts of Rio?", choices: ["A few", "Almost the whole city", "Only Copacabana", "Only Ipanema"], correct: 1 },
  { question: "Best photo time of day?", choices: ["Sunrise/sunset", "Midnight", "Noon only", "Rainy days"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChristRedeemerQuizSettings): ChristRedeemerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChristRedeemerQuizState, action: ChristRedeemerQuizAction): ChristRedeemerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChristRedeemerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
