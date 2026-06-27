/**
 * AAFY · Asistente IA
 * Widget de chat con Google Gemini (gratuito)
 * Pegar antes de </body> en cualquier dashboard:
 *   <script src="chatbot-aafy.js"></script>
 */
(function () {
  const STORAGE_KEY = 'aafy_gemini_key';

  /* ── Estilos ── */
  const style = document.createElement('style');
  style.textContent = `
    #aafy-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px;
      background: var(--burgundy, #8B1A2E);
      border-radius: 50%; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.28);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform .2s, box-shadow .2s;
    }
    #aafy-btn:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(0,0,0,0.34); }
    #aafy-btn svg  { width: 27px; height: 27px; fill: #fff; }

    #aafy-panel {
      position: fixed; bottom: 92px; right: 24px;
      width: 360px; max-height: 540px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 10px 36px rgba(0,0,0,0.22);
      display: flex; flex-direction: column;
      z-index: 9998; overflow: hidden;
      transition: opacity .2s, transform .2s;
    }
    #aafy-panel.hidden { opacity: 0; pointer-events: none; transform: translateY(12px); }

    #aafy-head {
      background: var(--burgundy, #8B1A2E); color: #fff;
      padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: center;
    }
    #aafy-head .title { font-size: 14px; font-weight: 700; }
    #aafy-head .sub   { font-size: 11px; opacity: .7; margin-top: 2px; }
    #aafy-close {
      background: none; border: none; color: #fff;
      font-size: 22px; line-height: 1; cursor: pointer; opacity: .75;
    }
    #aafy-close:hover { opacity: 1; }

    #aafy-msgs {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 180px;
    }
    .am {
      padding: 10px 13px; border-radius: 12px;
      font-size: 13px; line-height: 1.55; max-width: 88%;
    }
    .am.bot  { background: #F0EDE8; color: #1a1a1a; align-self: flex-start; border-bottom-left-radius: 3px; }
    .am.user { background: var(--burgundy, #8B1A2E); color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
    .am.err  { background: #FFF0F0; color: #c62828; border: 1px solid #FFCDD2; align-self: flex-start; }

    #aafy-typing {
      padding: 6px 14px; font-size: 12px; color: #999;
      display: none; align-items: center; gap: 5px;
    }
    .ad { width:6px; height:6px; background:#bbb; border-radius:50%; animation: ab 1.2s infinite; }
    .ad:nth-child(2){animation-delay:.2s} .ad:nth-child(3){animation-delay:.4s}
    @keyframes ab { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }

    #aafy-key-bar {
      background: #FFF8E1; border-top: 1px solid #FFE082;
      padding: 10px 14px; font-size: 12px; color: #5D4037;
      display: none; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    #aafy-key-bar input {
      flex:1; min-width:120px; padding:5px 8px;
      border:1.5px solid #ddd; border-radius:6px; font-size:12px;
      font-family:monospace;
    }
    #aafy-key-bar button {
      background: var(--gold, #C9A84C); color: #fff; border: none;
      padding: 5px 11px; border-radius:6px; font-size:12px;
      font-weight:700; cursor:pointer; white-space:nowrap;
    }
    #aafy-key-clr {
      margin-left:auto; font-size:11px; color:#999;
      cursor:pointer; text-decoration:underline; background:none;
      border:none; padding:0;
    }

    #aafy-input-row {
      display: flex; gap: 8px; padding: 10px 12px;
      border-top: 1px solid #eee;
    }
    #aafy-input {
      flex:1; padding:9px 12px; border:1.5px solid #ddd;
      border-radius:8px; font-size:13px; outline:none;
      resize:none; font-family:inherit; line-height:1.4;
    }
    #aafy-input:focus { border-color: var(--burgundy,#8B1A2E); }
    #aafy-send {
      background: var(--burgundy,#8B1A2E); color:#fff; border:none;
      border-radius:8px; padding:0 14px; cursor:pointer; font-size:18px;
      transition:opacity .2s; flex-shrink:0;
    }
    #aafy-send:hover { opacity:.85; }
    #aafy-send:disabled { opacity:.35; cursor:not-allowed; }

    @media(max-width:420px){
      #aafy-panel { width:calc(100vw - 32px); right:16px; }
    }
  `;
  document.head.appendChild(style);

  /* ── HTML ── */
  document.body.insertAdjacentHTML('beforeend', `
    <button id="aafy-btn" title="Asistente IA AAFY">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
    </button>
    <div id="aafy-panel" class="hidden">
      <div id="aafy-head">
        <div>
          <div class="title">Asistente IA · AAFY</div>
          <div class="sub">Pregunta sobre los datos del dashboard</div>
        </div>
        <button id="aafy-close">×</button>
      </div>
      <div id="aafy-msgs"></div>
      <div id="aafy-typing">
        <div class="ad"></div><div class="ad"></div><div class="ad"></div>
        Analizando datos...
      </div>
      <div id="aafy-key-bar">
        <span>🔑 Pega tu API Key de Google AI:</span>
        <input type="password" id="aafy-key-in" placeholder="AIzaSy...">
        <button id="aafy-key-ok">Guardar</button>
      </div>
      <div id="aafy-input-row">
        <textarea id="aafy-input" placeholder="Escribe tu pregunta..." rows="1"></textarea>
        <button id="aafy-send">&#10148;</button>
      </div>
    </div>
  `);

  /* ── Referencias ── */
  const panel   = document.getElementById('aafy-panel');
  const msgs    = document.getElementById('aafy-msgs');
  const input   = document.getElementById('aafy-input');
  const sendBtn = document.getElementById('aafy-send');
  const typing  = document.getElementById('aafy-typing');
  const keyBar  = document.getElementById('aafy-key-bar');
  const keyIn   = document.getElementById('aafy-key-in');

  let open = false;
  let gemKey = localStorage.getItem(STORAGE_KEY) || '';

  /* ── Toggle panel ── */
  function toggle() {
    open = !open;
    panel.classList.toggle('hidden', !open);
    if (open && msgs.children.length === 0) {
      addMsg('bot', '¡Hola! Soy tu asistente fiscal. Puedo analizar los datos que ves en pantalla y responder tus preguntas. ¿En qué te ayudo?');
      checkKey();
    }
    if (open) setTimeout(() => input.focus(), 200);
  }

  function checkKey() {
    keyBar.style.display = gemKey ? 'none' : 'flex';
  }

  /* ── Añadir mensaje ── */
  function addMsg(type, text) {
    const d = document.createElement('div');
    d.className = 'am ' + type;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Leer datos del dashboard ── */
  function getContext() {
    const snap = {};

    // KPIs — dashboards de proyección (Profesional, ISN, Alcohólicas)
    [
      'kpiAcumVal','kpiAcumSub','kpiAcumNote',
      'kpiMetaVal','kpiMetaSub','kpiMetaNote',
      'kpiProyVal','kpiProySub','kpiProyNote',
      'kpiOmisosVal','kpiOmisosSub','kpiOmisosNote',
      'statusMsg','periodDominant','footerUpdated',
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t && t !== '-') snap[id] = t; }
    });

    // KPIs — dashboard Padrón Nómina
    const nominaKPIs = {
      'k-imss': 'Total IMSS',
      'k-nom':  'Padrón Nómina',
      'k-sin':  'Sin Nómina',
      'k-ced':  'Cedular Empleados %',
      'k-pro':  'Profesional %',
      'k-hos':  'Hospedaje %',
    };
    Object.entries(nominaKPIs).forEach(([id, label]) => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t && t !== '—') snap[label] = t; }
    });

    // Estado y fecha de actualización
    ['statusBar','updatedAt','pageInfo','bannerText'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t) snap[id] = t; }
    });

    // Secciones de texto — proyección
    ['ytdCard','avanceContent','segGrid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t) snap[id] = t.slice(0, 600); }
    });

    // Tabla (primeras 20 filas)
    const tb = document.querySelector('tbody');
    if (tb) {
      snap.tabla_muestra = Array.from(tb.querySelectorAll('tr'))
        .slice(0, 20)
        .map(r => r.innerText.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');
    }

    // KPI cards genéricos — cualquier dashboard
    ['.kpi-card', '.kpi'].forEach(sel => {
      document.querySelectorAll(sel).forEach((card, i) => {
        const label = card.querySelector('.kpi-label');
        const val   = card.querySelector('.kpi-value, .kpi-val');
        if (label && val) {
          const key = label.innerText.trim();
          const v   = val.innerText.trim();
          if (key && v && v !== '-' && v !== '—') snap['kpi_' + key] = v;
        }
      });
    });

    snap.pagina = document.title;
    return JSON.stringify(snap, null, 2);
  }

  /* ── Enviar mensaje ── */
  async function send() {
    const text = input.value.trim();
    if (!text) return;
    if (!gemKey) {
      addMsg('err', 'Por favor guarda tu API Key primero (ver cuadro amarillo arriba).');
      keyBar.style.display = 'flex';
      return;
    }

    input.value = '';
    input.style.height = 'auto';
    addMsg('user', text);
    sendBtn.disabled = true;
    typing.style.display = 'flex';
    msgs.scrollTop = msgs.scrollHeight;

    const ctx = getContext();
    const prompt = `Eres un asistente fiscal experto de la Agencia de Administración Fiscal del Estado de Yucatán (AAFY). Analiza los datos del siguiente dashboard y responde en español de forma concisa, directa y profesional.

DATOS ACTUALES DEL DASHBOARD:
${ctx}

PREGUNTA: ${text}

Responde de forma breve. Usa números exactos cuando los tengas. Si detectas algo relevante fuera de lo preguntado (riesgo de no cumplir meta, omisos críticos, etc.), menciónalo en una línea al final.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.25, maxOutputTokens: 600 }
          })
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || `Error HTTP ${res.status}`;
        if (res.status === 400 || msg.includes('API_KEY_INVALID')) {
          gemKey = ''; localStorage.removeItem(STORAGE_KEY); checkKey();
          throw new Error('API Key inválida. Verifica en aistudio.google.com/apikey');
        }
        throw new Error(msg);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(Sin respuesta)';
      addMsg('bot', reply.trim());
    } catch (e) {
      addMsg('err', '⚠ ' + e.message);
    } finally {
      sendBtn.disabled = false;
      typing.style.display = 'none';
      msgs.scrollTop = msgs.scrollHeight;
    }
  }

  /* ── Eventos ── */
  document.getElementById('aafy-btn').addEventListener('click', toggle);
  document.getElementById('aafy-close').addEventListener('click', toggle);
  sendBtn.addEventListener('click', send);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  document.getElementById('aafy-key-ok').addEventListener('click', () => {
    const k = keyIn.value.trim();
    if (!k) return;
    gemKey = k;
    localStorage.setItem(STORAGE_KEY, k);
    keyIn.value = '';
    keyBar.style.display = 'none';
    addMsg('bot', '✓ API Key guardada. ¡Listo! Ahora puedes hacerme preguntas sobre los datos del dashboard.');
  });

  // También guardar con Enter en el campo de key
  keyIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('aafy-key-ok').click();
  });
})();
