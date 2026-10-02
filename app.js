(() => {
  'use strict';
  const indicators = window.INDICATORS || [];
  const $ = (id) => document.getElementById(id);
  const slug = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const isPercent = (item) => item.valueType === 'percent';
  const fmt = (value, item) => {
    if (isPercent(item)) return new Intl.NumberFormat('pt-BR', { style:'percent', maximumFractionDigits:1 }).format(value);
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits:1 }).format(value) + (item.valueType === 'points' ? ' pts' : '');
  };
  const delta = (item) => item.actual - item.target;
  const gapText = (item) => {
    const d = delta(item);
    if (isPercent(item)) return `${d >= 0 ? '+' : '−'}${new Intl.NumberFormat('pt-BR', {maximumFractionDigits:1}).format(Math.abs(d*100))} p.p.`;
    return `${d >= 0 ? '+' : '−'}${fmt(Math.abs(d), item)}`;
  };
  const statusClass = (value) => ({'Verde':'green','Amarelo':'amber','Vermelho':'red'}[value] || 'amber');
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderCards(query='') {
    const filtered = indicators.filter((i) => slug(`${i.name} ${i.lever} ${i.owner}`).includes(slug(query)));
    $('indicatorGrid').innerHTML = filtered.length ? filtered.map((i) => `
      <article class="indicator-card">
        <div class="card-top"><span class="metric-id">${esc(i.id)}</span><span class="status ${statusClass(i.status)}">${esc(i.status)}</span></div>
        <h3>${esc(i.name)}</h3><p class="leverage">${esc(i.lever)}</p>
        <div class="metric-values"><div><span>Meta</span><strong>${fmt(i.target,i)}</strong></div><div><span>Realizado</span><strong>${fmt(i.actual,i)}</strong></div><div><span>Desvio</span><strong class="deviation ${delta(i) < 0 ? 'negative':'positive'}">${gapText(i)}</strong></div></div>
        <div class="card-bottom"><span class="owner">${esc(i.owner)}</span><span>Atualizado ${esc(i.updated)}</span></div>
        <p class="recommendation"><b>Recomendação:</b> ${esc(i.recommendation)}</p>
      </article>`).join('') : '<p class="empty-results">Nenhum indicador corresponde à busca.</p>';
  }
  function answerQuestion(raw) {
    const q = slug(raw);
    const exact = indicators.find((i) => q.includes(slug(i.name)));
    const matches = exact ? [exact] : indicators.filter((i) => slug(i.name).split(' ').filter(w=>w.length>3).some(w=>q.includes(w)) && q.length > 18);
    if (/fora da meta|abaixo da meta|desvio|atencao/.test(q)) {
      const off = indicators.filter(i => i.status !== 'Verde');
      return `<strong>${off.length} indicadores precisam de atenção:</strong><ul>${off.map(i=>`<li>${esc(i.name)} — realizado ${fmt(i.actual,i)}, meta ${fmt(i.target,i)} (${gapText(i)}; farol ${esc(i.status.toLowerCase())}).</li>`).join('')}</ul>`;
    }
    if (!matches.length) return 'Não encontrei esse indicador na base demonstrativa. Tente o nome completo ou escolha uma sugestão acima.';
    const item = matches[0];
    if (/recomend|acao|plano|melhorar|fazer/.test(q)) return `<strong>${esc(item.name)}:</strong> ${esc(item.recommendation)} Responsável na base: ${esc(item.owner)}.`;
    return `<strong>${esc(item.name)}</strong> está com farol ${esc(item.status.toLowerCase())}. Meta: ${fmt(item.target,item)}; realizado: ${fmt(item.actual,item)}; desvio: ${gapText(item)}. Responsável: ${esc(item.owner)}. Atualização: ${esc(item.updated)}.`;
  }
  function getPlans() { try { return JSON.parse(localStorage.getItem('bussola-plans') || '[]'); } catch { return []; } }
  function renderPlans() {
    const plans = getPlans(); $('planCount').textContent = plans.length;
    $('plansList').innerHTML = plans.length ? plans.map(p=>`<article class="plan-item"><div><strong>${esc(p.indicator)} · ${esc(p.owner)}</strong><p>${esc(p.action)}</p><span>Registrado em ${esc(p.created)}</span></div></article>`).join('') : '<p class="empty-state">Nenhum plano registrado ainda.</p>';
  }
  function init() {
    const green = indicators.filter(i=>i.status==='Verde').length;
    $('totalCount').textContent = indicators.length;
    $('greenCount').textContent = green;
    $('attentionCount').textContent = indicators.length-green;
    const latest = indicators.map(i=>i.updated).sort().at(-1);
    $('updatedAt').textContent = latest ? `Dados atualizados até ${latest}` : 'Dados demonstrativos';
    $('actionIndicator').innerHTML = indicators.map(i=>`<option value="${esc(i.id)}">${esc(i.name)}</option>`).join('');
    renderCards(); renderPlans();
    $('search').addEventListener('input', e=>renderCards(e.target.value));
    $('questionForm').addEventListener('submit', e=>{e.preventDefault(); const q=$('question').value.trim(); if(!q)return; $('answer').innerHTML=answerQuestion(q); $('answer').hidden=false;});
    document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>{$('question').value=b.textContent; $('questionForm').requestSubmit(); $('question').focus();}));
    $('actionForm').addEventListener('submit', e=>{e.preventDefault(); const selected=indicators.find(i=>i.id===$('actionIndicator').value); const plans=getPlans(); plans.unshift({indicator:selected.name,owner:$('actionOwner').value.trim(),action:$('actionText').value.trim(),created:new Intl.DateTimeFormat('pt-BR').format(new Date())}); localStorage.setItem('bussola-plans',JSON.stringify(plans)); $('actionForm').reset(); renderPlans();});
    $('exportPlans').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(getPlans(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='planos-de-acao-bussola.json';a.click();URL.revokeObjectURL(url);});
  }
  document.addEventListener('DOMContentLoaded', init);
})();

