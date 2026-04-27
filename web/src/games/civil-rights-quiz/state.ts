import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CivilRightsQuizSettings { questions: "10" | "20" | "30"; }
export interface CivilRightsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CivilRightsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "MLK's most famous speech location?", choices: ["Lincoln Memorial", "White House", "Selma", "Memphis"], correct: 0 },
  { question: "Rosa Parks refused to give up her seat in?", choices: ["Birmingham", "Montgomery", "Selma", "Atlanta"], correct: 1 },
  { question: "MLK was assassinated in?", choices: ["Memphis", "Atlanta", "Birmingham", "NYC"], correct: 0 },
  { question: "The March on Washington was in?", choices: ["1953", "1963", "1973", "1983"], correct: 1 },
  { question: "Malcolm X was a leader in?", choices: ["SCLC", "Nation of Islam", "NAACP", "CORE"], correct: 1 },
  { question: "Malcolm X was assassinated in?", choices: ["1955", "1965", "1975", "1985"], correct: 1 },
  { question: "Mahatma Gandhi led independence of?", choices: ["Pakistan", "India", "Bangladesh", "Sri Lanka"], correct: 1 },
  { question: "Gandhi advocated?", choices: ["Nonviolence", "Armed struggle", "Both", "Neither"], correct: 0 },
  { question: "Mandela's political party?", choices: ["ANC", "SAHRC", "COSATU", "AZAPO"], correct: 0 },
  { question: "Mandela was imprisoned for ___ years?", choices: ["7", "17", "27", "37"], correct: 2 },
  { question: "Mandela became president in?", choices: ["1989", "1994", "1999", "2004"], correct: 1 },
  { question: "Tutu was famous for?", choices: ["TRC chair, anti-apartheid", "Banking", "Soccer", "Rugby"], correct: 0 },
  { question: "Susan B. Anthony fought for?", choices: ["Women's suffrage", "Abolition only", "Banking rights", "Education only"], correct: 0 },
  { question: "19th Amendment guaranteed?", choices: ["Women's vote", "18-yr vote", "African-Am vote", "Senator election"], correct: 0 },
  { question: "15th Amendment guaranteed?", choices: ["Race-based voting protection", "Women's vote", "Income tax", "Slavery abolition"], correct: 0 },
  { question: "13th Amendment abolished?", choices: ["Slavery", "Income tax", "Sedition", "Bigamy"], correct: 0 },
  { question: "Frederick Douglass was a famous?", choices: ["Abolitionist", "Suffragist only", "Soldier", "Industrialist"], correct: 0 },
  { question: "Harriet Tubman led the?", choices: ["Underground Railroad", "Pony Express", "Trail of Tears", "Oregon Trail"], correct: 0 },
  { question: "W.E.B. Du Bois co-founded?", choices: ["NAACP", "CORE", "SCLC", "NAS"], correct: 0 },
  { question: "Cesar Chavez fought for?", choices: ["Farmworkers", "Auto workers", "Steelworkers", "Miners"], correct: 0 },
  { question: "Dolores Huerta co-founded?", choices: ["UFW", "AFL-CIO", "NEA", "NAS"], correct: 0 },
  { question: "John Lewis led marches in?", choices: ["Selma", "Birmingham", "Montgomery", "Atlanta"], correct: 0 },
  { question: "Bloody Sunday occurred in?", choices: ["Selma 1965", "Birmingham 1963", "Memphis 1968", "Montgomery 1955"], correct: 0 },
  { question: "Civil Rights Act passed in?", choices: ["1955", "1964", "1972", "1980"], correct: 1 },
  { question: "Voting Rights Act passed in?", choices: ["1955", "1965", "1972", "1980"], correct: 1 },
  { question: "Brown v. Board of Education year?", choices: ["1944", "1954", "1964", "1974"], correct: 1 },
  { question: "Plessy v. Ferguson year?", choices: ["1876", "1896", "1916", "1936"], correct: 1 },
  { question: "Loving v. Virginia legalized?", choices: ["Interracial marriage", "School desegregation", "Voting", "Public accommodations"], correct: 0 },
  { question: "Marsha P. Johnson was a?", choices: ["LGBTQ activist", "Suffragist", "Abolitionist", "Labor leader"], correct: 0 },
  { question: "Stonewall riots year?", choices: ["1959", "1969", "1979", "1989"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CivilRightsQuizSettings): CivilRightsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CivilRightsQuizState, action: CivilRightsQuizAction): CivilRightsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CivilRightsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
