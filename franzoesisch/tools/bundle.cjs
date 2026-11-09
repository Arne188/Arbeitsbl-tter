const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+fs.readFileSync(path.join(root,'style.css'),'utf8')+'</style>');
for(const file of ['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','core.js','app.js']){
 let code=fs.readFileSync(path.join(root,file),'utf8');
 new vm.Script(code,{filename:file});
 if(file==='app.js')code=code.replace(/<a href="\.\/offline\.html"[^>]*>[^<]*<\/a>/g,'<span class="fine">Offline-Datei · Module 1–3</span>');
 html=html.replace('<script src="./'+file+'"></script>','<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
}
html=html.replace('<a href="../index.html">← Alle Fächer</a>','<span>Offline · Module 1–3</span>');
fs.writeFileSync(path.join(root,'offline.html'),html);
console.log('Offline-Datei erstellt: '+Buffer.byteLength(html)+' Bytes.');
