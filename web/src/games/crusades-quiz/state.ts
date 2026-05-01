import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CrusadesQuizSettings { questions: "10" | "20" | "30"; }
export interface CrusadesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CrusadesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who called the First Crusade in 1095?", choices: ["Pope Gregory VII","Pope Urban II","Pope Innocent III","Pope Clement III"], correct: 1 },
  { question: "At what council was the First Crusade preached?", choices: ["Nicaea","Clermont","Lateran","Trent"], correct: 1 },
  { question: "What city was the main goal of the First Crusade?", choices: ["Constantinople","Jerusalem","Antioch","Damascus"], correct: 1 },
  { question: "In what year was Jerusalem captured by the First Crusade?", choices: ["1095","1099","1187","1204"], correct: 1 },
  { question: "Who was the first ruler of Jerusalem after the conquest?", choices: ["Godfrey of Bouillon","Bohemond","Raymond IV","Baldwin I"], correct: 0 },
  { question: "What Muslim leader recaptured Jerusalem in 1187?", choices: ["Saladin","Baybars","Suleyman","Nur al-Din"], correct: 0 },
  { question: "What 1187 battle preceded Saladin's capture of Jerusalem?", choices: ["Hattin","Acre","Arsuf","Jaffa"], correct: 0 },
  { question: "Who led the Third Crusade for England?", choices: ["Henry II","Richard the Lionheart","King John","Edward I"], correct: 1 },
  { question: "Who was the King of France during the Third Crusade?", choices: ["Philip II Augustus","Louis IX","Louis VII","Charles V"], correct: 0 },
  { question: "What Holy Roman Emperor drowned during the Third Crusade?", choices: ["Frederick I Barbarossa","Frederick II","Henry VI","Otto IV"], correct: 0 },
  { question: "What city did the Fourth Crusade infamously sack in 1204?", choices: ["Antioch","Jerusalem","Constantinople","Damascus"], correct: 2 },
  { question: "How many major Crusades are typically counted?", choices: ["5","7","9","12"], correct: 2 },
  { question: "What knightly order began as protectors of pilgrims?", choices: ["Templars","Hospitallers","Teutonic Knights","All did"], correct: 3 },
  { question: "What 1212 movement attempted to take the Holy Land?", choices: ["Children's Crusade","Peasants' Crusade","Shepherds' Crusade","Albigensian Crusade"], correct: 0 },
  { question: "What Crusade went against Cathars in southern France?", choices: ["Albigensian","Wendish","Northern","Reconquista"], correct: 0 },
  { question: "What French king led the Seventh Crusade?", choices: ["Philip Augustus","Louis IX","Charles V","Philip IV"], correct: 1 },
  { question: "What Egyptian dynasty ruled when Crusaders attacked Egypt?", choices: ["Fatimid then Ayyubid","Mamluk","Both at different times","Abbasid"], correct: 2 },
  { question: "What 1291 city's fall ended Crusader presence in Holy Land?", choices: ["Acre","Tripoli","Tyre","Antioch"], correct: 0 },
  { question: "What is the Latin name for the Crusader states?", choices: ["Outremer","Levante","Latinopolis","Latin Kingdom"], correct: 0 },
  { question: "What cross symbol did Crusaders wear?", choices: ["Latin cross","Maltese cross","Cross of Lorraine","Various forms"], correct: 3 },
  { question: "What was the People's Crusade?", choices: ["A peasant army that preceded the First Crusade","A 14th-century event","A campaign in Spain","A folkloric tale"], correct: 0 },
  { question: "What Italian city-state ferried the Fourth Crusade?", choices: ["Venice","Genoa","Pisa","Naples"], correct: 0 },
  { question: "What was Saladin's actual name?", choices: ["Yusuf ibn Ayyub","Hassan ibn Ali","Khalid","Mahmud"], correct: 0 },
  { question: "What Muslim dynasty did Saladin found?", choices: ["Ayyubid","Fatimid","Abbasid","Seljuk"], correct: 0 },
  { question: "What 1192 treaty granted pilgrim access to Jerusalem after the Third Crusade?", choices: ["Treaty of Ramla","Treaty of Jaffa","Treaty of Acre","Truce of God"], correct: 1 },
  { question: "What was the chief weapon of medieval knights?", choices: ["Lance","Sword","Mace","All used"], correct: 3 },
  { question: "What seafaring republic competed with Venice during the era?", choices: ["Genoa","Pisa","Both","Florence"], correct: 2 },
  { question: "What Christian power led the Fifth Crusade?", choices: ["Hungary","Holy Roman Empire","Both","Papal states"], correct: 2 },
  { question: "What Mamluk leader expelled the Crusaders?", choices: ["Baybars and others","Saladin","Suleyman","Mehmed II"], correct: 0 },
  { question: "What was the Latin Empire of Constantinople?", choices: ["A Crusader state replacing Byzantium","Byzantine territory","An Italian colony","A papal state"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CrusadesQuizSettings): CrusadesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CrusadesQuizState, action: CrusadesQuizAction): CrusadesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CrusadesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
