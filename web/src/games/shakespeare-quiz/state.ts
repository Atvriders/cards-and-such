import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface ShakespeareQuizSettings { questions: "10" | "20" | "30"; }
export interface ShakespeareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShakespeareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In which play does Lady Macbeth appear?", choices: ["Hamlet", "Macbeth", "King Lear", "Othello"], correct: 1, explanation: "Lady Macbeth is the ambitious wife who urges her husband to murder King Duncan." },
  { question: "Who is the ghost that appears to Hamlet?", choices: ["Claudius", "Polonius", "King Hamlet (his father)", "Fortinbras"], correct: 2, explanation: "Hamlet's father, the murdered king, appears as a ghost demanding revenge against Claudius." },
  { question: "Which play contains the line 'A horse, a horse! my kingdom for a horse'?", choices: ["Henry V", "Richard III", "Macbeth", "King John"], correct: 1, explanation: "Richard III cries this at Bosworth Field, having lost his horse during the climactic battle." },
  { question: "Romeo and Juliet is set in which Italian city?", choices: ["Florence", "Verona", "Rome", "Venice"], correct: 1, explanation: "The play is set in fair Verona, where the Montagues and Capulets feud." },
  { question: "Who is the moor at the centre of Othello?", choices: ["Iago", "Cassio", "Othello", "Roderigo"], correct: 2, explanation: "Othello, a Moorish general in the Venetian army, is destroyed by Iago's manipulations." },
  { question: "In King Lear, how many daughters does Lear have?", choices: ["Two", "Three", "Four", "One"], correct: 1, explanation: "Lear has three daughters: Goneril, Regan, and Cordelia, whom he disastrously tests for love." },
  { question: "Which play features the fairies Oberon and Titania?", choices: ["The Tempest", "A Midsummer Night's Dream", "As You Like It", "Twelfth Night"], correct: 1, explanation: "A Midsummer Night's Dream's fairy king and queen quarrel over a changeling boy." },
  { question: "Prospero is the protagonist of which play?", choices: ["The Tempest", "Cymbeline", "The Winter's Tale", "Pericles"], correct: 0, explanation: "Prospero, the exiled Duke of Milan and sorcerer, controls the events on the island in The Tempest." },
  { question: "Which play features Shylock the moneylender?", choices: ["The Merchant of Venice", "Measure for Measure", "Much Ado About Nothing", "Timon of Athens"], correct: 0, explanation: "The Merchant of Venice features the Jewish moneylender Shylock and his pound-of-flesh bond." },
  { question: "In Twelfth Night, what is Viola's twin brother named?", choices: ["Sebastian", "Orsino", "Malvolio", "Antonio"], correct: 0, explanation: "Sebastian, Viola's twin, drives the play's comic confusion when each thinks the other has drowned." },
  { question: "Who delivers the 'To be, or not to be' soliloquy?", choices: ["Hamlet", "Macbeth", "Othello", "Lear"], correct: 0, explanation: "Hamlet contemplates suicide and the nature of existence in Act 3, Scene 1." },
  { question: "Which couple are the 'star-crossed lovers'?", choices: ["Antony and Cleopatra", "Romeo and Juliet", "Beatrice and Benedick", "Troilus and Cressida"], correct: 1, explanation: "The Prologue of Romeo and Juliet famously calls them 'a pair of star-cross'd lovers'." },
  { question: "In Macbeth, how many witches greet Macbeth on the heath?", choices: ["Two", "Three", "Four", "Five"], correct: 1, explanation: "The 'three weird sisters' deliver prophecies that set Macbeth's tragic course." },
  { question: "Which Roman play features the line 'Et tu, Brute?'", choices: ["Antony and Cleopatra", "Julius Caesar", "Coriolanus", "Titus Andronicus"], correct: 1, explanation: "Caesar's dying words to his friend Brutus appear in Julius Caesar (Act 3, Scene 1)." },
  { question: "Who is Macbeth's ill-fated friend murdered on his orders?", choices: ["Banquo", "Duncan", "Macduff", "Ross"], correct: 0, explanation: "Banquo is killed because the witches prophesied his descendants would be kings." },
  { question: "In Hamlet, who is Ophelia's father?", choices: ["Claudius", "Polonius", "Laertes", "Horatio"], correct: 1, explanation: "Polonius, Claudius's chief counselor, is Ophelia and Laertes's father — killed by Hamlet behind a curtain." },
  { question: "Which play features the characters Beatrice and Benedick?", choices: ["Much Ado About Nothing", "As You Like It", "Twelfth Night", "Love's Labour's Lost"], correct: 0, explanation: "Much Ado About Nothing's witty pair are tricked by friends into admitting their love." },
  { question: "Which play centres on the Forest of Arden?", choices: ["As You Like It", "A Midsummer Night's Dream", "The Tempest", "Cymbeline"], correct: 0, explanation: "As You Like It moves into the Forest of Arden, where exiled Rosalind disguises as a man." },
  { question: "Falstaff is a comic figure most prominent in which plays?", choices: ["Henry IV Parts 1 and 2", "King Lear", "Othello", "Hamlet"], correct: 0, explanation: "Sir John Falstaff, Prince Hal's drinking companion, dominates Henry IV Parts 1 and 2." },
  { question: "In what year did William Shakespeare die?", choices: ["1601", "1610", "1616", "1623"], correct: 2, explanation: "Shakespeare died on April 23, 1616 — by tradition, the same date as his birth." },
  { question: "Where was Shakespeare born?", choices: ["London", "Stratford-upon-Avon", "Canterbury", "Oxford"], correct: 1, explanation: "Shakespeare was born in Stratford-upon-Avon, Warwickshire in April 1564." },
  { question: "The First Folio of Shakespeare's plays was published in what year?", choices: ["1599", "1611", "1623", "1632"], correct: 2, explanation: "Compiled by his colleagues Heminge and Condell, the First Folio appeared in 1623, seven years after his death." },
  { question: "Which London theatre is most associated with Shakespeare's company?", choices: ["The Globe", "The Rose", "The Swan", "The Curtain"], correct: 0, explanation: "The Globe Theatre opened in 1599 and was home to the Lord Chamberlain's Men (later the King's Men)." },
  { question: "How many sonnets did Shakespeare write?", choices: ["124", "154", "200", "76"], correct: 1, explanation: "Shakespeare's sonnet sequence comprises 154 poems, mostly published in 1609." },
  { question: "Sonnet 18 famously begins with which line?", choices: ["'When in disgrace with fortune and men's eyes'", "'Shall I compare thee to a summer's day?'", "'Let me not to the marriage of true minds'", "'My mistress' eyes are nothing like the sun'"], correct: 1, explanation: "'Shall I compare thee to a summer's day?' is the most famous opening of Shakespeare's sonnets." },
  { question: "Which Roman tragedy features Mark Antony and Cleopatra?", choices: ["Julius Caesar", "Antony and Cleopatra", "Coriolanus", "Titus Andronicus"], correct: 1, explanation: "Antony and Cleopatra dramatises the doomed romance between the Roman general and Egyptian queen." },
  { question: "In Macbeth, who finally kills Macbeth?", choices: ["Macduff", "Malcolm", "Banquo's ghost", "Ross"], correct: 0, explanation: "Macduff — 'not of woman born' (born by caesarean) — fulfills the witches' prophecy." },
  { question: "Which play features the character Puck?", choices: ["A Midsummer Night's Dream", "The Tempest", "Twelfth Night", "Cymbeline"], correct: 0, explanation: "Puck (Robin Goodfellow) is Oberon's mischievous fairy servant in A Midsummer Night's Dream." },
  { question: "In The Merchant of Venice, what does Shylock demand as forfeit?", choices: ["A pound of flesh", "A bag of gold", "A ship", "A house"], correct: 0, explanation: "Shylock famously demands a pound of Antonio's flesh as bond for the loan." },
  { question: "Which Shakespeare play is the longest by line count?", choices: ["Hamlet", "King Lear", "Macbeth", "Othello"], correct: 0, explanation: "Hamlet is Shakespeare's longest play at about 4,042 lines and ~30,000 words." },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ShakespeareQuizSettings): ShakespeareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShakespeareQuizState, action: ShakespeareQuizAction): ShakespeareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShakespeareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
