const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../../chemie.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const context=vm.createContext({});
vm.runInContext(script.slice(0,script.indexOf('const $='))+'\nglobalThis.subject={chapters,exam,prepExam,allLessons,fresh,validateState,grade,complete,cleanDrawing,diagram,modelDrawing,gasLabView,examSummary};',context);
const A=context.subject,plain=v=>JSON.parse(JSON.stringify(v));
const learning=A.allLessons.flatMap(l=>l.questions),all=[...learning,...A.exam,...A.prepExam];
const correct=q=>q.type==='choice'?q.answer:q.type==='match'||q.type==='label'||q.type==='order'?plain(q.answer):q.type==='drawing'?{marks:Array.from({length:q.expected},(_,i)=>({cell:q.modelKind==='compressed'?Math.floor(i/4)*8+i%4:i,kind:q.legend.length===2?i%2:0})),note:'Eine eigene Erklärung.'}:'Eine eigene Antwort.';
test('stable course and independent 60 point examinations have unique IDs',()=>{
 assert.equal(A.allLessons.length,13);assert.equal(learning.length,62);assert.equal(A.exam.length,13);assert.equal(A.prepExam.length,15);
 assert.equal(A.exam.reduce((n,q)=>n+q.points,0),60);assert.equal(A.prepExam.reduce((n,q)=>n+q.points,0),60);
 assert.equal(new Set(all.map(q=>q.id)).size,all.length);
 for(const q of all)assert.ok(q.points>0&&q.prompt&&(q.explain||(q.model&&q.rubric.length)),q.id);
});
test('all closed answers score correctly, wrong answers cannot get full points',()=>{
 for(const q of all.filter(q=>['choice','match','label','order'].includes(q.type))){
  assert.equal(A.grade(q,correct(q)),q.points,q.id);const wrong=q.type==='choice'?(q.answer+1)%q.options.length:q.type==='order'?[...q.answer].reverse():q.answer.map((v,i)=>i===0?(v+1)%q.options.length:v);
  assert.ok(A.grade(q,wrong)<q.points,q.id);
  assert.equal(A.complete(q,correct(q)),true,q.id);
 }
});
test('drawing needs marks and explanation, never pretends to grade spatial meaning',()=>{
 for(const q of all.filter(q=>q.type==='drawing')){assert.equal(A.complete(q,correct(q)),true);assert.equal(A.complete(q,{marks:[],note:'Text'}),false);assert.equal(A.complete(q,{...correct(q),note:' '}),false);assert.equal(A.grade(q,correct(q)),null);}
});
test('drawing imports remove duplicate, invalid and outside-piston marks',()=>{
 const q=learning.find(q=>q.id==='k55');const clean=A.cleanDrawing({marks:[{cell:0,kind:0},{cell:0,kind:1},{cell:7,kind:0},{cell:3,kind:5},{cell:-1,kind:0},{cell:8,kind:0}],note:'Gas'},q);
 assert.deepEqual(plain(clean.marks),[{cell:0,kind:0},{cell:8,kind:0}]);assert.equal(A.cleanDrawing({note:'a'.repeat(13000)},q).note.length,12000);
});
test('legacy saved work survives while new exam starts empty; results are recomputed',()=>{
 const old={version:1,subject:'chemie-teilchenmodell',answers:{k02:{value:learning.find(q=>q.id==='k02').answer,checked:true,score:999}},read:['stoff-koerper'],lastLesson:'stoff-koerper',exam:{answers:{e01:{value:A.exam[0].answer,checked:true,score:999}},started:123,finished:true}};
 const loaded=A.validateState(old,all,A.allLessons);assert.equal(loaded.answers.k02.score,learning.find(q=>q.id==='k02').points);assert.equal(loaded.exam.answers.e01.score,A.exam[0].points);assert.equal(loaded.exam.started,123);assert.equal(loaded.exam.finished,true);assert.deepEqual(plain(loaded.prepExam.answers),{});assert.equal(loaded.prepExam.started,null);assert.deepEqual(plain(loaded.read),['stoff-koerper']);
});
test('drawings, rubrics, old exam and new exam remain independent through export/import',()=>{
 const state=A.fresh(),draw=A.prepExam.find(q=>q.type==='drawing');state.exam={answers:{e01:{value:A.exam[0].answer,checked:true,score:4}},started:123,finished:true};
 state.prepExam={answers:{[draw.id]:{value:correct(draw),modelShown:true,checked:true,score:1}},started:456,finished:true};
 const loaded=A.validateState(plain(state),all,A.allLessons);assert.equal(loaded.exam.answers.e01.score,4);assert.equal(loaded.prepExam.answers[draw.id].score,1);assert.equal(loaded.prepExam.answers[draw.id].value.marks.length,12);assert.equal(loaded.exam.answers[draw.id],undefined);assert.equal(loaded.prepExam.answers.e01,undefined);
});
test('empty or unconfirmed free answers cannot import positive self points',()=>{
 for(const q of A.prepExam.filter(q=>q.type==='written'||q.type==='drawing')){const state=A.fresh();state.prepExam.answers[q.id]={value:q.type==='written'?'':{marks:[],note:''},checked:true,modelShown:true,score:q.points};const loaded=A.validateState(plain(state),all,A.allLessons);assert.equal(loaded.prepExam.answers[q.id].checked,false,q.id);}
});
test('candis model preserves exactly 24 water and 8 sugar marks across three stages',()=>{
 const diagram=A.diagram('dissolving');for(let i=0;i<3;i++){const panel=diagram.match(new RegExp('<g data-panel="dissolve-'+i+'"[^>]*>([\\s\\S]*?)</g>'))[1];assert.equal((panel.match(/data-particle="a"/g)||[]).length,24);assert.equal((panel.match(/data-particle="b"/g)||[]).length,8);}
});
test('gas compression, gas lab and drawing examples preserve authored counts',()=>{
 for(const mode of ['rigid','expand','compress'])for(const heat of [0,50,100])for(const volume of [40,100])assert.equal((A.gasLabView(mode,heat,volume).match(/data-particle="a"/g)||[]).length,10);
 const diagram=A.diagram('compression');for(let i=0;i<2;i++)assert.equal((diagram.match(new RegExp('<g data-panel="compression-'+i+'">([\\s\\S]*?)</g>'))[1].match(/data-particle="a"/g)||[]).length,10);
 for(const q of all.filter(q=>q.type==='drawing'))assert.equal((A.modelDrawing(q).match(/data-particle=/g)||[]).length,q.expected,q.id);
});
test('source stays standalone and every lesson has reading content',()=>{
 assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+rel="stylesheet"/);
 const readings=JSON.parse(script.match(/try\{readings=([\s\S]*?);status\.textContent/)[1]);for(const l of A.allLessons)assert.ok(readings[l.page]?.blocks.length>=3,l.id);
 assert.ok(html.includes('Homogenes Gemisch')&&html.includes('Heterogenes Gemisch')&&html.includes('Kraft pro Fläche'));
});
