import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Mi6QuizSettings { questions: "10" | "20"; }
export interface Mi6QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Mi6QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "MI6 is officially known as?", "choices": ["SIS", "GCHQ", "MI5", "DI"], "correct": 0},
  {"question": "MI6 handles which type of intelligence?", "choices": ["Foreign", "Domestic", "Signals", "Military"], "correct": 0},
  {"question": "MI6 headquarters is at?", "choices": ["Vauxhall Cross", "Thames House", "Cheltenham", "Whitehall"], "correct": 0},
  {"question": "First chief of SIS?", "choices": ["Mansfield Cumming", "Stewart Menzies", "Dick White", "Maurice Oldfield"], "correct": 0},
  {"question": "'C' is the title of?", "choices": ["MI6 Chief", "MI5 Chief", "GCHQ Director", "Cabinet Sec"], "correct": 0},
  {"question": "Why is the chief called 'C'?", "choices": ["Cumming's initial", "Chief", "Cipher", "Crown"], "correct": 0},
  {"question": "MI6 was founded in?", "choices": ["1909", "1916", "1939", "1945"], "correct": 0},
  {"question": "MI5 vs MI6: MI5 handles?", "choices": ["Domestic security", "Foreign", "Signals", "Cyber"], "correct": 0},
  {"question": "Which writer worked for SIS in WWII?", "choices": ["Graham Greene", "George Orwell", "Evelyn Waugh", "Kingsley Amis"], "correct": 0},
  {"question": "Ian Fleming worked for which UK service?", "choices": ["Naval Intelligence", "SIS", "SOE", "MI5"], "correct": 0},
  {"question": "Kim Philby led which SIS section?", "choices": ["Soviet counterintel", "Africa", "Far East", "Italy"], "correct": 0},
  {"question": "Year MI6 was officially avowed by UK gov?", "choices": ["1994", "1985", "2001", "2010"], "correct": 0},
  {"question": "Which Act provided MI6 statutory basis?", "choices": ["Intelligence Services Act 1994", "Official Secrets Act", "Security Service Act", "Police Act"], "correct": 0},
  {"question": "Famous MI6 defector to USSR with Cambridge ring?", "choices": ["Philby", "Burgess", "Maclean", "Blunt"], "correct": 0},
  {"question": "MI6 officer who escaped UK prison after spying for USSR?", "choices": ["George Blake", "Philby", "Cairncross", "Vassall"], "correct": 0},
  {"question": "MI6 chief who exfiltrated Gordievsky?", "choices": ["Christopher Curwen", "Maurice Oldfield", "Colin McColl", "John Scarlett"], "correct": 0},
  {"question": "First female 'C' nominated in?", "choices": ["Not yet", "2020", "2014", "1999"], "correct": 0},
  {"question": "Which MI6 chief was caricatured as 'M'?", "choices": ["Stewart Menzies", "Mansfield Cumming", "Dick White", "Maurice Oldfield"], "correct": 0},
  {"question": "Real-life basis for John le Carre's Smiley?", "choices": ["Maurice Oldfield", "Dick White", "Both", "Menzies"], "correct": 2},
  {"question": "Le Carre worked for which UK service?", "choices": ["MI5 then MI6", "MI6", "MI5", "GCHQ"], "correct": 0},
  {"question": "MI6 officer found dead in a bag in 2010?", "choices": ["Gareth Williams", "David Kelly", "Litvinenko", "Skripal"], "correct": 0},
  {"question": "Skripal poisoning in 2018 occurred in?", "choices": ["Salisbury", "London", "Manchester", "Cardiff"], "correct": 0},
  {"question": "Sergei Skripal had spied for which service?", "choices": ["MI6", "CIA", "BND", "DGSE"], "correct": 0},
  {"question": "Litvinenko worked for which Russian service before defection?", "choices": ["FSB", "KGB", "SVR", "GRU"], "correct": 0},
  {"question": "MI6 station chief in Moscow during Penkovsky case?", "choices": ["Roderick Chisholm", "Greville Wynne", "Maurice Oldfield", "Dickie Franks"], "correct": 0},
  {"question": "Greville Wynne's role with Penkovsky?", "choices": ["Courier", "Recruiter", "Trainer", "Defector"], "correct": 0},
  {"question": "MI6 cooperated with US OSS via?", "choices": ["Stephenson's BSC", "Camp X", "Both", "Bletchley"], "correct": 2},
  {"question": "Which MI6 chief led UK SIS during WWII?", "choices": ["Stewart Menzies", "Mansfield Cumming", "Dick White", "Maurice Oldfield"], "correct": 0},
  {"question": "UK signals intel partner of MI6?", "choices": ["GCHQ", "NSA", "DI", "BND"], "correct": 0},
  {"question": "Five Eyes partners include?", "choices": ["UK,US,CA,AU,NZ", "UK,US,FR,DE,IT", "UK,US,JP,KR,IN", "UK,US,IL,SA,AU"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Mi6QuizSettings): Mi6QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Mi6QuizState, action: Mi6QuizAction): Mi6QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Mi6QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
