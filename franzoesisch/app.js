/* Statische Lernwerkstatt. Alle Antworten bleiben lokal, ohne Anmeldung. */
(() => {
 'use strict';
 const C=globalThis.FrenchCore,D=globalThis.FRENCH_COURSE,$=s=>document.querySelector(s);
 const initial=C.readStorage({getItem:key=>localStorage.getItem(key)});
 let state=initial.state,storageBlocked=!!initial.error,pendingImport=null;
 const steps=['Ankommen','Entdecken','Verstehen','Mitdenken','Üben','Anwenden','Mini-Check','Merkkarte'];
 const allPractice=D.lessons.flatMap(l=>[l.discover,...l.practice,l.transfer,...l.check]);
 const questions=new Map([...allPractice,...D.exam.questions].map(q=>[q.id,q]));
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lessonById=id=>D.lessons.find(l=>l.id===id);
 function speakStatus(message){$('#announcer').textContent=message;}
 function storageMessage(message,recover=false){$('#save-message').innerHTML=esc(message)+(recover?' <button id="storage-recover">Neuen Stand speichern</button>':'');}
 function persist(){
  if(storageBlocked)return;
  try{localStorage.setItem(C.KEY,JSON.stringify(C.exportSave(state)));$('#save-message').textContent='';}
  catch(e){storageMessage('Automatisches Speichern ist in diesem Browser gerade nicht möglich. Sichere deinen Stand über „Sichern & Laden“ als Datei.');}
 }
 if(initial.error)storageMessage(initial.error,true);
 // Recompute practice correctness instead of trusting imported result flags.
 function reconcile(){
  for(const [id,r] of Object.entries(state.answers)){
   const q=questions.get(id);
   if(q&&r.checked&&q.type!=='open')r.correct=C.evaluate(q,r.value).correct;
  }
 }
 reconcile();
 function route(){
  const match=location.hash.match(/^#lesson\/(m\d+-l\d+)\/([0-7])$/);
  if(match&&lessonById(match[1]))return {view:'lesson',lesson:lessonById(match[1]),step:Number(match[2])};
  return {view:['#exam','#cards','#about'].includes(location.hash)?location.hash.slice(1):'home'};
 }
 function nav(){
  const r=route();
  $('#navigation').innerHTML=`<a href="#home" ${r.view==='home'?'class="active" aria-current="page"':''}>⌂ <span>Dein Überblick</span></a><div class="nav-break">MODUL 1 · JETZT STARTEN</div>`+
   D.lessons.map(l=>`<a class="lesson-nav ${r.lesson?.id===l.id?'active':''}" href="#lesson/${l.id}/0" ${r.lesson?.id===l.id?'aria-current="page"':''}><span class="nav-number">${l.icon}</span><span>${esc(l.title)}</span></a>`).join('')+
   `<a href="#exam" ${r.view==='exam'?'class="active" aria-current="page"':''}>✓ <span>Modulprüfung <span class="nav-long">M1</span></span></a><a href="#cards" ${r.view==='cards'?'class="active" aria-current="page"':''}>▤ <span>Merkkarten</span></a><div class="nav-break">DEMNÄCHST IM LERNWEG</div>`+
   D.modules.filter(m=>!m.available).map(m=>`<div class="nav-planned"><span class="nav-number">${esc(m.id.slice(1))}</span><div>${esc(m.title)}<small>Geplant · noch nicht enthalten</small></div></div>`).join('');
 }
 function illustration(){return `<div class="hero-art"><svg viewBox="0 0 400 295" role="img" aria-label="Nora und Samir sprechen miteinander. Je bedeutet jeweils ich; tu meint das Gegenüber."><path d="M27 238Q10 137 79 81T269 55q108 15 104 127t-179 87" fill="#e9eef7"/><circle cx="344" cy="45" r="18" fill="#edc466"/><path d="M65 245h281" stroke="#ccd6e4" stroke-width="3" stroke-linecap="round"/><path d="M82 244v-66q15-24 57 0v66" fill="#d58a68"/><path d="M81 183q-11-61 28-61t31 60" fill="#483b44"/><ellipse cx="110" cy="153" rx="23" ry="30" fill="#f1c8aa"/><path d="M86 144q-1-31 27-30 31 2 24 37-11-7-14-19-16 15-37 12" fill="#483b44"/><circle cx="103" cy="151" r="2" fill="#483b44"/><circle cx="122" cy="151" r="2" fill="#483b44"/><path d="M107 164q7 6 13 0" fill="none" stroke="#ad725e" stroke-width="2" stroke-linecap="round"/><path d="M245 245v-67q14-21 54 0l7 67" fill="#6289b5"/><ellipse cx="271" cy="150" rx="23" ry="30" fill="#bd8a65"/><path d="M248 145q-10-38 25-34 25-2 23 34-10-8-13-18-17 13-35 18" fill="#3b343b"/><circle cx="263" cy="151" r="2" fill="#3b343b"/><circle cx="282" cy="151" r="2" fill="#3b343b"/><path d="M267 164q6 5 12 0" fill="none" stroke="#754b40" stroke-width="2" stroke-linecap="round"/><rect x="25" y="28" width="167" height="61" rx="15" fill="white"/><path d="m96 88 12 16 4-17" fill="white"/><text x="49" y="54" fill="#315b9d" font-family="system-ui" font-size="14" font-weight="700">Je m’appelle Nora.</text><text x="49" y="75" fill="#66778c" font-family="system-ui" font-size="12">Et toi ?</text><rect x="213" y="48" width="175" height="52" rx="15" fill="#fff1e4"/><path d="m260 98 9 17 5-17" fill="#fff1e4"/><text x="230" y="78" fill="#8f5639" font-family="system-ui" font-size="13" font-weight="700">Je m’appelle Samir.</text><text x="96" y="270" fill="#566b85" font-family="system-ui" font-size="12">NORA</text><text x="253" y="270" fill="#566b85" font-family="system-ui" font-size="12">SAMIR</text></svg><p class="art-label">Ein Gespräch. Zwei Blickwinkel.</p></div>`;}
 function statusBadge(l){const s=C.lessonStatus(l,state);return `<span class="status ${s.kind}">${esc(s.label)}</span>`;}
 function resumeHref(){return /^#lesson\//.test(state.route)&&lessonById(state.route.split('/')[1])?state.route:`#lesson/${(D.lessons.find(l=>!['secure','assisted'].includes(C.lessonStatus(l,state).kind))||D.lessons[0]).id}/0`;}
 function home(){
  const checked=D.lessons.filter(l=>['secure','assisted'].includes(C.lessonStatus(l,state).kind)).length;
  return `<section class="hero"><div><p class="eyebrow">FRANZÖSISCH VERSTEHEN · KLASSE 6</p><h1>Ein bisschen Mut.<br><em>Ein großes Bonjour.</em></h1><p class="lead">Hier lernst du, wie Französisch funktioniert. Mit Erklärungen, die dich mitnehmen, und Übungen, bei denen du den nächsten Schritt selbst findest.</p><div class="hero-cta"><a class="button-link" href="${resumeHref()}">${Object.keys(state.answers).length?'Weiterlernen':'Mit Lektion 1 starten'} <span aria-hidden="true">→</span></a><a class="text-link" href="#cards">Deine Merkkarten ↗</a></div></div>${illustration()}</section>
  <div class="stats-strip"><span><b>5</b> ausführliche Lektionen</span><span><b>35</b> Lernaufgaben</span><span><b>1</b> Modulprüfung</span><span><b>${checked}/5</b> Mini-Checks abgeschlossen</span></div>
  <div class="section-head"><div><p class="eyebrow">MODUL 1 · ERSTE GESPRÄCHE</p><h2>Ich, du und ein guter Anfang.</h2></div><span class="pill">Jetzt bereit</span></div>
  <div class="lesson-grid">${D.lessons.map(l=>`<a class="lesson-tile" href="#lesson/${l.id}/0"><div class="tile-number">${l.icon}</div><div class="tile-content"><h3>${esc(l.title)}</h3><p>${esc(l.subtitle)}</p><div class="tile-meta">${esc(l.minutes)} Min. · Erklärung + Anwendung</div>${statusBadge(l)}</div></a>`).join('')}</div>
  <section class="exam-banner"><div><h3>Bereit für deinen ersten Check?</h3><p>Neue Situationen. Ohne Tipps während der Prüfung.<br>9 automatische Aufgaben + 1 eigener Dialog.</p></div><a href="#exam" class="button-link">Modulprüfung öffnen →</a></section>
  <aside class="notice blue"><b>Dein Kurs wächst Schritt für Schritt.</b> M1 ist vollständig nutzbar. Artikel, être und die weiteren Themen folgen in M2–M9. Gesamtabfrage und zwei Probeklausuren kommen nach den Fachmodulen dazu.</aside>
  <div class="home-foot"><a href="#about">Was gehört zum Kurs? Quellen & Hinweise</a><a href="./offline.html" download="Franzoesisch_Bonjour_M1.html">Modul 1 als Offline-Datei ↓</a></div><p class="fine" style="margin-top:18px">Keine Vokabeltests. Nötige Wortbedeutungen stehen bei den Aufgaben. Deine Antworten bleiben in diesem Browser; eine Sicherungsdatei nimmt sie auf ein anderes Gerät mit.</p>`;
 }
 function dialogue(scene){return `<p class="stage-intro">${esc(scene.intro)}</p><div class="dialogue">${scene.lines.map(([speaker,fr,de])=>`<div class="speech"><div class="speaker">${esc(speaker)}</div><p lang="fr">${esc(fr)}</p><p class="translation">${esc(de)}</p></div>`).join('')}</div><p class="caption">${esc(scene.caption)}</p>`;}
 function solution(q){return q.type==='choice'?q.options[q.answer]:q.type==='build'?q.solution.join(' '):q.type==='short'?q.answers[0]:q.sample;}
 function answerText(q,value){
  if(!C.valuePresent(value))return '(keine Antwort)';
  if(q.type==='choice')return q.options[value]||'(ungültige Auswahl)';
  if(q.type==='build')return Array.isArray(value)?value.map(i=>q.tokens[i]||'').join(' '):'';
  return String(value);
 }
 function accentbar(id){return `<div class="accentbar" role="group" aria-label="Französische Zeichen einfügen">${['’','é','è','ê','à','â','ç','Ç','ù','î','ô','ë','ï'].map(c=>`<button type="button" data-action="accent" data-id="${id}" data-char="${c}" aria-label="${c==='’'?'Apostroph':esc(c)} einfügen">${c}</button>`).join('')}</div>`;}
 function inputHTML(q,value,exam=false,locked=false){
  const prefix=exam?'exam':'learn',id=`${prefix}-${q.id}`;
  if(q.type==='choice')return `<div class="choices" role="radiogroup" aria-labelledby="title-${id}">${q.options.map((o,i)=>`<label class="choice"><input type="radio" name="${id}" value="${i}" data-id="${q.id}" data-exam="${exam}" ${value===i?'checked':''} ${locked?'disabled':''}><span lang="fr">${esc(o)}</span></label>`).join('')}</div>`;
  if(q.type==='build'){
   const selected=Array.isArray(value)?value:[];
   return `<div class="build-target" aria-label="Dein Satz. Bausteine anklicken, um sie zu entfernen.">${selected.length?selected.map(i=>`<button data-action="remove-token" data-id="${q.id}" data-exam="${exam}" data-index="${i}" ${locked?'disabled':''} aria-label="${esc(q.tokens[i])} aus Satz entfernen">${esc(q.tokens[i])} <span aria-hidden="true">×</span></button>`).join(''):'<span class="placeholder">Wähle unten die Bausteine in der richtigen Reihenfolge.</span>'}</div><div class="token-bank" aria-label="Bausteine">${q.tokens.map((t,i)=>`<button data-action="add-token" data-id="${q.id}" data-exam="${exam}" data-index="${i}" ${selected.includes(i)||locked?'disabled':''}>${esc(t)}</button>`).join('')}</div><button class="build-clear" data-action="clear-build" data-id="${q.id}" data-exam="${exam}" ${locked?'disabled':''}>Satz leeren</button>`;
  }
  return `<label class="answer-label" for="${id}">${q.type==='open'?'Dein Text (wird hier gespeichert)':'Deine Antwort'}</label>${q.type==='open'?`<textarea id="${id}" lang="fr" data-id="${q.id}" data-exam="${exam}" maxlength="12000" ${locked?'readonly':''}>${esc(value||'')}</textarea>`:`<input class="short-input" id="${id}" lang="fr" data-id="${q.id}" data-exam="${exam}" value="${esc(value||'')}" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="400" ${locked?'readonly':''}>`}${locked?'':accentbar(id)}`;
 }
 function criteriaHTML(q,checked,exam=false){return `<div class="criteria"><div class="self-label">SELBSTEINSCHÄTZUNG · KEINE AUTOMATISCHE SPRACHKORREKTUR</div>${q.criteria.map((c,i)=>`<label><input type="checkbox" data-action="criterion" data-id="${q.id}" data-exam="${exam}" value="${i}" ${(checked||[]).includes(i)?'checked':''}><span>${esc(c)}</span></label>`).join('')}</div>`;}
 function questionHTML(q,index,exam=false){
  const record=state.answers[q.id]||{},value=exam?state.exam.draft[q.id]:record.value;
  let feedback='';
  if(!exam){
   if(record.checked&&q.type!=='open'){
    const result=C.evaluate(q,record.value);
    feedback=`<div class="feedback ${result.correct?'correct':''}" tabindex="-1" role="status"><b>${result.correct?'Richtig.':'Noch nicht passend.'}</b> ${esc(result.message)}${result.correct&&(record.hints||record.revealed||record.attempts>1)?'<p class="fine">Gelöst nach Hilfe oder Korrektur. Für eine frische Prüfung nutze später den Mini-Check oder die Modulprüfung.</p>':''}</div>`;
   }
   if(record.hints)feedback+=(q.hints||['Achte auf die gesuchte Information und die Gesprächsrolle.','Vergleiche das Muster in der Erklärung.']).slice(0,record.hints).map((h,i)=>`<p class="hint" tabindex="-1"><b>Tipp ${i+1}:</b> ${esc(h)}</p>`).join('');
   if(record.revealed)feedback+=`<div class="solution" tabindex="-1"><b>Lösung zum Vergleichen</b><p lang="fr">${esc(solution(q))}</p><p>${esc(q.why)}</p><p class="fine">Angesehene Lösungen gelten nicht als ohne Hilfe geprüft.</p></div>`;
   if(record.compared&&q.type==='open')feedback+=`<div class="solution" tabindex="-1"><b>Eine mögliche Fassung</b><pre lang="fr">${esc(q.sample)}</pre><p>${esc(q.why)}</p>${criteriaHTML(q,record.self)}</div>`;
  }
  return `<section class="question" data-question="${q.id}" data-index="${index}" data-exam="${exam}" aria-labelledby="title-${exam?'exam':'learn'}-${q.id}"><p class="question-title">${q.type==='open'?'EIGENER TEXT':q.type==='build'?'SATZWERKSTATT':q.type==='short'?'SELBST SCHREIBEN':'ENTSCHEIDEN'} · AUFGABE ${index+1}</p><h3 id="title-${exam?'exam':'learn'}-${q.id}">${esc(q.prompt)}</h3>${q.support?`<p class="support"><b>Wörter & Bausteine:</b> ${esc(q.support)}</p>`:''}${inputHTML(q,value,exam)}${exam?'':`<div class="question-actions">${q.type==='open'?`<button class="primary" data-action="compare" data-id="${q.id}">Beispiel & Checkliste öffnen</button>`:`<button class="primary" data-action="check" data-id="${q.id}">Antwort prüfen</button><button data-action="hint" data-id="${q.id}" ${(record.hints||0)>=2?'disabled':''}>${record.hints?'Nächster Tipp':'Tipp bekommen'}</button><button data-action="reveal" data-id="${q.id}">Lösung ansehen</button>`}</div>`}${feedback}</section>`;
 }
 function soundHTML(l){return `<aside class="sound-box"><h3>◖ Dein kleines Lautfenster</h3><p>${esc(l.sound.note)}</p><p lang="fr"><b>${esc(l.sound.text)}</b></p><button data-action="speak" data-lesson="${l.id}">Mit französischer Systemstimme anhören</button><p class="voice-result" role="status"></p></aside>`;}
 function cardHTML(l){return `<article class="merkkarte"><h3>${l.icon} · ${esc(l.title)}</h3><p><b>${esc(l.card.rule)}</b></p><p class="example" lang="fr">${esc(l.card.example)}</p><p><b>Stolperfalle:</b> ${esc(l.card.trap)}</p></article>`;}
 function stageHTML(l,step){
  if(step===0)return `<h2>Eine Situation zum Reinkommen.</h2>${dialogue(l.scene)}<div class="takeaway"><b>Darauf arbeitest du hin:</b><ul class="goal-list">${l.goals.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>Du kannst die Schritte frei wechseln. Empfohlen: erst verstehen, dann üben, dann ohne Tipps prüfen.</div>`;
  if(step===1)return `<h2>Schau einmal genauer hin.</h2><p class="stage-intro">Probiere eine erste Entscheidung. Fehler sind hier eine Hilfe: Deine Antwort zeigt dir, worauf du gleich achten kannst.</p>${questionHTML(l.discover,0)}`;
  if(step===2)return `<h2>Jetzt wird das Muster klar.</h2>${l.explain.map(([title,body])=>`<section class="rule-block"><h3>${esc(title)}</h3>${body}</section>`).join('')}<button data-action="read" data-lesson="${l.id}" class="${state.read[l.id]?'':'primary'}">${state.read[l.id]?'✓ Erklärung als gelesen markiert':'Ich habe die Erklärung gelesen'}</button>${soundHTML(l)}`;
  if(step===3){return `<h2>Ein Beispiel, Schritt für Schritt.</h2><p class="worked-task">${esc(l.worked.task)}</p><ol class="worked-list">${l.worked.steps.map(([h,p],i)=>`<li ${i>0?'hidden':''}><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol><div class="question-actions"><button class="primary" data-action="worked">Nächsten Denkschritt zeigen</button></div><aside class="notice">${esc(l.worked.trap)}</aside>`;}
  if(step===4)return `<h2>Mit Hilfe selbst ausprobieren.</h2><p class="stage-intro">Drei Aufgaben mit kleinen Hinweisen. Du entscheidest, ob du einen Tipp brauchst. Erst danach lohnt sich der Blick auf die ganze Lösung.</p>${l.practice.map((q,i)=>questionHTML(q,i)).join('')}`;
  if(step===5)return `<h2>Jetzt eine neue Situation.</h2><p class="stage-intro">Übertrage das Muster. Es geht um Grammatik und passende Gesprächsrollen; nötige Wörter stehen direkt bei der Aufgabe.</p>${questionHTML(l.transfer,0)}`;
  if(step===6)return `<h2>Was klappt schon ohne Hilfe?</h2><p class="stage-intro">Zwei frische Aufgaben prüfen diese Lektion. Tipps bleiben erreichbar. Wenn du sie verwendest oder erst nach einer Korrektur richtig antwortest, steht das im Lernstand. Ein erneuter Klick macht daraus keinen neuen Erstversuch.</p>${l.check.map((q,i)=>questionHTML(q,i)).join('')}<div class="takeaway">Aktueller Stand: ${statusBadge(l)}<p class="fine">Das beschreibt diese zwei Aufgaben, nicht dein gesamtes Können.</p></div>`;
  return `<h2>Das nimmst du mit.</h2>${cardHTML(l)}<button class="print-button" data-action="print">Merkkarte drucken</button><div class="takeaway">Dein Stand: ${statusBadge(l)}<p>Du kannst jederzeit zurückgehen und eine Erklärung erneut lesen.</p></div>`;
 }
 function lessonPage(l,step){
  const index=D.lessons.indexOf(l),next=D.lessons[index+1];
  return `<a class="back" href="#home">← Zum Überblick</a><div class="lesson-top"><div><p class="eyebrow">MODUL 1 · LEKTION ${index+1} VON 5</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.subtitle)}</p></div><span class="lesson-counter">${esc(l.minutes)} MIN. · DEIN TEMPO</span></div><nav class="steps" aria-label="Schritte der Lektion">${steps.map((s,i)=>`<a href="#lesson/${l.id}/${i}" ${i===step?'aria-current="step"':''}><span>${i+1}</span>${s}</a>`).join('')}</nav><section class="stage">${stageHTML(l,step)}</section><div class="stage-footer">${step?`<a href="#lesson/${l.id}/${step-1}">← ${steps[step-1]}</a>`:'<a href="#home">Zum Überblick</a>'}${step<7?`<a class="next" href="#lesson/${l.id}/${step+1}">Weiter: ${steps[step+1]} →</a>`:next?`<a class="next" href="#lesson/${next.id}/0">Nächste Lektion →</a>`:'<a class="next" href="#exam">Zur Modulprüfung →</a>'}</div>`;
 }
 function examPage(){
  if(state.exam.submitted)return examResult();
  const filled=D.exam.questions.filter(q=>C.valuePresent(state.exam.draft[q.id])).length;
  return `<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">MODULPRÜFUNG M1 · NEUE AUFGABEN</p><h1>${esc(D.exam.title)}</h1><div class="exam-head"><span class="pill">${esc(D.exam.minutes)} MIN. ALS ORIENTIERUNG</span><p>${esc(D.exam.intro)}</p><p><b>Dein Entwurf wird automatisch gespeichert.</b> Du kannst die Prüfung unterbrechen. Antworten werden erst nach dem Abgeben ausgewertet. Wortbedeutungen bleiben sichtbar.</p><p class="fine" id="exam-filled">${filled} von ${D.exam.questions.length} Aufgaben beantwortet.</p></div><section class="stage">${D.exam.questions.map((q,i)=>questionHTML(q,i,true)).join('')}<div id="exam-warning" role="status"></div><button class="primary" data-action="submit-exam">Prüfung abgeben & auswerten</button></section>`;
 }
 function examResult(){
  const score=C.gradeExam(D.exam,state.exam.draft),open=D.exam.questions.find(q=>q.type==='open');
  return `<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">MODULPRÜFUNG M1 · DEINE AUSWERTUNG</p><h1>Schau, was schon klappt.</h1><div class="result-grid"><section class="score-card"><b>${score.points} / ${score.max}</b><p>automatisch bewertete Aufgaben richtig<br>Jede geschlossene Aufgabe zählt einmal.</p></section><section class="score-card self"><b id="self-count">${state.exam.self.length} / ${open.criteria.length}</b><p>Kriterien für den eigenen Text angehakt<br>Deine Selbsteinschätzung, separat gezählt.</p></section></div><div class="takeaway"><b>${score.review.length?'Hier kannst du gezielt nachschauen:':'Alle geschlossenen Aufgaben richtig gelöst.'}</b>${score.review.length?`<div class="review-links">${score.review.map(id=>`<a href="#lesson/${id}/2">${esc(lessonById(id).title)} ↗</a>`).join('')}</div>`:'<p>Prüfe jetzt deinen eigenen Text. Die Aufgabenwerte sind keine Schulnote.</p>'}</div><section class="stage" style="margin-top:24px">${D.exam.questions.map((q,i)=>{
    const answer=state.exam.draft[q.id],result=q.type==='open'?null:C.evaluate(q,answer);
    return `<article class="exam-result-question"><p class="question-title">AUFGABE ${i+1} · ${q.type==='open'?'EIGENER TEXT':result.correct?'RICHTIG':'NOCH EINMAL ANSCHAUEN'}</p><h3>${esc(q.prompt)}</h3><p class="given"><b>Deine Antwort:</b>\n${esc(answerText(q,answer))}</p>${q.type==='open'?`<div class="solution" tabindex="-1"><b>Eine mögliche Fassung</b><pre lang="fr">${esc(q.sample)}</pre><p>${esc(q.why)}</p>${criteriaHTML(q,state.exam.self,true)}</div>`:`<div class="feedback ${result.correct?'correct':''}"><b>Erwartete Lösung:</b> <span lang="fr">${esc(solution(q))}</span><p>${esc(q.why)}</p></div>`}</article>`;
   }).join('')}</section><div class="restart-box"><p>Wenn du die Prüfung wiederholen möchtest, sichere bei Bedarf erst deinen Lernstand. Ein neuer Durchgang ersetzt nur diese Modulprüfung; deine Lektionen bleiben erhalten. Die Aufgaben sind dieselben, deshalb ist ein besseres Wiederholungsergebnis kein unabhängiger neuer Test.</p><button data-action="restart-show">Neuen Durchgang vorbereiten</button><div id="restart-confirm" hidden><p>Deine bisherige Prüfungsauswertung wird ersetzt.</p><button data-action="restart-exam" class="primary">Ja, Prüfung neu beginnen</button></div></div>`;
 }
 function about(){return `<article class="about"><a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">DEINE FRANZÖSISCHWERKSTATT</p><h1>Ein Lernweg, der erklärt.</h1><p class="lead">Für den Anfangsunterricht in Klasse 6 am Gymnasium in Niedersachsen. Die Themen orientieren sich an den bereitgestellten Buchseiten 8–37.</p><h2>Was jetzt schon fertig ist</h2><p>Modul 1 umfasst fünf Lektionen, 35 Lernaufgaben einschließlich fünf Mini-Checks sowie eine Modulprüfung mit zehn neuen Aufgaben. Zwei freie Dialogaufgaben werden mit Kriterien selbst eingeschätzt. Die übrigen Aufgaben haben fest hinterlegte Lösungen. Bei kurzen Texteingaben werden nur ausdrücklich berücksichtigte Fassungen automatisch erkannt; das ist kein allgemeiner Sprachkorrektor.</p><h2>Was noch folgt</h2><p>Artikel, Einzahl/Mehrzahl, c’est/ce sont, Personalpronomen und être, weitere Fragen, Herkunft und Wohnort, il y a und un/une/des, Vorlieben, Aussprache und Schreiben folgen in M2–M9. Die Gesamtabfrage und zwei Probeklausuren sind geplant und noch nicht enthalten. Auch ein vollständiger Jahreskurs oder A1-Abschluss wird mit diesem Anfangsmodul nicht behauptet.</p><h2>Was „keine Vokabeln“ hier bedeutet</h2><p>Es gibt keine Vokabeltests. Wörter, die du für die Grammatikaufgabe brauchst, werden mit Bedeutung bereitgestellt. Für Altersangaben kannst du die Zahlen nachschauen. Freie Aufgaben kannst du mit erfundenen Rollen bearbeiten.</p><h2>Wie dein Fortschritt gezählt wird</h2><p>„Erklärung gelesen“ setzt du selbst. „Ohne Hilfe geprüft“ bedeutet: Beide Aufgaben des Mini-Checks waren beim ersten Prüfen richtig, ohne Tipp und ohne angesehene Lösung. Nach Hilfe oder Korrektur wird das ausdrücklich gekennzeichnet. Ein Fehler kann eine Wiederholung empfehlen. Dies sind transparente Bearbeitungsstände, keine sichere Messung deines gesamten Könnens. Aufgaben lassen sich jederzeit öffnen.</p><h2>Deine Daten und deine Sicherung</h2><p>Die Seite benötigt keine Anmeldung. Antworten und Entwürfe werden im Browser dieses Geräts gespeichert, soweit dein Browser das zulässt. Sie werden von dieser Lernseite nicht an einen Server gesendet. „Sichern & Laden“ exportiert oder importiert eine JSON-Datei für diesen Französischkurs. Es gibt keine automatische Synchronisation. Ein Import ersetzt den Französisch-Lernstand erst nach deiner Auswahl und dem Bestätigen in der Vorschau.</p><h2>Die Lautfenster</h2><p>Optional liest eine verfügbare französische Systemstimme neue Beispielsätze vor. Die Verfügbarkeit und Aussprache hängen vom Gerät ab. Je nach Systemeinstellung kann der Vorlesedienst online arbeiten. Der Kurs funktioniert vollständig ohne diese Hilfe. Es handelt sich nicht um die Originalhörtexte des Buches und nicht um eine fertige Hörverstehensprüfung.</p><h2>Grundlage und fachlicher Abgleich</h2><p>Eigenständig formulierte Erklärungen, Dialoge und Zeichnungen. Buchfotos, Comics und Liedtexte werden nicht auf dieser Webseite veröffentlicht. Das Kerncurriculum von 2025 gilt seit August 2025 für Französisch Sekundarbereich I, Jahrgänge 6–10. A1 ist dort das Ziel am Ende von Jahrgang 7. Die Themenabgrenzung dieses Kurses beschreibt nur den fotografierten Anfangsstoff.</p><ol><li>30 bereitgestellte Fotos, Buchseiten 8–37: C’est parti, Unité 1 und Module 1.</li><li><a href="https://cuvo.nibis.de/index.php?p=download&upload=756" target="_blank" rel="noopener">Niedersächsisches Kultusministerium: Kerncurriculum Französisch 2025</a>, besonders S. 8–12 und 26–31.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-le-verbe-etre-et-le-verbe-sappeler-au-present-0" target="_blank" rel="noopener">TV5MONDE: être und s’appeler im Präsens</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-comment-utiliser-les-pronoms-personnels-sujets" target="_blank" rel="noopener">TV5MONDE: Personalpronomen</a>.</li><li><a href="https://vitrinelinguistique.oqlf.gouv.qc.ca/21737/lorthographe/elision-et-apostrophe/elision-obligatoire" target="_blank" rel="noopener">Office québécois de la langue française: Elision und Apostroph</a>.</li></ol><p class="fine" style="margin-top:25px">Ausbaustand: Schritt 1 · Modul 1 · 9. November 2026. Als Nächstes: M2 Artikel & Mehrzahl und M3 Personen vorstellen.</p></article>`;}
 function render(focus=true){
  const r=route();nav();
  if(r.view==='lesson'||r.view==='exam'){state.route=location.hash;persist();}
  $('#main').innerHTML=r.view==='lesson'?lessonPage(r.lesson,r.step):r.view==='exam'?examPage():r.view==='cards'?`<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">DEINE SAMMLUNG · MODUL 1</p><h1>Das Wichtigste bleibt.</h1><p class="lead">Fünf Merkkarten zum Nachschlagen. Du kannst sie zusammen drucken.</p><button class="print-button" data-action="print" style="margin-bottom:24px">Alle Merkkarten drucken</button><div class="all-cards">${D.lessons.map(cardHTML).join('')}</div>`:r.view==='about'?about():home();
  document.title=(r.lesson?r.lesson.title:r.view==='exam'?'Modulprüfung M1':'Bonjour! · Französisch verstehen')+' · Klasse 6';
  if(focus){$('#main').focus({preventScroll:true});window.scrollTo({top:0});}
  const active=$('.steps [aria-current=step]');if(active)active.scrollIntoView({block:'nearest',inline:'center'});
 }
 function patchQuestion(id,exam=false){
  const q=questions.get(id),el=document.querySelector(`[data-question="${id}"][data-exam="${exam}"]`);
  if(el){const box=document.createElement('div');box.innerHTML=questionHTML(q,Number(el.dataset.index)||0,exam);el.replaceWith(box.firstElementChild);}
 }
 function updateAnswer(q,value,exam){
  if(exam){if(!state.exam.submitted)state.exam.draft[q.id]=value;}
  else{const r=state.answers[q.id]||{};state.answers[q.id]={...r,value,checked:false,correct:null,compared:false,self:[]};}
  persist();
  if(exam&&$('#exam-filled'))$('#exam-filled').textContent=`${D.exam.questions.filter(q=>C.valuePresent(state.exam.draft[q.id])).length} von ${D.exam.questions.length} Aufgaben beantwortet.`;
 }
 $('#main').addEventListener('input',e=>{
  const el=e.target;if(!el.matches('input[type=radio],input.short-input,textarea'))return;
  const q=questions.get(el.dataset.id);if(!q)return;
  updateAnswer(q,el.type==='radio'?Number(el.value):el.value,el.dataset.exam==='true');
 });
 $('#main').addEventListener('change',e=>{
  const el=e.target;if(el.dataset.action!=='criterion')return;
  const exam=el.dataset.exam==='true',arr=exam?state.exam.self:(state.answers[el.dataset.id].self||[]),index=Number(el.value);
  const selected=new Set(arr);if(el.checked)selected.add(index);else selected.delete(index);
  if(exam){state.exam.self=[...selected];if($('#self-count'))$('#self-count').textContent=`${selected.size} / 4`;}
  else state.answers[el.dataset.id].self=[...selected];persist();
 });
 $('#main').addEventListener('click',e=>{
  const b=e.target.closest('button[data-action]');if(!b)return;
  const action=b.dataset.action,q=questions.get(b.dataset.id),exam=b.dataset.exam==='true';
  if(action==='accent'){
   const field=document.getElementById(b.dataset.id);if(!field||field.readOnly)return;
   const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
   field.setRangeText(b.dataset.char,start,end,'end');field.focus();field.dispatchEvent(new Event('input',{bubbles:true}));return;
  }
  if(action==='add-token'||action==='remove-token'||action==='clear-build'){
   if(exam&&state.exam.submitted)return;
   let value=exam?state.exam.draft[q.id]:state.answers[q.id]?.value;value=Array.isArray(value)?[...value]:[];
   const index=Number(b.dataset.index);
   if(action==='add-token'&&!value.includes(index))value.push(index);
   if(action==='remove-token')value=value.filter(i=>i!==index);
   if(action==='clear-build')value=[];
   updateAnswer(q,value,exam);patchQuestion(q.id,exam);
   const scope=document.querySelector(`[data-question="${q.id}"]`);(scope.querySelector('.token-bank button:not(:disabled)')||scope.querySelector('.build-target button')||scope.querySelector('button')).focus({preventScroll:true});
   speakStatus('Dein Satz: '+answerText(q,value));return;
  }
  if(['check','hint','reveal','compare'].includes(action)){
   const r=state.answers[q.id]||{};
   if((action==='check'||action==='compare')&&!C.valuePresent(r.value)){speakStatus('Gib zuerst eine Antwort ein.');b.insertAdjacentHTML('afterend','<span class="fine empty-warning" role="status">Bitte zuerst antworten.</span>');return;}
   if(action==='check'){
    // Repeated checking of an unchanged response is not another attempt.
    state.answers[q.id]=r.checked?r:C.recordAttempt(q,r,r.value);
   }
   if(action==='hint')state.answers[q.id]={...r,hints:Math.min(2,(r.hints||0)+1)};
   if(action==='reveal')state.answers[q.id]={...r,revealed:true};
   if(action==='compare')state.answers[q.id]={...r,compared:true,self:r.self||[]};
   persist();patchQuestion(q.id);
   const feedback=document.querySelector(`[data-question="${q.id}"] .feedback`);
   if(action==='check'&&feedback)feedback.focus({preventScroll:true});
   else {
    const resultNode=document.querySelector('[data-question="'+q.id+'"] '+(action==='hint'?'.hint:last-child':'.solution'));
    if(resultNode)resultNode.focus({preventScroll:true});
    speakStatus(action==='hint'?'Ein weiterer Hinweis ist sichtbar.':action==='reveal'?'Die Lösung ist sichtbar.':'Beispiel und Selbstbewertung sind sichtbar.');
   }
   const current=route();
   if(current.view==='lesson'&&current.step===6){
    const badge=document.querySelector('.stage .takeaway .status');
    if(badge)badge.outerHTML=statusBadge(current.lesson);
   }
   nav();return;
  }
  if(action==='read'){state.read[b.dataset.lesson]=true;persist();b.textContent='✓ Erklärung als gelesen markiert';b.classList.remove('primary');speakStatus('Erklärung als gelesen markiert.');return;}
  if(action==='worked'){
   const next=$('.worked-list li[hidden]');if(next)next.hidden=false;
   if(!$('.worked-list li[hidden]')){b.disabled=true;b.textContent='Alle Denkschritte sichtbar';}
   speakStatus(next?.textContent||'Alle Denkschritte sichtbar.');return;
  }
  if(action==='print'){window.print();return;}
  if(action==='speak'){speakLesson(lessonById(b.dataset.lesson));return;}
  if(action==='submit-exam'){
   const missing=D.exam.questions.filter(x=>!C.valuePresent(state.exam.draft[x.id])||(x.type==='build'&&state.exam.draft[x.id].length!==x.tokens.length));
   if(missing.length){$('#exam-warning').innerHTML=`<p class="notice">Noch ${missing.length} Aufgabe(n) offen oder nicht vollständig. Bitte ergänze sie vor dem Abgeben.</p>`;const target=$(`[data-question="${missing[0].id}"]`);target.scrollIntoView({block:'start'});target.querySelector('input,textarea,button')?.focus({preventScroll:true});return;}
   state.exam.submitted=true;persist();render();return;
  }
  if(action==='restart-show'){$('#restart-confirm').hidden=false;return;}
  if(action==='restart-exam'){state.exam={draft:{},submitted:false,self:[]};persist();render();}
 });
 function speakLesson(l){
  const result=$('.voice-result');
  if(!('speechSynthesis'in window)){result.textContent='Auf diesem Gerät ist keine Vorlesefunktion verfügbar. Lies das Beispiel oder sprich es selbst; alle Aufgaben funktionieren ohne Ton.';return;}
  const voice=speechSynthesis.getVoices().find(v=>/^fr(?:-|_)/i.test(v.lang)||v.lang==='fr');
  if(!voice){result.textContent='Keine französische Systemstimme gefunden. Du kannst eine französische Stimme in den Geräteeinstellungen ergänzen. Der Kurs funktioniert auch ohne Ton.';return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(l.sound.text);u.lang=voice.lang;u.voice=voice;u.rate=.83;
  u.onerror=()=>{result.textContent='Das Vorlesen hat nicht funktioniert. Die Textfassung steht weiterhin oben.';};
  u.onend=()=>{result.textContent='Vorlesen beendet. Du kannst das Beispiel erneut anhören oder selbst sprechen.';};
  result.textContent='Französische Systemstimme: '+voice.name+(voice.localService?' · auf diesem Gerät':' · kann einen Online-Vorlesedienst verwenden');speechSynthesis.speak(u);
 }
 $('#save-open').addEventListener('click',()=>{
  $('#save-status').textContent=`${Object.keys(state.answers).length} begonnene Lernaufgaben · Modulprüfung ${state.exam.submitted?'abgegeben':'als Entwurf'}.`;
  $('#save-dialog').showModal();
 });
 $('#save-close').addEventListener('click',()=>$('#save-dialog').close());
 $('#export').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(C.exportSave(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Bonjour_Französisch_Lernstand.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#import-result').textContent='Die Sicherungsdatei wurde zum Download bereitgestellt. Bewahre sie an einem Ort auf, den du wiederfindest.';
 });
 $('#import').addEventListener('change',async e=>{
  pendingImport=null;$('#import-preview').hidden=true;$('#import-result').textContent='';
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>1024*1024)throw Error('Diese Datei ist zu groß für eine Lernstandssicherung.');
   pendingImport=C.validateSave(JSON.parse(await file.text()));
   $('#import-preview').innerHTML=`<b>Vorschau:</b> ${Object.keys(pendingImport.answers).length} Lernaufgaben gespeichert. Modulprüfung ${pendingImport.exam.submitted?'abgegeben':'als Entwurf'}.<p>Mit dem Laden wird dein aktueller Französisch-Lernstand ersetzt.</p><button id="import-confirm" class="primary">Diesen Lernstand laden</button><button id="import-cancel">Abbrechen</button>`;$('#import-preview').hidden=false;
  }catch(error){$('#import-result').textContent=error instanceof SyntaxError?'Die Datei enthält keine gültigen JSON-Daten. Dein Stand wurde nicht verändert.':error.message;}
  e.target.value='';
 });
 $('#save-dialog').addEventListener('click',e=>{
  if(e.target.id==='import-cancel'){pendingImport=null;$('#import-preview').hidden=true;}
  if(e.target.id==='import-confirm'&&pendingImport){state=pendingImport;pendingImport=null;storageBlocked=false;reconcile();persist();$('#import-preview').hidden=true;$('#import-result').textContent='Der Französisch-Lernstand wurde geladen.';render(false);}
 });
 $('#save-message').addEventListener('click',e=>{if(e.target.id==='storage-recover'){storageBlocked=false;persist();}});
 window.addEventListener('hashchange',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();render();});
 render(false);
})();
