import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Q100YearsWarQuizSettings { questions: "10" | "20" | "30"; }
export interface Q100YearsWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Q100YearsWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Between which two countries was the Hundred Years' War fought?", choices: ["England and France","Spain and Portugal","France and Spain","England and Scotland"], correct: 0 },
  { question: "In what year did the Hundred Years' War start?", choices: ["1314","1337","1356","1380"], correct: 1 },
  { question: "In what year did the war end?", choices: ["1415","1429","1453","1485"], correct: 2 },
  { question: "How many years did the war actually last?", choices: ["100","116","75","150"], correct: 1 },
  { question: "Who was the English king when war began?", choices: ["Edward III","Henry V","Richard II","Edward I"], correct: 0 },
  { question: "What 1346 battle was a major English victory?", choices: ["Crecy","Poitiers","Agincourt","Sluys"], correct: 0 },
  { question: "What 1356 battle captured the French king?", choices: ["Crecy","Poitiers","Agincourt","Verneuil"], correct: 1 },
  { question: "What 1415 battle is the war's most famous English victory?", choices: ["Crecy","Poitiers","Agincourt","Castillon"], correct: 2 },
  { question: "Who led England at Agincourt?", choices: ["Henry V","Edward III","Richard II","Henry IV"], correct: 0 },
  { question: "What weapon was crucial to English victories?", choices: ["Longbow","Crossbow","Lance","Poleaxe"], correct: 0 },
  { question: "What French heroine helped lift the siege of Orleans in 1429?", choices: ["Joan of Arc","Catherine of Aragon","Eleanor of Aquitaine","Anne of Brittany"], correct: 0 },
  { question: "How did Joan of Arc die?", choices: ["Burned at stake","Beheaded","In battle","Hanged"], correct: 0 },
  { question: "In what year was Joan of Arc executed?", choices: ["1429","1431","1435","1437"], correct: 1 },
  { question: "What city's siege did Joan famously lift?", choices: ["Paris","Orleans","Reims","Bordeaux"], correct: 1 },
  { question: "What 1453 battle effectively ended the war?", choices: ["Castillon","Formigny","Patay","Verneuil"], correct: 0 },
  { question: "What French dynasty ruled during the war?", choices: ["Valois","Capet","Bourbon","Carolingian"], correct: 0 },
  { question: "What English dynasty ruled during much of the war?", choices: ["Plantagenet","Tudor","Lancaster","Both Plantagenet branches"], correct: 3 },
  { question: "What disease devastated Europe during the war?", choices: ["Black Death","Smallpox","Cholera","Typhus"], correct: 0 },
  { question: "What in what year did the Black Death first hit Europe?", choices: ["1330s","1346","1347","1380s"], correct: 2 },
  { question: "What was the war initially fought over?", choices: ["French throne and territories","Religion","Trade","Colonies"], correct: 0 },
  { question: "What 1360 treaty paused the war?", choices: ["Bretigny","Picquigny","Troyes","Amiens"], correct: 0 },
  { question: "What 1420 treaty made the English king heir to French throne?", choices: ["Troyes","Bretigny","Arras","Amiens"], correct: 0 },
  { question: "Who became French King after the Treaty of Troyes was overturned?", choices: ["Charles VII","Henry VI","Louis XI","Philip VI"], correct: 0 },
  { question: "What was Charles VII nicknamed?", choices: ["The Victorious","The Bold","The Fair","The Mad"], correct: 0 },
  { question: "What region of France was the war's main battleground?", choices: ["Aquitaine and Northern France","Provence","Brittany","Normandy"], correct: 0 },
  { question: "What English territory remained French after the war?", choices: ["Normandy","Aquitaine","Both lost to France","Calais (English till 1558)"], correct: 2 },
  { question: "What French city remained English until 1558?", choices: ["Calais","Bordeaux","Paris","Rouen"], correct: 0 },
  { question: "What innovation in warfare appeared by war's end?", choices: ["Cannons","Gunpowder weapons","Both","Crossbows"], correct: 2 },
  { question: "What free company plagued France between active campaigns?", choices: ["Mercenary bands (routiers)","Monastic orders","Knights Templar","Crusaders"], correct: 0 },
  { question: "What princely Burgundian state often allied with England?", choices: ["Burgundy","Brittany","Flanders","All shifted alliances"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Q100YearsWarQuizSettings): Q100YearsWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Q100YearsWarQuizState, action: Q100YearsWarQuizAction): Q100YearsWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Q100YearsWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
