(function (root) {
 'use strict';
 const SUBJECT='franzoesisch-klasse6', KEY='bonjour-franzoesisch-klasse6-v1', SCHEMA=1;
 const normalise=value=>String(value??'').normalize('NFC').replace(/[‘’ʼ`]/g,"'").replace(/\s+/g,' ').trim().toLocaleLowerCase('fr');
 const emptyExam=()=>({draft:{},submitted:false,self:[],selfByQuestion:{}});
 function freshState(){const m1=emptyExam();return {schema:SCHEMA,subject:SUBJECT,contentVersion:6,route:'#home',read:{},answers:{},exam:m1,exams:{m1}};}
 const valuePresent=value=>Array.isArray(value)?value.length>0:typeof value==='number'||(typeof value==='string'&&value.trim().length>0);
 function isAnswered(q,value){
  if(q.type==='slots')return Array.isArray(value)&&value.length===q.slots.length&&value.every((v,i)=>Number.isInteger(v)&&v>=0&&v<q.slots[i].options.length);
  if(q.type==='build')return Array.isArray(value)&&value.length===q.tokens.length&&new Set(value).size===value.length&&value.every(v=>Number.isInteger(v)&&v>=0&&v<q.tokens.length);
  if(q.type==='choice')return Number.isInteger(value)&&value>=0&&value<q.options.length;
  return typeof value==='string'&&value.trim().length>0;
 }
 function evaluate(q,value){
  if(q.type==='open') return {correct:null,message:'Offene Aufgabe: Vergleiche deinen Text anhand der Kriterien.'};
  if(!isAnswered(q,value)) return {correct:false,message:'Ergänze zuerst alle Teile deiner Antwort.'};
  let correct=false;
  if(q.type==='choice')correct=Number.isInteger(value)&&value===q.answer;
  if(q.type==='build')correct=Array.isArray(value)&&value.length===q.solution.length&&value.every((v,i)=>q.tokens[v]===q.solution[i]);
  if(q.type==='short')correct=q.answers.some(a=>normalise(a)===normalise(value));
  if(q.type==='slots')correct=q.slots.every((s,i)=>value[i]===s.answer);
  if(correct)return {correct:true,message:q.why};
  let message='Prüfe deine Antwort noch einmal. '+(q.type==='build'?'Achte auf Reihenfolge und Gesprächsrolle.':q.type==='short'?'Die erwartete Fassung passt noch nicht. Achte auch auf Apostrophe und Akzente.':'Welche Information und welche Gesprächsrolle passen?');
  if(q.type==='choice'&&q.errors?.[value])message=q.errors[value];
  if(q.type==='short')for(const m of q.mistakes||[]){if(normalise(value).includes(normalise(m.includes))){message=m.message;break;}}
  if(q.type==='slots'){const wrong=q.slots.find((s,i)=>value[i]!==s.answer);message='Prüfe den Teil „'+wrong.label+'“. '+(wrong.feedback||'Nutze Anzahl, Genus und Wortanfang aus der Hilfe.');}
  return {correct:false,message};
 }
 function recordAttempt(q,previous={},value){
  const result=evaluate(q,value),attempts=(previous.attempts||0)+1;
  return {...previous,value,attempts,checked:true,correct:result.correct,firstTry:attempts===1&&result.correct===true,hadError:previous.hadError||result.correct===false};
 }
 function lessonStatus(lesson,state){
  const records=lesson.check.map(q=>state.answers[q.id]);
  if(records.every(r=>r?.correct===true&&r.checked&&!r.hints&&!r.revealed&&r.firstTry))return {label:'Ohne Hilfe geprüft',kind:'secure'};
  if(records.every(r=>r?.correct===true&&r.checked))return {label:'Geprüft · nach Hilfe oder Korrektur',kind:'assisted'};
  if(records.some(r=>r?.hadError||r?.revealed))return {label:'Wiederholen empfohlen',kind:'review'};
  if(state.read[lesson.id])return {label:'Erklärung gelesen',kind:'read'};
  if([lesson.discover,...lesson.practice,lesson.transfer,...lesson.check].some(q=>state.answers[q.id]))return {label:'Begonnen',kind:'started'};
  return {label:'Noch offen',kind:'new'};
 }
 function gradeExam(exam,draft){
  const closed=exam.questions.filter(q=>q.type!=='open');
  const results=closed.map(q=>{const result=evaluate(q,draft[q.id]),max=q.points||1;let earned=result.correct?max:0;
   if(q.type==='slots'&&q.slotPoints){const v=draft[q.id];earned=q.slots.reduce((n,s,i)=>n+(Array.isArray(v)&&Number.isInteger(v[i])&&v[i]===s.answer?q.slotPoints[i]:0),0);}
   return {id:q.id,lesson:q.lesson,section:q.section||'',max,earned,...result};
  });
  const sections=(exam.sections||[]).map(s=>({...s,points:results.filter(x=>x.section===s.id).reduce((n,x)=>n+x.earned,0),max:results.filter(x=>x.section===s.id).reduce((n,x)=>n+x.max,0)}));
  return {points:results.reduce((n,r)=>n+r.earned,0),max:results.reduce((n,r)=>n+r.max,0),results,sections,review:[...new Set(results.filter(r=>!r.correct).map(r=>r.lesson))]};
 }
 function selfAssessment(exam,saved){
  const tasks=exam.questions.filter(q=>q.type==='open'&&q.rubric).map(q=>{const values=saved.selfByQuestion?.[q.id]||[],valid=q.rubric.map((levels,i)=>Number.isInteger(values[i])&&values[i]>=0&&values[i]<levels.length?values[i]:-1);return {id:q.id,points:valid.reduce((n,v)=>n+Math.max(v,0),0),max:q.rubric.reduce((n,x)=>n+x.length-1,0),rated:valid.filter(v=>v>=0).length,count:valid.length,values:valid};});
  return {tasks,points:tasks.reduce((n,x)=>n+x.points,0),max:tasks.reduce((n,x)=>n+x.max,0),rated:tasks.reduce((n,x)=>n+x.rated,0),count:tasks.reduce((n,x)=>n+x.count,0)};
 }
 function cleanValue(value){
  if(typeof value==='string')return value.slice(0,12000);
  if(Number.isInteger(value)&&value>=0&&value<100)return value;
  if(Array.isArray(value)&&value.length<100&&value.every(v=>Number.isInteger(v)&&v>=-1&&v<100))return [...value];
  return '';
 }
 function validateSave(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Das ist keine gültige Lernstandsdatei.');
  if(raw.subject!==SUBJECT)throw Error('Diese Datei gehört nicht zum Französischkurs. Bitte wähle die Französisch-Sicherung.');
  if(raw.schema!==SCHEMA)throw Error('Diese Dateiversion wird noch nicht unterstützt. Dein bisheriger Stand wurde nicht verändert.');
  const state=freshState(),src=raw.state||raw;
  if(!src||typeof src!=='object'||!src.answers||typeof src.answers!=='object'||Array.isArray(src.answers))throw Error('In dieser Datei fehlen die Antwortdaten.');
  if(Object.keys(src.answers).length>2000)throw Error('Die Datei enthält zu viele Einträge.');
  const idPattern=/^(?:m\d+-(?:l\d+-(?:d|p\d+|t|c\d+)|e\d+)|(?:mix|final|mock)\d+-e\d+)$/;
  for(const [id,r] of Object.entries(src.answers)){
   if(!idPattern.test(id)||!r||typeof r!=='object')continue;
   state.answers[id]={value:cleanValue(r.value),attempts:Math.min(999,Math.max(0,Math.floor(Number(r.attempts)||0))),hints:Math.min(2,Math.max(0,Math.floor(Number(r.hints)||0))),revealed:r.revealed===true,checked:r.checked===true,correct:r.correct===true?true:r.correct===false?false:null,firstTry:r.firstTry===true,hadError:r.hadError===true,compared:r.compared===true,self:Array.isArray(r.self)?r.self.filter(n=>Number.isInteger(n)&&n>=0&&n<20):[]};
  }
  for(const [id,read] of Object.entries(src.read||{}))if(/^m\d+-l\d+$/.test(id)&&read===true)state.read[id]=true;
  if(typeof src.route==='string'&&/^#(?:home|cards|about|exams|exam(?:\/(?:m\d+|(?:mix|final|mock)\d+))?|module\/m\d+|lesson\/m\d+-l\d+\/[0-7])$/.test(src.route))state.route=src.route;
  const savedExams={...(src.exams&&typeof src.exams==='object'&&!Array.isArray(src.exams)?src.exams:{})};
  if(!savedExams.m1&&src.exam)savedExams.m1=src.exam;
  for(const [id,exam] of Object.entries(savedExams)){
   if(!/^(?:m\d+|(?:mix|final|mock)\d+)$/.test(id)||!exam||typeof exam!=='object')continue;
   const clean=emptyExam();
   for(const [qid,value] of Object.entries(exam.draft||{}))if(qid.startsWith(id+'-e')&&/^(?:m\d+|(?:mix|final|mock)\d+)-e\d+$/.test(qid))clean.draft[qid]=cleanValue(value);
   clean.submitted=exam.submitted===true;
   clean.self=Array.isArray(exam.self)?[...new Set(exam.self.filter(n=>Number.isInteger(n)&&n>=0&&n<20))]:[];
   for(const [qid,values] of Object.entries(exam.selfByQuestion||{}))if(qid.startsWith(id+'-e')&&/^(?:m\d+|(?:mix|final|mock)\d+)-e\d+$/.test(qid)&&Array.isArray(values)&&values.length<=20)clean.selfByQuestion[qid]=values.map(v=>Number.isInteger(v)&&v>=0&&v<=2?v:-1);
   state.exams[id]=clean;
  }
  state.exam=state.exams.m1;
  state.contentVersion=Number.isInteger(raw.contentVersion)?raw.contentVersion:1;
  return state;
 }
 function exportSave(state){return {schema:SCHEMA,subject:SUBJECT,contentVersion:6,savedAt:new Date().toISOString(),state};}
 function articleModel(card,plural){const article=plural?'les':card.elision?'l’':card.gender==='masculin'?'le':'la',noun=plural?card.plural:card.word;return {article,noun,phrase:article+(article==='l’'?'':' ')+noun};}
 function etreChain(card,forms){const verb=forms[card.pronoun];if(!verb)throw Error('Unbekanntes Pronomen');return {pronoun:card.pronoun,verb,sentence:card.pronoun.charAt(0).toUpperCase()+card.pronoun.slice(1)+' '+verb+' à Paris.'};}
 function profileModel(card,self=false){const p=self?'Je':card.pronoun==='elle'?'Elle':'Il',be=self?'suis':'est',from=/^[AEIOUYÀÂÉÈÊÎÏÔÖÙÛÜ]/i.test(card.origin)?'d’':'de ';return {origin:p+' '+be+' '+from+card.origin+'.',home:(self?'J’habite':p+' habite')+' à '+card.home+', '+card.country+'.',school:p+' '+be+' '+card.school+'.'};}
 function cityModel(card,count,mode='exist',exact=false){if(!Number.isInteger(count)||count<1||count>3)throw Error('Ungültige Anzahl');const plural=count>1,noun=plural?card.plural:card.word,def=plural?'les':card.elision?'l’':card.gender==='masculin'?'le':'la',ind=plural?'des':card.gender==='masculin'?'un':'une';const named=def+(def==='l’'?'':' ')+noun;const quantity=exact?['','un','deux','trois'][count]:ind;const group=exact&&count===1?(card.gender==='masculin'?'un':'une')+' '+noun:quantity+' '+noun;return {noun,article:ind,group,definite:named,sentence:mode==='point'?(plural?'Ce sont ':'C’est ')+named+'.':mode==='locate'?named.charAt(0).toUpperCase()+named.slice(1)+(plural?' sont là.':' est là.'):'Il y a '+group+'.'};}
 function preferenceModel(card,person='je',negative=false){
  if(!['je','tu'].includes(person))throw Error('Unbekannte Person');
  const parts=negative?[{kind:'person',text:person==='je'?'Je ':'Tu '},{kind:'negative',text:'n’'},{kind:'verb',text:person==='je'?'aime':'aimes'},{kind:'negative',text:' pas '},{kind:'group',text:card.group+'.'}]:[{kind:'person',text:person==='je'?'J’':'Tu '},{kind:'verb',text:person==='je'?'aime ':'aimes '},{kind:'group',text:card.group+'.'}];
  return {parts,sentence:parts.map(p=>p.text).join(''),reason:negative?'N’ steht vor dem Verb, pas danach. Der bestimmte Artikel der allgemeinen Vorliebe bleibt.':person==='je'?'Je wird direkt vor aime zu j’. Der Artikel gehört zur bereitgestellten Wortgruppe.':'Zur Person tu gehört aimes mit geschriebenem s.'};
 }
 function spellWord(word,alphabet){const marks={'\u0301':'accent aigu','\u0300':'accent grave','\u0302':'accent circonflexe','\u0308':'tréma','\u0327':'cédille'};return Array.from(word.normalize('NFC')).map(char=>{const decomposed=Array.from(char.normalize('NFD')),base=decomposed[0].toUpperCase(),entry=alphabet.find(x=>x.letter===base),extras=decomposed.slice(1).map(x=>marks[x]||x),label=entry?(extras.length?(base==='C'?'cé':base.toLowerCase())+' '+extras.join(' '):entry.name):/[’']/.test(char)?'apostrophe':char;return {char,letter:base,label};});}
 function readStorage(storage){
  try{const raw=storage.getItem(KEY);return {state:raw?validateSave(JSON.parse(raw)):freshState(),error:null};}
  catch(e){return {state:freshState(),error:'Der gespeicherte Stand konnte nicht gelesen werden. Er wurde nicht überschrieben. Du kannst eine Sicherung laden oder einen neuen Stand ausdrücklich speichern.'};}
 }
 root.FrenchCore={SUBJECT,KEY,SCHEMA,normalise,emptyExam,freshState,valuePresent,isAnswered,evaluate,recordAttempt,lessonStatus,gradeExam,selfAssessment,validateSave,exportSave,articleModel,etreChain,profileModel,cityModel,preferenceModel,spellWord,readStorage};
})(globalThis);
