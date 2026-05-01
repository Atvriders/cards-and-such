import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishMonarchsQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishMonarchsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishMonarchsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First Tudor king?", choices: ["Henry VII", "Henry VIII", "Edward VI", "Richard III"], correct: 0 },
  { question: "Henry VIII had how many wives?", choices: ["Four", "Five", "Six", "Seven"], correct: 2 },
  { question: "Elizabeth I was daughter of?", choices: ["Catherine of Aragon", "Anne Boleyn", "Jane Seymour", "Anne of Cleves"], correct: 1 },
  { question: "Queen Victoria reigned from?", choices: ["1837-1901", "1820-1880", "1850-1910", "1800-1860"], correct: 0 },
  { question: "Who succeeded Elizabeth I?", choices: ["James I", "Charles I", "Edward VI", "Henry VIII"], correct: 0 },
  { question: "Charles I was executed in?", choices: ["1642", "1649", "1660", "1685"], correct: 1 },
  { question: "Who restored the monarchy in 1660?", choices: ["Charles I", "Charles II", "James II", "William III"], correct: 1 },
  { question: "Glorious Revolution overthrew?", choices: ["Charles II", "James II", "William III", "Anne"], correct: 1 },
  { question: "First Hanoverian king?", choices: ["George I", "George II", "George III", "William IV"], correct: 0 },
  { question: "George III lost which colonies?", choices: ["India", "American", "Australian", "Canadian"], correct: 1 },
  { question: "Queen Victoria's consort?", choices: ["Albert", "Edward", "George", "Philip"], correct: 0 },
  { question: "Edward VIII abdicated to marry?", choices: ["Wallis Simpson", "Mrs. Keppel", "Camilla", "Diana"], correct: 0 },
  { question: "George VI ruled during?", choices: ["WWI", "WWII", "Cold War", "Boer War"], correct: 1 },
  { question: "Elizabeth II coronation year?", choices: ["1947", "1952", "1953", "1960"], correct: 2 },
  { question: "William the Conqueror won at?", choices: ["Hastings", "Stamford Bridge", "Bosworth", "Agincourt"], correct: 0 },
  { question: "Year of Norman Conquest?", choices: ["1066", "1086", "1100", "1154"], correct: 0 },
  { question: "Magna Carta signed by?", choices: ["Henry II", "Richard I", "John", "Edward I"], correct: 2 },
  { question: "Magna Carta year?", choices: ["1199", "1215", "1265", "1295"], correct: 1 },
  { question: "Richard I was nicknamed?", choices: ["Lionheart", "Longshanks", "Hammer", "Conqueror"], correct: 0 },
  { question: "Wars of the Roses fought between?", choices: ["York & Lancaster", "Tudor & Stuart", "Saxon & Norman", "Scot & English"], correct: 0 },
  { question: "Battle of Bosworth ended which dynasty?", choices: ["Tudor", "Plantagenet", "Stuart", "Hanover"], correct: 1 },
  { question: "Mary I was nicknamed?", choices: ["Bloody Mary", "Virgin Queen", "Good Queen", "Iron Lady"], correct: 0 },
  { question: "Mary Queen of Scots was executed by?", choices: ["Henry VIII", "Mary I", "Elizabeth I", "James I"], correct: 2 },
  { question: "Oliver Cromwell ruled as?", choices: ["King", "Lord Protector", "Regent", "Prime Minister"], correct: 1 },
  { question: "Anne was last monarch of which house?", choices: ["Tudor", "Stuart", "Hanover", "Windsor"], correct: 1 },
  { question: "Act of Union with Scotland?", choices: ["1603", "1707", "1801", "1922"], correct: 1 },
  { question: "Royal House renamed Windsor in?", choices: ["1901", "1917", "1936", "1952"], correct: 1 },
  { question: "Charles III became king in?", choices: ["2020", "2021", "2022", "2023"], correct: 2 },
  { question: "Diana, Princess of Wales died in?", choices: ["1995", "1997", "1999", "2001"], correct: 1 },
  { question: "Henry V won at?", choices: ["Agincourt", "Hastings", "Crecy", "Waterloo"], correct: 0 },
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
