import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NurembergTrialsQuizSettings { questions: "10" | "20" | "30"; }
export interface NurembergTrialsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NurembergTrialsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Nuremberg Trials began in?", choices: ["1944","1945","1946","1947"], correct: 1 },
  { question: "Trials were held in?", choices: ["Berlin","Munich","Nuremberg","Frankfurt"], correct: 2 },
  { question: "The chief U.S. prosecutor was?", choices: ["Robert Jackson","Earl Warren","Henry Stimson","George Marshall"], correct: 0 },
  { question: "The first major trial is called?", choices: ["IMT","ICC","NATO","ICJ"], correct: 0 },
  { question: "IMT stands for?", choices: ["Int'l Military Tribunal","Int'l Mediation Tribunal","Internal Military Trial","Independent Military Tribunal"], correct: 0 },
  { question: "Hermann Göring was?", choices: ["Allowed to escape","Sentenced and committed suicide","Acquitted","Released"], correct: 1 },
  { question: "Rudolf Hess received what sentence?", choices: ["Death","Life","20 years","10 years"], correct: 1 },
  { question: "Albert Speer received what sentence?", choices: ["20 years","Life","Death","Acquitted"], correct: 0 },
  { question: "Joachim von Ribbentrop was?", choices: ["Hanged","Imprisoned","Acquitted","Suicide"], correct: 0 },
  { question: "Karl Dönitz received what sentence?", choices: ["Life","10 years","20 years","Death"], correct: 1 },
  { question: "The Doctors' Trial concerned?", choices: ["Medical experiments","Tax fraud","Radio broadcasts","Diplomacy"], correct: 0 },
  { question: "Crimes against humanity was first formally tried at?", choices: ["Versailles","Nuremberg","Tokyo","The Hague"], correct: 1 },
  { question: "Tokyo Trials prosecuted leaders of?", choices: ["Germany","Japan","Italy","Hungary"], correct: 1 },
  { question: "How many defendants in the main IMT trial?", choices: ["12","21","24","36"], correct: 2 },
  { question: "How many were sentenced to death in main IMT?", choices: ["6","8","12","15"], correct: 2 },
  { question: "Translation at Nuremberg used what tech?", choices: ["Written summaries","Simultaneous interpretation","Telegraphs","Sign language"], correct: 1 },
  { question: "Trial languages included English, Russian, French and?", choices: ["German","Italian","Spanish","Japanese"], correct: 0 },
  { question: "The Nuremberg Code resulted from?", choices: ["Doctors' Trial","Main IMT","Tokyo trials","ICC"], correct: 0 },
  { question: "The Nuremberg Code concerns?", choices: ["War crimes","Medical research ethics","Trade","Immigration"], correct: 1 },
  { question: "Trials were held at?", choices: ["Reichstag","Palace of Justice","Reichschancellery","Pergamon"], correct: 1 },
  { question: "Allied powers prosecuting were US, UK, France, and?", choices: ["USSR","Italy","Canada","Australia"], correct: 0 },
  { question: "Hans Frank was Governor-General of?", choices: ["Poland","France","Belgium","Norway"], correct: 0 },
  { question: "Julius Streicher published?", choices: ["Der Stürmer","Der Spiegel","Bild","Die Zeit"], correct: 0 },
  { question: "Defendant Robert Ley?", choices: ["Was hanged","Committed suicide before trial","Was acquitted","Escaped"], correct: 1 },
  { question: "Subsequent Nuremberg trials totaled how many?", choices: ["3","6","9","12"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NurembergTrialsQuizSettings): NurembergTrialsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NurembergTrialsQuizState, action: NurembergTrialsQuizAction): NurembergTrialsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NurembergTrialsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
