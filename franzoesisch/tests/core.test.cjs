const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['modules/m1.js','core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const C=ctx.FrenchCore,D=ctx.FRENCH_COURSE,plain=x=>JSON.parse(JSON.stringify(x));
const all=D.lessons.flatMap(l=>[l.discover,...l.practice,l.transfer,...l.check]),ex=D.exam.questions;
function answer(q){if(q.type==='choice')return q.answer;if(q.type==='short')return q.answers[0];if(q.type==='build')return q.solution.map(s=>q.tokens.indexOf(s));return q.sample;}
test('five complete eight-stage lessons and honest exercise counts',()=>{
 assert.equal(D.lessons.length,5);assert.equal(all.length,35);assert.equal(ex.length,10);assert.equal(D.modules.filter(m=>m.available).length,1);
 assert.equal(new Set([...all,...ex].map(q=>q.id)).size,45);
 for(const l of D.lessons){assert.ok(l.explain.length>=4);assert.ok(l.explain.every(e=>e[0]&&e[1]));assert.equal(l.worked.steps.length,4);assert.equal(l.check.length,2);assert.ok(l.card.rule);}
});
test('every closed exercise accepts its authored solution and rejects an explicit wrong answer',()=>{
 for(const q of [...all,...ex].filter(q=>q.type!=='open')){
  assert.equal(C.evaluate(q,answer(q)).correct,true,q.id);
  const wrong=q.type==='choice'?(q.answer+1)%q.options.length:q.type==='build'?[...answer(q)].reverse():'Inhaltlich unpassend';
  assert.equal(C.evaluate(q,wrong).correct,false,q.id);
  if(q.type==='build')assert.deepEqual([...q.tokens].sort(),[...q.solution].sort());
 }
});
test('apostrophe variants and Unicode NFC work; accents remain significant',()=>{
 const q=ex.find(q=>q.id==='m1-e3');
 assert.equal(C.evaluate(q," Je m'appelle   Salome\u0301. ").correct,true);
 assert.equal(C.evaluate(q,"Je m'appelle Salome.").correct,false);
 assert.notEqual(C.normalise('ou'),C.normalise('où'));assert.notEqual(C.normalise('a'),C.normalise('à'));
});
test('common errors return a targeted hint without revealing every solution',()=>{
 const q=all.find(q=>q.id==='m1-l4-p3');
 assert.match(C.evaluate(q,'je suis').message,/Alter/);assert.match(C.evaluate(q,'je ai').message,/Apostroph/);
 const name=all.find(q=>q.id==='m1-l1-t');assert.match(C.evaluate(name,'Tu t’appelles Alex.').message,/ich/);
});
test('mastery status distinguishes first attempt, corrections, hints and read-only activity',()=>{
 const l=D.lessons[0],s=C.freshState();assert.equal(C.lessonStatus(l,s).kind,'new');s.read[l.id]=true;assert.equal(C.lessonStatus(l,s).kind,'read');
 for(const q of l.check)s.answers[q.id]=C.recordAttempt(q,{},answer(q));assert.equal(C.lessonStatus(l,s).kind,'secure');
 s.answers[l.check[0].id].hints=1;assert.equal(C.lessonStatus(l,s).kind,'assisted');
 const q=l.check[1];s.answers[q.id]=C.recordAttempt(q,{},(q.answer+1)%q.options.length);assert.equal(C.lessonStatus(l,s).kind,'review');
 s.answers[q.id]=C.recordAttempt(q,s.answers[q.id],answer(q));assert.equal(C.lessonStatus(l,s).kind,'assisted');assert.equal(s.answers[q.id].firstTry,false);
});
test('exam keeps open self-assessment separate and links errors to a lesson',()=>{
 const draft=Object.fromEntries(ex.map(q=>[q.id,answer(q)]));let grade=C.gradeExam(D.exam,draft);assert.equal(grade.points,9);assert.equal(grade.max,9);
 draft['m1-e1']=0;grade=C.gradeExam(D.exam,draft);assert.equal(grade.points,8);assert.deepEqual(plain(grade.review),['m1-l1']);
 assert.equal(C.evaluate(ex.find(q=>q.type==='open'),'different but possible text').correct,null);
});
test('save round-trip restores text, hints, sequence, unfinished exam and self-assessment',()=>{
 const s=C.freshState();s.answers['m1-l1-p3']={value:[2,1,0],attempts:1,hints:2,revealed:true,checked:true,correct:true,firstTry:false};s.answers['m1-l5-t']={value:'Mein eigener Dialog mit é und ç',compared:true,self:[0,2]};s.exam.draft['m1-e3']="Je m'appelle Salomé.";s.read['m1-l1']=true;s.route='#lesson/m1-l3/4';
 const restored=C.validateSave(JSON.parse(JSON.stringify(C.exportSave(s))));assert.deepEqual(plain(restored.answers['m1-l1-p3'].value),[2,1,0]);assert.equal(restored.answers['m1-l1-p3'].hints,2);assert.equal(restored.answers['m1-l5-t'].value,'Mein eigener Dialog mit é und ç');assert.equal(restored.exam.draft['m1-e3'],s.exam.draft['m1-e3']);assert.equal(restored.exam.submitted,false);assert.equal(restored.route,s.route);
});
test('module additions preserve stable IDs, including future module records',()=>{
 const s=C.freshState();s.answers['m1-l1-d']={value:1};s.answers['m2-l1-d']={value:0};s.read['m2-l1']=true;
 const restored=C.validateSave(C.exportSave(s));assert.equal(restored.answers['m1-l1-d'].value,1);assert.equal(restored.answers['m2-l1-d'].value,0);assert.equal(restored.read['m2-l1'],true);
});
test('foreign, future-schema and damaged saves are rejected without modifying current state',()=>{
 const s=C.freshState(),before=JSON.stringify(s);
 assert.throws(()=>C.validateSave({subject:'chemie',schema:1,state:s}),/nicht zum Französisch/);
 assert.throws(()=>C.validateSave({subject:C.SUBJECT,schema:99,state:s}),/Dateiversion/);
 assert.throws(()=>C.validateSave({subject:C.SUBJECT,schema:1,state:{}}),/Antwortdaten/);assert.equal(JSON.stringify(s),before);
 const malicious=C.exportSave(s);malicious.state.answers=JSON.parse('{"__proto__":{"polluted":true},"m1-l1-d":{"value":"safe"}}');const clean=C.validateSave(malicious);assert.equal(Object.hasOwn(clean.answers,'__proto__'),false);assert.equal({}.polluted,undefined);
});
test('unavailable or broken browser storage returns an explicit recoverable state',()=>{
 const broken=C.readStorage({getItem(){throw Error('denied');}});assert.ok(broken.error);assert.equal(broken.state.subject,C.SUBJECT);
 const corrupt=C.readStorage({getItem(){return '{broken';}});assert.ok(corrupt.error);
 assert.equal(C.readStorage({getItem(){return null;}}).error,null);
});
test('bundled offline page is self-contained and contains identical course code',()=>{
 const h=fs.readFileSync(path.join(root,'offline.html'),'utf8');assert.ok(!/<script[^>]+src=/.test(h));assert.ok(!/<link[^>]+stylesheet/.test(h));assert.ok(h.includes('Offline · Modul 1'));
 for(const file of ['modules/m1.js','core.js'])assert.ok(h.includes(fs.readFileSync(path.join(root,file),'utf8')));
 for(const match of h.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
