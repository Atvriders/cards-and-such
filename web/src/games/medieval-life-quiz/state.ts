import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MedievalLifeQuizSettings { questions: "10" | "20" | "30"; }
export interface MedievalLifeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MedievalLifeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What system was the basic medieval social structure?", choices: ["Feudalism","Capitalism","Socialism","Mercantilism"], correct: 0 },
  { question: "What was a serf?", choices: ["A merchant","A peasant tied to the land","A knight","A monk"], correct: 1 },
  { question: "What was the medieval common land of a manor called?", choices: ["Demesne","Common","Glebe","Toft"], correct: 0 },
  { question: "What was the lord's portion of land called?", choices: ["Demesne","Fief","Manor","Estate"], correct: 0 },
  { question: "What was a fief?", choices: ["A weapon","Land granted in exchange for service","A monastery","A taxation district"], correct: 1 },
  { question: "What did peasants pay the church called?", choices: ["Tithe","Tax","Rent","Tribute"], correct: 0 },
  { question: "What was a fortified noble residence?", choices: ["Castle","Manor","Tower","All depending on era"], correct: 3 },
  { question: "What language did educated medieval Europeans use for writing?", choices: ["Latin","Greek","Old English","French"], correct: 0 },
  { question: "What did monks do in scriptoria?", choices: ["Copy manuscripts","Pray","Cook","Fight"], correct: 0 },
  { question: "What disease killed about a third of Europe's population in 1347-51?", choices: ["Black Death","Smallpox","Influenza","Tuberculosis"], correct: 0 },
  { question: "What was a young noble training to be a knight called?", choices: ["Page then squire","Apprentice","Acolyte","Footman"], correct: 0 },
  { question: "What ceremony made a man a knight?", choices: ["Dubbing","Coronation","Investiture","Ordination"], correct: 0 },
  { question: "What armor was developed late medieval?", choices: ["Plate armor","Chainmail","Leather","All used"], correct: 3 },
  { question: "What was a chivalric code?", choices: ["Knightly behavior code","Trade rules","Religious laws","Coronation ritual"], correct: 0 },
  { question: "What was the medieval staple food?", choices: ["Bread","Rice","Pasta","Maize"], correct: 0 },
  { question: "What heavy plow improved farming?", choices: ["Mouldboard plow","Wheelbarrow plow","Steam plow","Iron plow"], correct: 0 },
  { question: "What 3-field system replaced 2-field?", choices: ["Three-field rotation","Pasturage","Open-field","Enclosed field"], correct: 0 },
  { question: "What was a Gothic style associated with?", choices: ["Cathedrals","Castles","Manor houses","All buildings"], correct: 0 },
  { question: "What is a flying buttress?", choices: ["External arched support","Window","Throne","Cellar"], correct: 0 },
  { question: "What were medieval merchant guilds for?", choices: ["Trade regulation and protection","Religious gatherings","Knightly orders","Tax collection"], correct: 0 },
  { question: "What was the medieval drink for many ages?", choices: ["Ale","Mead","Wine","All common"], correct: 3 },
  { question: "What religious group lived austere lives in monasteries?", choices: ["Monks","Nuns","Both","Friars"], correct: 2 },
  { question: "What was the most common medieval livestock?", choices: ["Cattle","Pigs","Sheep","All raised"], correct: 3 },
  { question: "What was a medieval town wall's main purpose?", choices: ["Defense","Tax collection point","Both","Decoration"], correct: 2 },
  { question: "What was the universal medieval Christian church?", choices: ["Catholic","Eastern Orthodox","Protestant","Both Catholic and Orthodox split"], correct: 3 },
  { question: "What 1054 event split Christianity?", choices: ["Great Schism","Reformation","Investiture","Crusades"], correct: 0 },
  { question: "What did medieval doctors balance?", choices: ["Humors","Elements","Energies","Spirits"], correct: 0 },
  { question: "What was a barbican in a castle?", choices: ["Outer gateway tower","Inner keep","Drawbridge","Moat"], correct: 0 },
  { question: "What was the medieval marketplace day called?", choices: ["Market day","Fair","Both","Holy day"], correct: 2 },
  { question: "What was a fool or jester role?", choices: ["Entertainer at court","Soldier","Priest","Cook"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MedievalLifeQuizSettings): MedievalLifeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MedievalLifeQuizState, action: MedievalLifeQuizAction): MedievalLifeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MedievalLifeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
