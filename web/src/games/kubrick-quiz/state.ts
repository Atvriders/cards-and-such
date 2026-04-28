import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KubrickQuizSettings { questions: "10" | "20" | "30"; }
export interface KubrickQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KubrickQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Year 2001: A Space Odyssey released?", choices: ["1965", "1968", "1971", "1974"], correct: 1 },
  { question: "The Shining year?", choices: ["1977", "1980", "1983", "1986"], correct: 1 },
  { question: "A Clockwork Orange year?", choices: ["1969", "1971", "1974", "1976"], correct: 1 },
  { question: "Full Metal Jacket year?", choices: ["1985", "1987", "1989", "1991"], correct: 1 },
  { question: "Eyes Wide Shut year?", choices: ["1995", "1997", "1999", "2001"], correct: 2 },
  { question: "Dr. Strangelove year?", choices: ["1962", "1964", "1966", "1968"], correct: 1 },
  { question: "Barry Lyndon year?", choices: ["1973", "1975", "1977", "1979"], correct: 1 },
  { question: "Spartacus year?", choices: ["1958", "1960", "1962", "1964"], correct: 1 },
  { question: "Lolita year?", choices: ["1960", "1962", "1964", "1966"], correct: 1 },
  { question: "Paths of Glory year?", choices: ["1955", "1957", "1959", "1961"], correct: 1 },
  { question: "Kubrick was born in?", choices: ["NYC", "Chicago", "LA", "Boston"], correct: 0 },
  { question: "Kubrick died in?", choices: ["1995", "1999", "2001", "2003"], correct: 1 },
  { question: "2001 lead character?", choices: ["Bowman", "Poole", "HAL", "Floyd"], correct: 0 },
  { question: "HAL stands for?", choices: ["Heuristic ALgorithmic", "Just initials", "Heuristically programmed ALgorithmic", "Hardware ALgorithm"], correct: 2 },
  { question: "The Shining novel author?", choices: ["Stephen King", "Dean Koontz", "Peter Straub", "Clive Barker"], correct: 0 },
  { question: "The Shining lead actor?", choices: ["Jack Nicholson", "Robert Duvall", "Pacino", "De Niro"], correct: 0 },
  { question: "Hotel in The Shining?", choices: ["Overlook", "Stanley", "Bates", "Belvedere"], correct: 0 },
  { question: "Full Metal Jacket setting?", choices: ["Vietnam", "Korea", "WWII", "Iraq"], correct: 0 },
  { question: "Drill instructor in FMJ?", choices: ["R. Lee Ermey", "Lou Gossett", "Tommy Lee Jones", "Sam Elliott"], correct: 0 },
  { question: "A Clockwork Orange protagonist?", choices: ["Alex", "Pete", "Georgie", "Dim"], correct: 0 },
  { question: "Clockwork Orange novel author?", choices: ["Anthony Burgess", "Aldous Huxley", "George Orwell", "JG Ballard"], correct: 0 },
  { question: "Eyes Wide Shut leads?", choices: ["Cruise & Kidman", "Cruise & Hayek", "Pitt & Aniston", "Affleck & Hudson"], correct: 0 },
  { question: "Dr. Strangelove lead actor?", choices: ["Peter Sellers", "Peter O'Toole", "Lawrence Olivier", "George C. Scott"], correct: 0 },
  { question: "Strangelove number of roles for Sellers?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Barry Lyndon based on novel by?", choices: ["Thackeray", "Dickens", "Trollope", "Eliot"], correct: 0 },
  { question: "Kubrick lived where in later years?", choices: ["UK", "Switzerland", "Germany", "France"], correct: 0 },
  { question: "Kubrick won Oscar for?", choices: ["Best Director", "Best Picture", "Special FX (2001)", "Best Adapted Screenplay"], correct: 2 },
  { question: "Kubrick's debut feature?", choices: ["Fear and Desire", "Killer's Kiss", "The Killing", "Spartacus"], correct: 0 },
  { question: "AI: Artificial Intelligence directed by?", choices: ["Spielberg", "Kubrick", "Scorsese", "Coppola"], correct: 0 },
  { question: "Kubrick was originally a what before film?", choices: ["Photographer", "Painter", "Writer", "Musician"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KubrickQuizSettings): KubrickQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KubrickQuizState, action: KubrickQuizAction): KubrickQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KubrickQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
