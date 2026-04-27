import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishMonarchsQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishMonarchsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishMonarchsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "William the Conqueror won at?", choices: ["Hastings", "Bosworth", "Agincourt", "Crecy"], correct: 0 },
  { question: "Henry VIII had how many wives?", choices: ["Four", "Five", "Six", "Seven"], correct: 2 },
  { question: "Henry VIII broke from Rome to marry?", choices: ["Catherine of Aragon", "Anne Boleyn", "Jane Seymour", "Anne of Cleves"], correct: 1 },
  { question: "Elizabeth I was daughter of?", choices: ["Catherine of Aragon", "Anne Boleyn", "Jane Seymour", "Catherine Parr"], correct: 1 },
  { question: "The Spanish Armada was defeated under?", choices: ["Henry VIII", "Edward VI", "Mary I", "Elizabeth I"], correct: 3 },
  { question: "Queen Victoria reigned from?", choices: ["1825-1875", "1837-1901", "1840-1899", "1850-1910"], correct: 1 },
  { question: "Victoria's consort?", choices: ["Albert", "Edward", "George", "Frederick"], correct: 0 },
  { question: "Edward VIII abdicated for?", choices: ["Wallis Simpson", "Anne Frank", "Lady Astor", "Mrs. Simpson is correct"], correct: 0 },
  { question: "Elizabeth II began reigning in?", choices: ["1947", "1952", "1957", "1962"], correct: 1 },
  { question: "Elizabeth II's consort?", choices: ["Charles", "Philip", "Albert", "George"], correct: 1 },
  { question: "Prince Charles became king as?", choices: ["Charles II", "Charles III", "Charles IV", "Charles V"], correct: 1 },
  { question: "Anne Boleyn was executed in?", choices: ["1525", "1536", "1547", "1558"], correct: 1 },
  { question: "Mary, Queen of Scots was executed by?", choices: ["Henry VII", "Henry VIII", "Edward VI", "Elizabeth I"], correct: 3 },
  { question: "Henry V won the Battle of?", choices: ["Hastings", "Agincourt", "Crecy", "Bosworth"], correct: 1 },
  { question: "Richard III lost at?", choices: ["Hastings", "Bosworth", "Agincourt", "Towton"], correct: 1 },
  { question: "The Tudor rose combines red and?", choices: ["Yellow", "White", "Pink", "Blue"], correct: 1 },
  { question: "George III lost which colonies?", choices: ["India", "American", "Canada", "Australia"], correct: 1 },
  { question: "Charles I was beheaded in?", choices: ["1639", "1649", "1659", "1669"], correct: 1 },
  { question: "Oliver Cromwell ruled as?", choices: ["King", "Lord Protector", "Prime Minister", "Regent"], correct: 1 },
  { question: "Charles II returned to throne in?", choices: ["1650", "1660", "1670", "1680"], correct: 1 },
  { question: "William of Orange came in the?", choices: ["Glorious Revolution", "War of Roses", "Hundred Years War", "Civil War"], correct: 0 },
  { question: "Edward VII was son of?", choices: ["Victoria", "George III", "William IV", "George IV"], correct: 0 },
  { question: "George V renamed the royal house to?", choices: ["Stuart", "Tudor", "Windsor", "Plantagenet"], correct: 2 },
  { question: "George VI was famously played in?", choices: ["The King's Speech", "The Crown", "Both", "Neither"], correct: 2 },
  { question: "Edward VIII reigned for less than?", choices: ["1 year", "5 years", "10 years", "20 years"], correct: 0 },
  { question: "Henry I was a son of?", choices: ["William II", "William the Conqueror", "Stephen", "Edgar"], correct: 1 },
  { question: "Stephen and Matilda fought during?", choices: ["The Anarchy", "The Wars of the Roses", "The Civil War", "The Pilgrimage of Grace"], correct: 0 },
  { question: "Henry II married?", choices: ["Eleanor of Aquitaine", "Catherine of Aragon", "Margaret of Anjou", "Isabella"], correct: 0 },
  { question: "Richard the Lionheart fought in the?", choices: ["Crusades", "Hundred Years War", "Civil War", "War of Roses"], correct: 0 },
  { question: "John signed Magna Carta in?", choices: ["1215", "1315", "1415", "1515"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BritishMonarchsQuizSettings): BritishMonarchsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BritishMonarchsQuizState, action: BritishMonarchsQuizAction): BritishMonarchsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BritishMonarchsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
