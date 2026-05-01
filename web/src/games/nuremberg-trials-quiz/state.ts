import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NurembergTrialsQuizSettings { questions: "10" | "20" | "30"; }
export interface NurembergTrialsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NurembergTrialsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Nuremberg Trials began in?", choices: ["1944","1945","1946","1947"], correct: 1 },
  { question: "Trials were held in which German city?", choices: ["Berlin","Munich","Nuremberg","Frankfurt"], correct: 2 },
  { question: "The chief U.S. prosecutor was?", choices: ["Robert Jackson","Earl Warren","Henry Stimson","George Marshall"], correct: 0 },
  { question: "The first major trial is abbreviated as?", choices: ["IMT","ICC","NATO","ICJ"], correct: 0 },
  { question: "IMT stands for?", choices: ["International Military Tribunal","Inter-Military Treaty","International Maritime Trust","Internal Military Trial"], correct: 0 },
  { question: "Hermann Goering was?", choices: ["Acquitted","Convicted (suicide before execution)","Executed normally","Pardoned"], correct: 1 },
  { question: "Rudolf Hess was?", choices: ["Executed","Sentenced to life","Acquitted","Pardoned"], correct: 1 },
  { question: "Trials were held in which courthouse?", choices: ["Palace of Justice","City Hall","Reichstag","Hofburg"], correct: 0 },
  { question: "The four prosecuting nations were?", choices: ["US, UK, France, USSR","US, UK, Canada, USSR","US, UK, France, Italy","US, UK, Australia, France"], correct: 0 },
  { question: "Major war criminals were charged with?", choices: ["Crimes against peace","War crimes","Crimes against humanity","All of these"], correct: 3 },
  { question: "Hitler was?", choices: ["Tried at Nuremberg","Already dead before the trials","Acquitted","Sentenced in absentia"], correct: 1 },
  { question: "Joachim von Ribbentrop was Germany's?", choices: ["Foreign Minister","Air Marshal","Chancellor","Banker"], correct: 0 },
  { question: "How many defendants were in the first IMT trial?", choices: ["12","18","22","30"], correct: 2 },
  { question: "How many were sentenced to death in the first IMT trial?", choices: ["8","10","12","15"], correct: 2 },
  { question: "Albert Speer was sentenced to?", choices: ["Death","20 years","Life","Acquittal"], correct: 1 },
  { question: "The Doctors' Trial concerned?", choices: ["Medical experiments on prisoners","Black market drugs","Civilian medicine","Veterinary work"], correct: 0 },
  { question: "The Doctors' Trial led to?", choices: ["The Nuremberg Code","The Geneva Convention","The Hague Convention","The UN Charter"], correct: 0 },
  { question: "The Nuremberg Code addresses?", choices: ["Informed consent in medical research","Trade rules","Air travel","Banking"], correct: 0 },
  { question: "'Just following orders' is also called?", choices: ["Superior orders defense","Self defense","Necessity","Insanity defense"], correct: 0 },
  { question: "The judges were drawn from?", choices: ["The four Allied powers","Only the US","Only Germans","Neutrals"], correct: 0 },
  { question: "The IMT trial began in November of?", choices: ["1944","1945","1946","1947"], correct: 1 },
  { question: "The first major trial verdicts came in?", choices: ["October 1946","June 1945","January 1947","May 1948"], correct: 0 },
  { question: "Subsequent Nuremberg trials were conducted by?", choices: ["The US alone","The UK alone","The USSR alone","All four powers jointly"], correct: 0 },
  { question: "Martin Bormann was tried?", choices: ["In person","In absentia","Not at all","After surrender"], correct: 1 },
  { question: "Julius Streicher published which paper?", choices: ["Der Sturmer","Volkischer Beobachter","Das Reich","Pravda"], correct: 0 },
  { question: "Karl Doenitz was briefly?", choices: ["Hitler's successor","An SS officer","A doctor","A judge"], correct: 0 },
  { question: "Hans Frank governed?", choices: ["Occupied Poland","Norway","France","Belgium"], correct: 0 },
  { question: "Defendants sentenced to death were executed by?", choices: ["Firing squad","Hanging","Gas","Lethal injection"], correct: 1 },
  { question: "The chief British prosecutor was?", choices: ["Hartley Shawcross","Winston Churchill","Anthony Eden","Clement Attlee"], correct: 0 },
  { question: "The Nuremberg principles influenced the founding of?", choices: ["The ICC at The Hague","NATO","NAFTA","WTO"], correct: 0 },
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
