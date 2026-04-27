import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MysteryNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface MysteryNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MysteryNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'Murder on the Orient Express'?", choices: ["Doyle","Christie","Sayers","Chandler"], correct: 1 },
  { question: "Hercule Poirot was created by?", choices: ["Doyle","Christie","Sayers","James"], correct: 1 },
  { question: "Miss Marple was created by?", choices: ["Christie","Sayers","James","Allingham"], correct: 0 },
  { question: "Sherlock Holmes was created by?", choices: ["Doyle","Christie","Chesterton","Stevenson"], correct: 0 },
  { question: "Sherlock Holmes lives at?", choices: ["222B","221B Baker Street","123 Baker St.","Reichenbach"], correct: 1 },
  { question: "Holmes's archenemy?", choices: ["Moran","Moriarty","Adler","Lestrade"], correct: 1 },
  { question: "Holmes's loyal companion?", choices: ["Mycroft","Watson","Hudson","Lestrade"], correct: 1 },
  { question: "Who wrote 'The Hound of the Baskervilles'?", choices: ["Doyle","Christie","Stoker","Wilkie Collins"], correct: 0 },
  { question: "Father Brown was created by?", choices: ["Chesterton","Doyle","Christie","Allingham"], correct: 0 },
  { question: "Lord Peter Wimsey was created by?", choices: ["Sayers","Christie","James","Allingham"], correct: 0 },
  { question: "Albert Campion was created by?", choices: ["Allingham","Sayers","James","Marsh"], correct: 0 },
  { question: "Adam Dalgliesh was created by?", choices: ["P.D. James","Rendell","Marsh","James"], correct: 0 },
  { question: "Inspector Wexford was created by?", choices: ["Rendell","James","Hill","Mosley"], correct: 0 },
  { question: "Inspector Morse was created by?", choices: ["Dexter","Rendell","Rankin","Hill"], correct: 0 },
  { question: "Inspector Rebus was created by?", choices: ["Rankin","Dexter","Hill","McDermid"], correct: 0 },
  { question: "Who wrote 'The Maltese Falcon'?", choices: ["Hammett","Chandler","Cain","Macdonald"], correct: 0 },
  { question: "Sam Spade is the detective in?", choices: ["The Big Sleep","The Maltese Falcon","Red Harvest","Farewell My Lovely"], correct: 1 },
  { question: "Philip Marlowe was created by?", choices: ["Hammett","Chandler","Cain","Macdonald"], correct: 1 },
  { question: "Who wrote 'The Big Sleep'?", choices: ["Hammett","Chandler","Cain","Macdonald"], correct: 1 },
  { question: "Lew Archer was created by?", choices: ["Hammett","Chandler","Macdonald","Cain"], correct: 2 },
  { question: "Who wrote 'The Postman Always Rings Twice'?", choices: ["Cain","Hammett","Chandler","Goodis"], correct: 0 },
  { question: "Travis McGee was created by?", choices: ["MacDonald","Hammett","Chandler","Macdonald"], correct: 0 },
  { question: "Who wrote 'Mystic River' (2001)?", choices: ["Lehane","King","Connelly","Patterson"], correct: 0 },
  { question: "Harry Bosch was created by?", choices: ["Connelly","Patterson","Grafton","Paretsky"], correct: 0 },
  { question: "Kinsey Millhone (alphabet series) was created by?", choices: ["Grafton","Paretsky","Cornwell","Reichs"], correct: 0 },
  { question: "Kay Scarpetta was created by?", choices: ["Cornwell","Reichs","Grafton","Paretsky"], correct: 0 },
  { question: "Who wrote 'The Silence of the Lambs'?", choices: ["Harris","Koontz","King","Patterson"], correct: 0 },
  { question: "Hannibal Lecter was created by?", choices: ["Harris","King","Koontz","Block"], correct: 0 },
  { question: "Who wrote 'Misery'?", choices: ["King","Koontz","Patterson","Harris"], correct: 0 },
  { question: "Who wrote 'The Shining'?", choices: ["King","Koontz","Straub","Barker"], correct: 0 },
  { question: "Who wrote 'Carrie'?", choices: ["King","Koontz","Straub","Barker"], correct: 0 },
  { question: "Who wrote 'It'?", choices: ["King","Straub","Barker","Koontz"], correct: 0 },
  { question: "Stieg Larsson wrote about?", choices: ["Lisbeth Salander","Harry Hole","Wallander","Erika"], correct: 0 },
  { question: "Henning Mankell created which detective?", choices: ["Wallander","Hole","Salander","Erlendur"], correct: 0 },
  { question: "Jo Nesbo created?", choices: ["Harry Hole","Wallander","Erlendur","Beck"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MysteryNovelsQuizSettings): MysteryNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MysteryNovelsQuizState, action: MysteryNovelsQuizAction): MysteryNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MysteryNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
