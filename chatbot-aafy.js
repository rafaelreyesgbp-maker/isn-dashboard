/**
 * AAFY · Asistente IA
 * Widget de chat con Google Gemini (gratuito)
 * Pegar antes de </body> en cualquier dashboard:
 *   <script src="chatbot-aafy.js"></script>
 */
(function () {
  const STORAGE_KEY    = 'aafy_gemini_key';
  const DRIVE_KEY_STORE = 'aafy_drive_key';
  const DRIVE_FOLDER   = '1IvbQNewoE3n6GSMTUeAAeZZR2AGEaLo3';
  const COL_RFC        = 0;    // Columna A: RFC
  const COL_CONTRIB    = 1;    // Columna B: Contribuyente
  const COL_PERIODO    = 5;    // Columna F: Periodo de pago
  const COL_L          = 11;   // Columna L: Recaudación 1
  const COL_N          = 13;   // Columna N: Recaudación 2

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
        <div style="width:100%;font-weight:700;margin-bottom:4px">🔑 Configura tus claves API (una sola vez)</div>
        <div style="width:100%;display:flex;gap:6px;align-items:center">
          <span style="white-space:nowrap;font-size:11px">Gemini (IA):</span>
          <input type="password" id="aafy-key-in" placeholder="AIzaSy... (de aistudio.google.com)">
        </div>
        <div style="width:100%;display:flex;gap:6px;align-items:center;margin-top:4px">
          <span style="white-space:nowrap;font-size:11px">Drive (datos):</span>
          <input type="password" id="aafy-drive-in" placeholder="AIzaSy... (la misma del dashboard)">
        </div>
        <button id="aafy-key-ok" style="margin-top:6px;width:100%">Guardar claves</button>
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

  let open    = false;
  let gemKey  = localStorage.getItem(STORAGE_KEY)    || '';
  let driveKey = localStorage.getItem(DRIVE_KEY_STORE) || '';

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
    keyBar.style.display = (gemKey && driveKey) ? 'none' : 'flex';
  }

  /* ── Añadir mensaje ── */
  function addMsg(type, text) {
    const d = document.createElement('div');
    d.className = 'am ' + type;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── Helpers para Drive ── */
  function parseMXN(val) {
    if (val === undefined || val === null || val === '') return 0;
    return parseFloat(String(val).replace(/[$,\s]/g, '')) || 0;
  }

  function parseCSV(text) {
    const lines = text.split('\n');
    return lines.map(line => {
      const cols = []; let cur = '', inQ = false;
      for (const ch of line + ',') {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      return cols;
    }).filter(r => r.length > 1 && r.some(c => c));
  }

  async function fetchDriveContext(driveKey) {
    try {
      // 1. Listar archivos en la carpeta
      const listRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER}'+in+parents` +
        `&fields=files(id,name,mimeType)&orderBy=name&key=${driveKey}`
      );
      if (!listRes.ok) {
        const err = await listRes.json().catch(() => ({}));
        return { error: `Drive API ${listRes.status}: ${err?.error?.message || 'Sin acceso'}` };
      }
      const { files = [] } = await listRes.json();
      if (!files.length) return { error: 'La carpeta está vacía o no es accesible.' };

      // Soportar Google Sheets Y archivos Excel (.xls / .xlsx)
      const XLS_TYPES = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.google-apps.spreadsheet',
      ];
      const targets = files.filter(f => XLS_TYPES.includes(f.mimeType));
      if (!targets.length) return { archivos: files.map(f => f.name + ' (' + f.mimeType + ')'), nota: 'No se encontraron archivos Excel ni Google Sheets.' };

      // 2. Descargar y parsear cada archivo
      // Requiere SheetJS (window.XLSX) — ya incluido en los dashboards
      if (!window.XLSX) {
        // Cargar SheetJS dinámicamente si no está disponible
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      // Tomar solo los 2 archivos más recientes para no saturar el navegador
      const toProcess = targets.slice(-2);

      let headers = null;
      const allRows = [];

      async function fetchWithTimeout(url, ms = 20000) {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), ms);
        try {
          const res = await fetch(url, { signal: ctrl.signal });
          clearTimeout(tid);
          return res;
        } catch (e) { clearTimeout(tid); throw e; }
      }

      async function parseFile(file) {
        if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
          const res = await fetchWithTimeout(
            `https://docs.google.com/spreadsheets/d/${file.id}/export?format=csv&key=${driveKey}`
          );
          if (!res.ok) return [];
          return parseCSV(await res.text());
        } else {
          const res = await fetchWithTimeout(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${driveKey}`
          );
          if (!res.ok) return [];
          const ab  = await res.arrayBuffer();
          const wb  = window.XLSX.read(ab, { type: 'array' });
          const ws  = wb.Sheets[wb.SheetNames[0]];
          return window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
                   .map(r => r.map(c => String(c)));
        }
      }

      const results = await Promise.allSettled(toProcess.map(f => parseFile(f)));

      results.forEach((result, i) => {
        if (result.status !== 'fulfilled') return;
        const rows = result.value;
        if (!rows || rows.length < 2) return;
        if (!headers) headers = rows[0];
        rows.slice(1).forEach(r => {
          if (r.some(c => c && String(c).trim()))
            allRows.push({ _archivo: toProcess[i].name, _row: r });
        });
      });

      if (!allRows.length) return { archivos: sheets.map(s => s.name), nota: 'Archivos vacíos o sin acceso.' };

      // 3. Calcular recaudación (col L + col N) por entidad (col A o B)
      let totalL = 0, totalN = 0;
      const byEntity = {};

      allRows.forEach(({ _archivo, _row }) => {
        const rfc      = (_row[COL_RFC]     || '').trim();
        const contrib  = (_row[COL_CONTRIB] || '').trim();
        const periodo  = (_row[COL_PERIODO] || '').trim();
        const l        = parseMXN(_row[COL_L]);
        const n        = parseMXN(_row[COL_N]);
        totalL += l;
        totalN += n;

        // Agrupar por RFC + Contribuyente
        const key = rfc || contrib;
        if (key) {
          if (!byEntity[key]) byEntity[key] = { rfc, contribuyente: contrib, colL: 0, colN: 0, periodos: new Set(), archivo: _archivo };
          byEntity[key].colL += l;
          byEntity[key].colN += n;
          if (periodo) byEntity[key].periodos.add(periodo);
        }
      });

      // Top 50 contribuyentes por recaudación total
      const topEntidades = Object.entries(byEntity)
        .map(([, v]) => ({
          rfc: v.rfc,
          contribuyente: v.contribuyente,
          recaudacion_total: v.colL + v.colN,
          col_L: v.colL,
          col_N: v.colN,
          periodos: [...v.periodos].join(', '),
          archivo: v.archivo
        }))
        .sort((a, b) => b.recaudacion_total - a.recaudacion_total)
        .slice(0, 50);

      // Agrupar también por periodo
      const byPeriodo = {};
      allRows.forEach(({ _row }) => {
        const periodo = (_row[COL_PERIODO] || 'Sin periodo').trim();
        if (!byPeriodo[periodo]) byPeriodo[periodo] = { colL: 0, colN: 0, registros: 0 };
        byPeriodo[periodo].colL    += parseMXN(_row[COL_L]);
        byPeriodo[periodo].colN    += parseMXN(_row[COL_N]);
        byPeriodo[periodo].registros++;
      });

      return {
        archivos: sheets.map(s => s.name),
        total_registros: allRows.length,
        encabezados: headers,
        estructura: { A: 'RFC', B: 'Contribuyente', F: 'Periodo de pago', L: 'Recaudación col L', N: 'Recaudación col N' },
        recaudacion_col_L: totalL,
        recaudacion_col_N: totalN,
        recaudacion_total: totalL + totalN,
        por_periodo: byPeriodo,
        top_contribuyentes: topEntidades,
        muestra_filas: allRows.slice(0, 20).map(r => ({
          rfc: r._row[COL_RFC],
          contribuyente: r._row[COL_CONTRIB],
          periodo: r._row[COL_PERIODO],
          col_L: r._row[COL_L],
          col_N: r._row[COL_N],
        }))
      };

    } catch (e) {
      return { error: e.message };
    }
  }

  /* ── Genera resumen estadístico del dataset completo ── */
  function resumeDataset(rows) {
    if (!rows || !rows.length) return null;
    const keys = Object.keys(rows[0]);
    const summary = { total: rows.length, campos: keys };

    // Columnas numéricas: min, max, suma, promedio
    keys.forEach(k => {
      const nums = rows.map(r => Number(r[k])).filter(n => !isNaN(n) && n !== null);
      if (nums.length > rows.length * 0.5) {
        const sum = nums.reduce((a, b) => a + b, 0);
        summary['num_' + k] = {
          min: Math.min(...nums),
          max: Math.max(...nums),
          suma: sum,
          promedio: +(sum / nums.length).toFixed(2),
          count: nums.length
        };
      }
    });

    // Columnas booleanas/categóricas: conteo de true/valores únicos
    keys.forEach(k => {
      const vals = rows.map(r => r[k]);
      const uniq = [...new Set(vals)];
      if (uniq.length <= 10 && uniq.length > 1 && !summary['num_' + k]) {
        const counts = {};
        vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
        summary['cat_' + k] = counts;
      }
    });

    // Top 20 por campo numérico más relevante (trabajadores)
    const numKey = keys.find(k => summary['num_' + k] && k.toLowerCase().includes('trab'))
                || keys.find(k => summary['num_' + k]);
    if (numKey) {
      summary['top20_por_' + numKey] = [...rows]
        .sort((a, b) => Number(b[numKey]) - Number(a[numKey]))
        .slice(0, 20);
    }

    return summary;
  }

  /* ── Leer datos del dashboard ── */
  function getContext() {
    const snap = {};
    snap.pagina = document.title;

    // ── 1. Dataset completo en memoria (tiene prioridad sobre el DOM) ──
    // Padrón Nómina: variable global "allRows"
    if (window.allRows && Array.isArray(window.allRows) && window.allRows.length) {
      snap.total_registros = window.allRows.length;
      // Resumen estadístico completo
      snap.resumen = resumeDataset(window.allRows);
      // Muestra de hasta 150 filas para análisis detallado
      snap.muestra = window.allRows.slice(0, 150);
    }

    // Dashboards de proyección: variables comunes
    const varNames = ['rowsData','omisosData','datos','records','tableData','dataRows','sheetData'];
    varNames.forEach(v => {
      if (window[v] && Array.isArray(window[v]) && window[v].length && !snap.resumen) {
        snap.total_registros = window[v].length;
        snap.resumen = resumeDataset(window[v]);
        snap.muestra = window[v].slice(0, 150);
      }
    });

    // ── 2. KPIs del DOM ──
    [
      'kpiAcumVal','kpiAcumSub','kpiAcumNote',
      'kpiMetaVal','kpiMetaSub','kpiMetaNote',
      'kpiProyVal','kpiProySub','kpiProyNote',
      'kpiOmisosVal','kpiOmisosSub','kpiOmisosNote',
      'statusMsg','periodDominant','footerUpdated',
      'statusBar','updatedAt','pageInfo',
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t && t !== '-' && t !== '—') snap[id] = t; }
    });

    // KPIs Padrón Nómina
    const nominaKPIs = {
      'k-imss': 'Total IMSS', 'k-nom': 'Padrón Nómina',
      'k-sin': 'Sin Nómina',  'k-ced': 'Cedular Emp %',
      'k-pro': 'Profesional %','k-hos': 'Hospedaje %',
    };
    Object.entries(nominaKPIs).forEach(([id, label]) => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t && t !== '—') snap[label] = t; }
    });

    // KPI cards genéricos
    ['.kpi-card', '.kpi'].forEach(sel => {
      document.querySelectorAll(sel).forEach(card => {
        const lbl = card.querySelector('.kpi-label');
        const val = card.querySelector('.kpi-value, .kpi-val');
        if (lbl && val) {
          const k = lbl.innerText.trim(), v = val.innerText.trim();
          if (k && v && v !== '-' && v !== '—') snap['kpi_' + k] = v;
        }
      });
    });

    // Secciones de texto
    ['ytdCard','avanceContent','segGrid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { const t = el.innerText.trim(); if (t) snap[id] = t.slice(0, 800); }
    });

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

    let driveCtx = null;
    if (driveKey) {
      const driveMsg = addMsg('bot', '⏳ Consultando archivos de Drive...');
      try {
        driveCtx = await fetchDriveContext(driveKey);
        if (driveCtx && driveCtx.error) {
          driveMsg.textContent = '⚠ Drive: ' + driveCtx.error;
          driveCtx = null;
        } else if (!driveCtx) {
          driveMsg.textContent = '⚠ Drive: No se pudo acceder a la carpeta. Verifica que la clave tenga la Drive API habilitada y que la carpeta sea accesible.';
        } else if (driveCtx.nota) {
          driveMsg.textContent = '⚠ Drive: ' + driveCtx.nota;
          driveCtx = null;
        } else {
          driveMsg.textContent = `✓ Drive: ${driveCtx.total_registros} registros de ${driveCtx.archivos?.length || 0} archivo(s). Analizando...`;
        }
      } catch (e) {
        driveMsg.textContent = '⚠ Drive error: ' + e.message;
        driveCtx = null;
      }
    }

    const prompt = `Eres un asistente fiscal experto de la Agencia de Administración Fiscal del Estado de Yucatán (AAFY). Responde en español de forma concisa, directa y profesional.

DATOS DEL DASHBOARD (DOM):
${ctx}

${driveCtx ? `DATOS COMPLETOS DE GOOGLE DRIVE (carpeta de recaudación):
La recaudación se calcula sumando columna L + columna N.
${JSON.stringify(driveCtx, null, 2)}` : '(Sin acceso a Drive en este momento)'}

PREGUNTA: ${text}

Responde con números exactos cuando los tengas. Menciona de qué archivo o fuente viene la información. Si no encuentras el dato específico pedido, di claramente qué sí tienes disponible.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${gemKey}`,
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
    const kGem   = keyIn.value.trim();
    const kDrive = document.getElementById('aafy-drive-in').value.trim();
    if (!kGem && !kDrive) return;
    if (kGem)   { gemKey   = kGem;   localStorage.setItem(STORAGE_KEY,    kGem);   keyIn.value = ''; }
    if (kDrive) { driveKey = kDrive; localStorage.setItem(DRIVE_KEY_STORE, kDrive); document.getElementById('aafy-drive-in').value = ''; }
    if (gemKey && driveKey) {
      keyBar.style.display = 'none';
      addMsg('bot', '✓ Claves guardadas. ¡Listo! Puedo consultar tanto los datos del dashboard como los archivos de Drive.');
    } else if (gemKey) {
      addMsg('bot', '✓ Clave Gemini guardada. Falta la clave de Drive para acceder a los datos completos.');
    }
  });

  keyIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('aafy-key-ok').click();
  });
  document.getElementById('aafy-drive-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('aafy-key-ok').click();
  });
})();
