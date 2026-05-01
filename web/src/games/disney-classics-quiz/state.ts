import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DisneyClassicsQuizSettings { questions: "10" | "20" | "30"; }
export interface DisneyClassicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DisneyClassicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was Disney's first animated feature?", choices: ["Snow White and the Seven Dwarfs","Pinocchio","Fantasia","Bambi"], correct: 0 },
  { question: "In what year did Snow White release?", choices: ["1937","1940","1935","1939"], correct: 0 },
  { question: "What 1940 Disney film features Pinocchio?", choices: ["Pinocchio","Fantasia","Bambi","Dumbo"], correct: 0 },
  { question: "What 1941 Disney film features a flying elephant?", choices: ["Dumbo","Bambi","Pinocchio","Fantasia"], correct: 0 },
  { question: "What 1942 Disney film features a deer?", choices: ["Bambi","Dumbo","Pinocchio","Snow White"], correct: 0 },
  { question: "What 1950 Disney film features a mouse?", choices: ["Cinderella","Sleeping Beauty","Snow White","Alice"], correct: 0 },
  { question: "What 1959 Disney film features Aurora?", choices: ["Sleeping Beauty","Cinderella","Snow White","Belle"], correct: 0 },
  { question: "What 1961 Disney film features puppies?", choices: ["101 Dalmatians","Lady and the Tramp","Bambi","Dumbo"], correct: 0 },
  { question: "What 1989 Disney film features Ariel?", choices: ["The Little Mermaid","Beauty and the Beast","Aladdin","Pocahontas"], correct: 0 },
  { question: "What 1991 Disney film features Belle?", choices: ["Beauty and the Beast","Little Mermaid","Aladdin","Pocahontas"], correct: 0 },
  { question: "What 1992 Disney film features a genie?", choices: ["Aladdin","Hercules","Mulan","Tarzan"], correct: 0 },
  { question: "Who voiced Genie in Aladdin (1992)?", choices: ["Robin Williams","Will Smith","Eddie Murphy","Jim Carrey"], correct: 0 },
  { question: "What 1994 Disney film features Simba?", choices: ["The Lion King","Tarzan","Hercules","Mulan"], correct: 0 },
  { question: "Who composed The Lion King songs?", choices: ["Elton John (with Tim Rice)","Alan Menken","Randy Newman","Stephen Schwartz"], correct: 0 },
  { question: "What 1995 Disney film features Pocahontas?", choices: ["Pocahontas","Mulan","Hercules","Tarzan"], correct: 0 },
  { question: "What 1998 Disney film features Mulan?", choices: ["Mulan","Pocahontas","Tarzan","Hercules"], correct: 0 },
  { question: "What 1999 Disney film features Tarzan?", choices: ["Tarzan","Hercules","Mulan","Anastasia"], correct: 0 },
  { question: "What 2009 Disney film features Tiana?", choices: ["The Princess and the Frog","Tangled","Frozen","Brave"], correct: 0 },
  { question: "What 2010 Disney film features Rapunzel?", choices: ["Tangled","Frozen","Princess and the Frog","Brave"], correct: 0 },
  { question: "What 2013 Disney film features Anna and Elsa?", choices: ["Frozen","Tangled","Brave","Moana"], correct: 0 },
  { question: "What's Frozen's hit song?", choices: ["Let It Go","For the First Time in Forever","Both major","Do You Want to Build a Snowman"], correct: 2 },
  { question: "What 2016 Disney film features Moana?", choices: ["Moana","Frozen 2","Encanto","Raya"], correct: 0 },
  { question: "Who voiced Maui in Moana?", choices: ["Dwayne Johnson","Auli'i Cravalho (Moana)","Both","Just Johnson"], correct: 0 },
  { question: "What 2021 Disney film features magical Madrigal family?", choices: ["Encanto","Raya and the Last Dragon","Moana","Tangled"], correct: 0 },
  { question: "What's the song from Encanto that went viral?", choices: ["We Don't Talk About Bruno","Surface Pressure","Both","All went viral"], correct: 2 },
  { question: "Who founded the Walt Disney Company?", choices: ["Walt and Roy Disney","Walt alone","Roy alone","Walt with cousin"], correct: 0 },
  { question: "What's Walt Disney's most famous mascot?", choices: ["Mickey Mouse","Donald Duck","Goofy","Pluto"], correct: 0 },
  { question: "In what year did Mickey first appear?", choices: ["1928","1932","1925","1930"], correct: 0 },
  { question: "What was Mickey's first sound cartoon?", choices: ["Steamboat Willie","Plane Crazy","Gallopin Gaucho","Mickey's Christmas"], correct: 0 },
  { question: "Who's Mickey's girlfriend?", choices: ["Minnie","Daisy","Clarabelle","Lillian"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DisneyClassicsQuizSettings): DisneyClassicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DisneyClassicsQuizState, action: DisneyClassicsQuizAction): DisneyClassicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DisneyClassicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
