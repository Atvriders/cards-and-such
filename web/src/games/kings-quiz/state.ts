import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface KingsState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type KingsAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface KingsSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Which English king signed the Magna Carta in 1215?", choices:["Richard I","Henry III","John I","Edward I"], correct:2 },
  { question:"Charlemagne was crowned Emperor of the Romans in which year?", choices:["750","768","800","814"], correct:2 },
  { question:"Which French king built the Palace of Versailles?", choices:["Louis XIII","Louis XIV","Louis XV","Louis XVI"], correct:1 },
  { question:"Henry VIII of England had how many wives?", choices:["4","5","6","7"], correct:2 },
  { question:"Which king of England was killed at the Battle of Hastings in 1066?", choices:["Edward the Confessor","Harold II","William I","Athelstan"], correct:1 },
  { question:"Ramesses II (the Great) was a pharaoh of which dynasty?", choices:["New Kingdom 19th Dynasty","Old Kingdom 4th Dynasty","Middle Kingdom 12th Dynasty","Late Period 26th Dynasty"], correct:0 },
  { question:"Which Macedonian king conquered the Persian Empire?", choices:["Philip II","Antigonus","Ptolemy","Alexander III (the Great)"], correct:3 },
  { question:"Ashoka the Great was an emperor of which Indian dynasty?", choices:["Gupta","Maurya","Mughal","Chola"], correct:1 },
  { question:"Which Ottoman sultan ordered the conquest of Constantinople?", choices:["Suleiman the Magnificent","Selim I","Mehmed II","Bayezid I"], correct:2 },
  { question:"Richard I of England was nicknamed?", choices:["The Conqueror","The Lionheart","The Confessor","The Bold"], correct:1 },
  { question:"Frederick the Great was king of which state?", choices:["Austria","Bavaria","Prussia","Saxony"], correct:2 },
  { question:"Which English king was known as the Confessor and built Westminster Abbey?", choices:["Edward I","Ethelred the Unready","Alfred the Great","Edward the Confessor"], correct:3 },
  { question:"Alfred the Great defended England against which invaders?", choices:["Normans","Franks","Vikings","Romans"], correct:2 },
  { question:"Cyrus the Great founded which empire?", choices:["Babylonian","Achaemenid Persian","Assyrian","Median"], correct:1 },
  { question:"Which Aztec ruler was conquered by Cortés?", choices:["Itzcoatl","Tlacaelel","Moctezuma II","Cuauhtémoc"], correct:2 },
  { question:"Kublai Khan was the founder of which Chinese dynasty?", choices:["Tang","Song","Yuan","Ming"], correct:2 },
  { question:"Louis IX of France was also known as?", choices:["Louis the Bold","Saint Louis","Louis the Great","Louis the Pious"], correct:1 },
  { question:"Which English king was executed in 1649?", choices:["Charles I","Charles II","James I","James II"], correct:0 },
  { question:"Atilla the Hun's empire reached its peak in which century?", choices:["3rd","4th","5th","6th"], correct:2 },
  { question:"Which king of Scotland was defeated at Culloden in 1746?", choices:["James VI","Bonnie Prince Charlie (Charles Edward Stuart)","Robert the Bruce","William Wallace"], correct:1 },
  { question:"Philip II of Spain sent the Armada against which country?", choices:["France","England","Netherlands","Portugal"], correct:1 },
  { question:"Which Mughal emperor built the Taj Mahal?", choices:["Akbar","Jahangir","Shah Jahan","Aurangzeb"], correct:2 },
  { question:"Saladin was the sultan who recaptured Jerusalem from the Crusaders in?", choices:["1099","1145","1187","1212"], correct:2 },
  { question:"Which English king won the Battle of Agincourt?", choices:["Henry V","Edward III","Richard III","Henry IV"], correct:0 },
  { question:"Montezuma I expanded which empire significantly?", choices:["Mayan","Incan","Aztec","Zapotec"], correct:2 },
  { question:"Peter the Great modernized which empire?", choices:["Ottoman","Austro-Hungarian","Russian","Swedish"], correct:2 },
  { question:"Which king united the kingdoms of Scotland and England as James I of England?", choices:["James IV of Scotland","James V of Scotland","James VI of Scotland","James II of England"], correct:2 },
  { question:"Nebuchadnezzar II is associated with which ancient city?", choices:["Nineveh","Ur","Babylon","Memphis"], correct:2 },
  { question:"Which Zulu king founded the Zulu Kingdom in the early 19th century?", choices:["Cetshwayo","Dingane","Shaka","Mpande"], correct:2 },
  { question:"King Tutankhamun became pharaoh at approximately what age?", choices:["5","9","14","18"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:KingsSettings):KingsState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:KingsState, action:KingsAction):KingsState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:KingsState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
