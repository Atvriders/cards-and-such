import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreekMythQuizSettings { questions: "10" | "20" | "30"; }
export interface GreekMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreekMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is the king of the Greek gods?", choices: ["Zeus","Apollo","Hades","Ares"], correct: 0 },
  { question: "Who is the queen of the Greek gods?", choices: ["Hera","Aphrodite","Athena","Artemis"], correct: 0 },
  { question: "Who's the god of the sea?", choices: ["Poseidon","Zeus","Hades","Apollo"], correct: 0 },
  { question: "Who's the god of the underworld?", choices: ["Hades","Poseidon","Apollo","Hermes"], correct: 0 },
  { question: "Who's the goddess of love?", choices: ["Aphrodite","Hera","Athena","Artemis"], correct: 0 },
  { question: "Who's the goddess of wisdom?", choices: ["Athena","Hera","Aphrodite","Artemis"], correct: 0 },
  { question: "Who's the god of war?", choices: ["Ares","Hades","Apollo","Hermes"], correct: 0 },
  { question: "Who's the god of music and prophecy?", choices: ["Apollo","Hermes","Dionysus","Ares"], correct: 0 },
  { question: "Who's the goddess of the hunt?", choices: ["Artemis","Athena","Aphrodite","Hera"], correct: 0 },
  { question: "Who's the messenger of the gods?", choices: ["Hermes","Apollo","Ares","Iris"], correct: 0 },
  { question: "Who's the god of fire and forge?", choices: ["Hephaestus","Apollo","Ares","Hermes"], correct: 0 },
  { question: "Who's the god of wine?", choices: ["Dionysus","Apollo","Hermes","Pan"], correct: 0 },
  { question: "What does the Trojan Horse symbolize?", choices: ["Greek deception in Troy War","Just a horse","Both","Just symbol"], correct: 2 },
  { question: "Who was Helen of Troy?", choices: ["Most beautiful woman, cause of Trojan War","Just queen","Both","Just beauty"], correct: 2 },
  { question: "Who killed Hector?", choices: ["Achilles","Paris","Odysseus","Ajax"], correct: 0 },
  { question: "Who killed Achilles?", choices: ["Paris (with Apollo's help)","Hector","Just Paris","Both"], correct: 0 },
  { question: "What was Achilles' weak spot?", choices: ["His heel","His back","His arm","His knee"], correct: 0 },
  { question: "Who's the hero of the Odyssey?", choices: ["Odysseus","Achilles","Hector","Paris"], correct: 0 },
  { question: "How long did Odysseus take to return home?", choices: ["10 years","5 years","20 years","2 years"], correct: 0 },
  { question: "Who's Odysseus's wife?", choices: ["Penelope","Calypso","Circe","Helen"], correct: 0 },
  { question: "What hero killed the Minotaur?", choices: ["Theseus","Hercules","Perseus","Jason"], correct: 0 },
  { question: "What did Theseus use to find his way out of the labyrinth?", choices: ["Thread (Ariadne's)","Map","Sword","Magic"], correct: 0 },
  { question: "Who killed Medusa?", choices: ["Perseus","Theseus","Hercules","Bellerophon"], correct: 0 },
  { question: "How many Labors did Hercules perform?", choices: ["12","10","7","9"], correct: 0 },
  { question: "Who flew too close to the sun?", choices: ["Icarus","Daedalus","Phaethon","Helios"], correct: 0 },
  { question: "What was Pandora's gift that brought evil?", choices: ["The box (jar) she opened","Apple","Mirror","Sword"], correct: 0 },
  { question: "Who tried to ferry souls across Styx?", choices: ["Charon","Hades","Hermes","Persephone"], correct: 0 },
  { question: "Who's the three-headed dog guarding the underworld?", choices: ["Cerberus","Orthrus","Hydra","Just Cerberus"], correct: 0 },
  { question: "What was the Trojan War triggered by?", choices: ["Paris taking Helen","Greek invasion","Both","Just dispute"], correct: 2 },
  { question: "Who's the seer who couldn't be believed?", choices: ["Cassandra","Tiresias","Apollo","Pythia"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreekMythQuizSettings): GreekMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreekMythQuizState, action: GreekMythQuizAction): GreekMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreekMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
