import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface PopesState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type PopesAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface PopesSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Who is considered the first pope of the Catholic Church?", choices:["Paul","Peter","Clement","Linus"], correct:1 },
  { question:"Which pope called the First Crusade in 1095?", choices:["Gregory VII","Urban II","Innocent III","Leo IX"], correct:1 },
  { question:"Which pope commissioned Michelangelo to paint the Sistine Chapel ceiling?", choices:["Julius II","Leo X","Alexander VI","Sixtus IV"], correct:0 },
  { question:"Which pope oversaw the Council of Trent beginning the Counter-Reformation?", choices:["Paul III","Julius III","Clement VII","Adrian VI"], correct:0 },
  { question:"Who was the first pope to take the name 'Francis' in 2013?", choices:["Benedict XVI","John Paul III","Francis I","Jorge Mario Bergoglio"], correct:3 },
  { question:"Pope John Paul II was from which country?", choices:["Italy","Germany","Poland","Spain"], correct:2 },
  { question:"Which pope issued the Papal Bull dividing the New World between Spain and Portugal?", choices:["Alexander VI","Julius II","Leo X","Clement VII"], correct:0 },
  { question:"Which pope declared papal infallibility at the First Vatican Council (1870)?", choices:["Pius VIII","Pius IX","Leo XIII","Gregory XVI"], correct:1 },
  { question:"Who was the longest-reigning pope in history?", choices:["Pius IX","Leo XIII","John Paul II","Gregory I"], correct:0 },
  { question:"Pope Gregory I is called 'the Great' and is credited with?", choices:["The Crusades","Gregorian Chant and mission to England","Sistine Chapel","The Inquisition"], correct:1 },
  { question:"Which pope excommunicated Martin Luther?", choices:["Julius II","Leo X","Clement VII","Paul III"], correct:1 },
  { question:"Pope Innocent III was a powerful figure in which century?", choices:["10th","11th","13th","15th"], correct:2 },
  { question:"Which pope convened the Second Vatican Council (1962-65)?", choices:["John XXIII","Paul VI","John Paul I","Pius XII"], correct:0 },
  { question:"Which pope was captured by Napoleon and held prisoner?", choices:["Pius VI","Pius VII","Leo XII","Pius VIII"], correct:1 },
  { question:"The Avignon Papacy (1309-1377) meant popes resided in?", choices:["Spain","France","Italy","Germany"], correct:1 },
  { question:"Which antipope controversy split the church in the Great Schism of 1054?", choices:["East-West Schism with Orthodoxy","Western Schism with competing popes","Protestant Reformation","Avignon papacy"], correct:0 },
  { question:"Pope Leo I ('the Great') negotiated with which Hun leader?", choices:["Gaiseric","Attila","Odoacer","Theodoric"], correct:1 },
  { question:"Which pope issued the decree Unam Sanctam claiming supreme authority over kings?", choices:["Gregory IX","Innocent III","Boniface VIII","Clement V"], correct:2 },
  { question:"The papal states were territories in which country?", choices:["Spain","France","Italy","Greece"], correct:2 },
  { question:"Pope John Paul I held the papacy for how long?", choices:["33 days","6 months","1 year","3 years"], correct:0 },
  { question:"Pope Benedict XVI was the first pope in nearly 600 years to?", choices:["Travel outside Italy","Resign","Visit the United States","Canonize a non-European"], correct:1 },
  { question:"Which pope ended Roman persecution of Christians with the Edict of Milan?", choices:["Sylvester I (by Constantine's decree)","Gregory I","Clement I","Pius I"], correct:0 },
  { question:"The Vatican City became an independent state under which treaty in 1929?", choices:["Treaty of Rome","Lateran Treaty","Concordat of Worms","Treaty of Westphalia"], correct:1 },
  { question:"Which pope created the Congregation for the Doctrine of the Faith (formerly Inquisition)?", choices:["Clement VII","Paul III","Pius V","Sixtus V"], correct:1 },
  { question:"Pope Stephen VI famously put the corpse of which previous pope on trial?", choices:["Formosus","Adrian II","John VIII","Nicholas I"], correct:0 },
  { question:"Which pope canonized Joan of Arc?", choices:["Leo XIII","Pius X","Benedict XV","Pius XI"], correct:1 },
  { question:"Pope Francis's real name before becoming pope is?", choices:["Carlos Bergoglio","Jorge Mario Bergoglio","Antonio Bergoglio","Luis Bergoglio"], correct:1 },
  { question:"Which pope was known as 'God's Rottweiler' before becoming Benedict XVI?", choices:["Cardinal Ratzinger","Cardinal Bertone","Cardinal Sodano","Cardinal Schönborn"], correct:0 },
  { question:"Pope Leo X's sale of indulgences directly triggered?", choices:["The Crusades","The Protestant Reformation","The Inquisition","The Great Schism"], correct:1 },
  { question:"The Papal encyclical 'Rerum Novarum' (1891) by Leo XIII addressed?", choices:["War and peace","Workers' rights and capitalism","Astronomy and science","Marriage and family"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:PopesSettings):PopesState {
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

export function reducer(state:PopesState, action:PopesAction):PopesState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:PopesState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
