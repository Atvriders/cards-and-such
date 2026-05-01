import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThanksgivingQuizSettings { questions: "10" | "20" | "30"; }
export interface ThanksgivingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThanksgivingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "U.S. Thanksgiving is on?", choices: ["Fourth Thursday of November", "Last Thursday of November", "November 25 always", "Third Thursday of November"], correct: 0 },
  { question: "Canadian Thanksgiving is on?", choices: ["Second Monday of October", "Fourth Thursday of November", "November 11", "First Friday of November"], correct: 0 },
  { question: "The first Thanksgiving (1621) was held at?", choices: ["Plymouth Colony", "Jamestown", "New Amsterdam", "Salem"], correct: 0 },
  { question: "Pilgrims arrived on which ship?", choices: ["Mayflower", "Speedwell", "Santa Maria", "Discovery"], correct: 0 },
  { question: "Mayflower departed from where?", choices: ["Plymouth, England", "Southampton", "London", "Bristol"], correct: 0 },
  { question: "Mayflower arrived in?", choices: ["1620", "1607", "1630", "1492"], correct: 0 },
  { question: "Wampanoag chief at first Thanksgiving was?", choices: ["Massasoit", "Squanto", "Powhatan", "Pocahontas"], correct: 0 },
  { question: "Who taught Pilgrims to plant corn?", choices: ["Squanto (Tisquantum)", "Massasoit", "Samoset", "Pocahontas"], correct: 0 },
  { question: "Lincoln declared Thanksgiving a national holiday in?", choices: ["1863", "1789", "1876", "1900"], correct: 0 },
  { question: "FDR moved Thanksgiving date controversy in?", choices: ["1939", "1942", "1945", "1933"], correct: 0 },
  { question: "Macy's Thanksgiving Day Parade started in?", choices: ["1924", "1900", "1936", "1945"], correct: 0 },
  { question: "Parade is held in?", choices: ["New York City", "Chicago", "Detroit", "Boston"], correct: 0 },
  { question: "What turkey/balloon character appears in Macy's parade?", choices: ["Many balloons (Snoopy, etc.)", "Only turkeys", "Only Santa", "Only floats"], correct: 0 },
  { question: "Detroit traditionally hosts what NFL team on Thanksgiving?", choices: ["Detroit Lions (since 1934)", "Cowboys", "Patriots", "Packers"], correct: 0 },
  { question: "Other NFL team that traditionally plays Thanksgiving?", choices: ["Dallas Cowboys (since 1966)", "Bears", "Steelers", "Giants"], correct: 0 },
  { question: "Most popular Thanksgiving dish?", choices: ["Roast turkey", "Ham", "Beef", "Lamb"], correct: 0 },
  { question: "What is 'cornbread stuffing' or 'dressing'?", choices: ["Cooked outside the bird is dressing; inside is stuffing", "Same thing", "Different cuisine", "Vegan substitute"], correct: 0 },
  { question: "Pumpkin pie is typically flavored with?", choices: ["Cinnamon, nutmeg, ginger, cloves", "Cardamom", "Saffron", "Vanilla only"], correct: 0 },
  { question: "President pardons what each Thanksgiving?", choices: ["A turkey (or two)", "A pig", "A chicken", "An ostrich"], correct: 0 },
  { question: "First president to formally pardon a turkey?", choices: ["George H.W. Bush (1989, formal tradition)", "Lincoln", "Truman", "JFK"], correct: 0 },
  { question: "Black Friday occurs on?", choices: ["The day after Thanksgiving", "Two days before", "Tuesday after", "Monday after"], correct: 0 },
  { question: "'Cyber Monday' falls?", choices: ["Monday after Thanksgiving", "First Monday of December", "Tuesday after", "Thursday after"], correct: 0 },
  { question: "How many Pilgrims roughly attended the first Thanksgiving?", choices: ["About 50 (with 90 Wampanoag)", "100", "20", "200"], correct: 0 },
  { question: "First Thanksgiving lasted approximately?", choices: ["Three days", "One day", "A week", "A month"], correct: 0 },
  { question: "Plymouth Rock is in?", choices: ["Plymouth, MA", "Plymouth, NH", "Plymouth, England", "Plymouth, ME"], correct: 0 },
  { question: "Sarah Josepha Hale famously campaigned for?", choices: ["Making Thanksgiving a national holiday", "Black Friday", "Pumpkin pie", "Mayflower preservation"], correct: 0 },
  { question: "Thanksgiving turkey ranks roughly?", choices: ["46 million eaten in US annually", "10 million", "100 million", "200 million"], correct: 0 },
  { question: "Cranberry sauce is associated with?", choices: ["Massachusetts/New England bogs", "California", "Florida", "Texas"], correct: 0 },
  { question: "What is 'Friendsgiving'?", choices: ["Thanksgiving celebration with friends instead of/before family", "Online thanksgiving", "Religious version", "Children's version"], correct: 0 },
  { question: "Charlie Brown Thanksgiving special premiered?", choices: ["1973", "1965", "1980", "1968"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ThanksgivingQuizSettings): ThanksgivingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThanksgivingQuizState, action: ThanksgivingQuizAction): ThanksgivingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThanksgivingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
