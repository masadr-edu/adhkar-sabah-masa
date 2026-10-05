const listEl = document.getElementById('adhkarList');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const heroTime = document.getElementById('heroTime');

let currentTab = localStorage.getItem('tab') || 'morning';
// remaining counts: key `${tab}-${id}` -> remaining
let remaining = JSON.parse(localStorage.getItem('remaining') || '{}');
let fontScale = parseFloat(localStorage.getItem('fontScale') || '1');
let theme = localStorage.getItem('theme') || 'light';

function applyFont(){
  document.documentElement.style.setProperty('--font-scale', fontScale);
  document.getElementById('fontSizeLabel').textContent = Math.round(fontScale*100)+'%';
  localStorage.setItem('fontScale', fontScale);
}
function applyTheme(){
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeLabel').textContent = theme==='light' ? 'ليلي' : 'نهاري';
  localStorage.setItem('theme', theme);
}
applyFont(); applyTheme();

// وقت تلقائي
(function(){
  const h = new Date().getHours();
  if(!localStorage.getItem('tab')){
    currentTab = (h>=5 && h<17) ? 'morning' : 'evening';
  }
  if(h>=5 && h<17){ heroTime.textContent='🌅 وقت الصباح — من الفجر إلى الشروق'; }
  else { heroTime.textContent='🌙 وقت المساء — من العصر إلى العشاء'; }
})();

function keyFor(id){ return currentTab+'-'+id; }
function getFiltered(){ return ADHKAR.filter(a=>a.cat.includes(currentTab)); }

function render(){
  document.querySelectorAll('.tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.tab===currentTab);
  });
  localStorage.setItem('tab', currentTab);
  const items = getFiltered();
  listEl.innerHTML='';
  items.forEach((d,i)=>{
    const key = keyFor(d.id);
    if(!(key in remaining)) remaining[key]=d.count;
    const left = remaining[key];
    const done = left<=0;
    const card = document.createElement('article');
    card.className='card'+(done?' done':'');
    card.innerHTML = `
      <div class="card-head">
        <span class="num">${i+1}</span>
        <h3>${d.title}</h3>
        <span class="repeat-badge">التكرار: ${d.count} ${d.count>2?'مرات':'مرة'+(d.count===2?'ان':'')}</span>
      </div>
      <div class="dhikr-text">${d.text}</div>
      <div class="meta">
        <div><span class="k">📖 المصدر:</span><span class="v"><strong>${d.source}</strong></span></div>
        <div><span class="k">✨ الفضل:</span><span class="v">${d.virtue}</span></div>
        ${d.note?`<div><span class="k">⚠️ تنبيه:</span><span class="v">${d.note}</span></div>`:''}
      </div>
      <div class="counter-row">
        <button class="sebha-btn" ${done?'disabled':''}>
          <span class="count-circle">${done?'✓':left}</span>
          <span>${done?'تم بحمد الله': (d.count===1?'اضغط بعد القراءة للانتهاء':'اضغط للتسبيح — المتبقي '+left)}</span>
        </button>
        <div class="mini-btns">
          <button class="reset-one">↺ إعادة</button>
        </div>
        <span class="done-mark">✅ تم إتمام هذا الذكر</span>
      </div>
    `;
    const btn = card.querySelector('.sebha-btn');
    btn.addEventListener('click', ()=>{
      if(remaining[key]>0){
        remaining[key]--;
        if(navigator.vibrate) navigator.vibrate(20);
        save(); render();
        if(remaining[key]===0 && navigator.vibrate) navigator.vibrate([60,40,60]);
      }
    });
    card.querySelector('.reset-one').addEventListener('click', ()=>{
      remaining[key]=d.count; save(); render();
    });
    listEl.appendChild(card);
  });
  updateProgress();
}
function save(){ localStorage.setItem('remaining', JSON.stringify(remaining)); }
function updateProgress(){
  const items = getFiltered();
  const total = items.length;
  const doneCount = items.filter(d=> (remaining[keyFor(d.id)]||d.count) <=0 ).length;
  const pct = total? Math.round(doneCount/total*100):0;
  progressText.textContent = `${doneCount} / ${total} مكتمل`;
  progressPercent.textContent = pct+'%';
  progressFill.style.width = pct+'%';
}

document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=>{ currentTab=t.dataset.tab; render(); window.scrollTo({top:0,behavior:'smooth'}); });
});
document.getElementById('resetAll').addEventListener('click', ()=>{
  getFiltered().forEach(d=>{ remaining[keyFor(d.id)]=d.count; });
  save(); render();
});
document.getElementById('fontIncrease').addEventListener('click', ()=>{
  fontScale=Math.min(1.6, +(fontScale+0.1).toFixed(2)); applyFont();
});
document.getElementById('fontDecrease').addEventListener('click', ()=>{
  fontScale=Math.max(0.8, +(fontScale-0.1).toFixed(2)); applyFont();
});
document.getElementById('themeToggle').addEventListener('click', ()=>{
  theme = theme==='light' ? 'dark' : 'light'; applyTheme();
});
document.getElementById('year').textContent = new Date().getFullYear();
const toTop=document.getElementById('toTop');
window.addEventListener('scroll', ()=>{ toTop.style.display = window.scrollY>600?'block':'none'; });
toTop.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

render();
