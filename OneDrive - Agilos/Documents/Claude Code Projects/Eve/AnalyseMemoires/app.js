// app.js — CUTM Evaluation App
// Université Catholique de Louvain — Certificat Universitaire en Thérapie Manuelle 2026

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const TFF_SECTIONS = [
  {
    key: 's1',
    label: 'Section 1 — Identification et Synthèse (3 pts)',
    criteria: ['titre_mots_cles', 'resume', 'introduction'],
  },
  {
    key: 's2',
    label: 'Section 2 — Présentation du Patient et Contexte (4 pts)',
    criteria: ['anamnese', 'modele_curtin', 'chronologie'],
  },
  {
    key: 's3',
    label: 'Section 3 — Démarche Diagnostique et Raisonnement (4 pts)',
    criteria: ['resultats_cliniques', 'raisonnement'],
  },
  {
    key: 's4',
    label: 'Section 4 — Intervention et Suivi (5 pts)',
    criteria: ['modalites_tidier', 'resultats_suivi'],
  },
  {
    key: 's5',
    label: 'Section 5 — Discussion et Éthique (4 pts)',
    criteria: ['analyse_critique', 'perspective_patient', 'consentement'],
  },
];

const RC_LEVELS = ['Insuffisant', 'Acceptable', 'Maîtrisé', 'Avancé'];

const TFF_ORAL_BLOCKS = [
  {
    key: 'b1',
    label: 'I. Structure et Contenu de la Présentation (15 pts)',
    criteria: [
      { key: 'pertinence', label: 'Pertinence du contenu : Le contenu est explicite pour comprendre la question de recherche', double: true },
      { key: 'resultats_clinique', label: 'Résultats & Clinique : Contenu complet pour comprendre les résultats et l\'implication clinique', double: true },
      { key: 'fil_conducteur', label: 'Fil conducteur : Transition fluide entre les dias et "take home message" clair', double: false },
      { key: 'synthese', label: 'Esprit de synthèse : Sélection rigoureuse des informations clés', double: false },
      { key: 'ouverture', label: 'Ouverture : Perspective pertinente en fin d\'exposé', double: false },
    ],
  },
  {
    key: 'b2',
    label: 'II. Support Visuel et Maîtrise de l\'Exposé (10 pts)',
    criteria: [
      { key: 'qualite_support', label: 'Qualité du support : Dias non surchargées, visuel privilégié', double: false },
      { key: 'rigueur_academique', label: 'Rigueur académique : Informations correctement référencées', double: false },
      { key: 'independance', label: 'Indépendance : S\'adresse au jury sans lire ses notes ou ses diapositives', double: true },
      { key: 'qualite_formelle', label: 'Qualité formelle : Orthographe, syntaxe et ponctuation de qualité', double: false },
    ],
  },
  {
    key: 'b3',
    label: 'III. Interaction et Réponses aux Questions (15 pts)',
    criteria: [
      { key: 'justesse', label: 'Justesse des réponses : Réponses appropriées, détaillées et argumentées', double: true },
      { key: 'expertise', label: 'Expertise métier : Mobilise les ressources spécifiques à la kinésithérapie', double: true },
      { key: 'distinction', label: 'Distinction critique : Sépare la littérature de son opinion personnelle', double: false },
      { key: 'elocution', label: 'Élocution : Débit de parole, intonation et vocabulaire professionnel', double: false },
    ],
  },
];

const PRESENCE_OPTIONS = ['Tout à fait présent', 'Plutôt présent', 'Peu présent', 'Absent', 'N/A'];

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

const STATE = {
  currentStudent: null,
  currentTab: 'analyse',
  annotations: loadAnnotations(),
};

// ═══════════════════════════════════════════════════════════
// PERSISTENCE — localStorage
// ═══════════════════════════════════════════════════════════

function loadAnnotations() {
  try {
    return JSON.parse(localStorage.getItem('cutm_eval_annotations') || '{}');
  } catch {
    return {};
  }
}

function saveAnnotations() {
  localStorage.setItem('cutm_eval_annotations', JSON.stringify(STATE.annotations));
}

function getAnnotation(studentId, key, defaultVal = '') {
  return STATE.annotations[studentId]?.[key] ?? defaultVal;
}

function setAnnotation(studentId, key, value) {
  if (!STATE.annotations[studentId]) STATE.annotations[studentId] = {};
  STATE.annotations[studentId][key] = value;
  saveAnnotations();
  updateProgressFill(studentId);
}

// ═══════════════════════════════════════════════════════════
// PROGRESS CALCULATION
// ═══════════════════════════════════════════════════════════

function calcProgress(studentId) {
  const s = STUDENTS_DATA[studentId];
  let filled = 0;
  let total = 0;

  // Written criteria
  if (s.writtenCriteria) {
    Object.keys(s.writtenCriteria).forEach(k => {
      total++;
      const v = getAnnotation(studentId, `written_score_${k}`, null);
      if (v !== null && v !== '') filled++;
    });
  }

  // RC criteria
  Object.keys(s.rcCriteria).forEach(k => {
    total++;
    const v = getAnnotation(studentId, `rc_level_${k}`, null);
    if (v !== null && v !== '') filled++;
  });

  // Global notes count too
  const notes = getAnnotation(studentId, 'global_notes', '');
  if (notes.trim().length > 0) { filled++; total++; } else { total++; }

  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}

function calcWrittenTotal(studentId) {
  const s = STUDENTS_DATA[studentId];
  if (!s.writtenCriteria) return null;
  let total = 0;
  Object.entries(s.writtenCriteria).forEach(([k, crit]) => {
    const saved = getAnnotation(studentId, `written_score_${k}`, null);
    if (saved !== null && saved !== '') {
      total += parseFloat(saved);
    } else {
      total += crit.aiScore;
    }
  });
  return Math.round(total * 10) / 10;
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`).classList.add('active');
  const scoreBar = document.getElementById('score-bar');
  scoreBar.classList.toggle('hidden', viewId !== 'student');
}

function showStudent(studentId) {
  STATE.currentStudent = studentId;
  const s = STUDENTS_DATA[studentId];

  document.getElementById('student-name-title').textContent = s.name;
  document.getElementById('student-type-badge').textContent = s.type;
  document.getElementById('app-title').textContent = s.name;

  // Handle disabled tabs
  const ecritBtn = document.getElementById('tab-ecrit-btn');
  if (!s.writtenCriteria) {
    ecritBtn.classList.add('disabled');
    ecritBtn.title = 'RC uniquement — pas de grille écrite pour cet étudiant';
  } else {
    ecritBtn.classList.remove('disabled');
    ecritBtn.title = '';
  }

  // Reset tabs to Analyse
  showTab('analyse');
  showView('student');
  updateScoreBar();
}

function showTab(tabName) {
  STATE.currentTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  const content = document.getElementById(`tab-${tabName}`);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');

  const sid = STATE.currentStudent;
  if (!sid) return;

  switch (tabName) {
    case 'analyse':   renderAnalyseTab(sid); break;
    case 'ecrit':     renderWrittenTab(sid); break;
    case 'oral':      renderOralTab(sid); break;
    case 'questions': renderQuestionsTab(sid); break;
  }
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

function renderDashboard() {
  const grid = document.getElementById('students-grid');
  grid.innerHTML = '';

  Object.values(STUDENTS_DATA).forEach(s => {
    const progress = calcProgress(s.id);
    const writtenTotal = s.writtenCriteria ? calcWrittenTotal(s.id) : null;
    const writtenAI = s.aiWrittenScore;

    let scoreClass = '';
    if (writtenTotal !== null) {
      if (writtenTotal >= 16) scoreClass = 'good';
      else if (writtenTotal >= 12) scoreClass = 'medium';
      else scoreClass = 'low';
    }

    const card = document.createElement('div');
    card.className = 'student-card';
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Voir l'évaluation de ${s.name}`);
    card.innerHTML = `
      <div class="card-name">${s.name}</div>
      <div class="card-type">${s.type}</div>
      <div class="card-scores">
        ${writtenTotal !== null
          ? `<span class="score-chip ${scoreClass}">Écrit : ${writtenTotal}/20 <span style="opacity:.6">(IA: ${writtenAI})</span></span>`
          : '<span class="score-chip">RC uniquement</span>'
        }
        <span class="score-chip">RC: ${s.aiRcLevel}</span>
      </div>
      <div class="progress-row">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width:${progress}%"></div>
        </div>
        <span class="progress-label">${progress}%</span>
      </div>
    `;
    card.addEventListener('click', () => showStudent(s.id));
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════
// ANALYSE TAB
// ═══════════════════════════════════════════════════════════

function renderAnalyseTab(sid) {
  const s = STUDENTS_DATA[sid];

  document.getElementById('summary-list').innerHTML =
    s.summary.map(t => `<li>${escapeHtml(t)}</li>`).join('');

  document.getElementById('strengths-list').innerHTML =
    s.critique.strengths.map(t => `<li>${escapeHtml(t)}</li>`).join('');

  document.getElementById('weaknesses-list').innerHTML =
    s.critique.weaknesses.map(t => `<li>${escapeHtml(t)}</li>`).join('');

  const notesEl = document.getElementById('global-notes');
  notesEl.value = getAnnotation(sid, 'global_notes', '');
  notesEl.oninput = () => setAnnotation(sid, 'global_notes', notesEl.value);
}

// ═══════════════════════════════════════════════════════════
// WRITTEN CRITERIA TAB
// ═══════════════════════════════════════════════════════════

function renderWrittenTab(sid) {
  const s = STUDENTS_DATA[sid];
  const container = document.getElementById('written-grid-container');

  if (!s.writtenCriteria) {
    container.innerHTML = `<div class="panel" style="text-align:center;color:var(--text-lt)">
      Pas de grille écrite disponible pour cet étudiant (RC uniquement).
    </div>`;
    return;
  }

  container.innerHTML = '';

  TFF_SECTIONS.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'written-section';

    // Compute section total (prof scores or AI)
    const sectionTotal = section.criteria.reduce((acc, k) => {
      if (!s.writtenCriteria[k]) return acc;
      const saved = getAnnotation(sid, `written_score_${k}`, null);
      const val = (saved !== null && saved !== '') ? parseFloat(saved) : s.writtenCriteria[k].aiScore;
      return acc + val;
    }, 0);
    const sectionMax = section.criteria.reduce((acc, k) => {
      return acc + (s.writtenCriteria[k]?.maxScore ?? 0);
    }, 0);

    sectionDiv.innerHTML = `
      <div class="written-section-header" data-section="${section.key}">
        <h3>${section.label}</h3>
        <span class="section-score-chip">${sectionTotal.toFixed(1)} / ${sectionMax} pts</span>
      </div>
      <div class="written-section-body" id="body-${section.key}">
        ${section.criteria.map(k => s.writtenCriteria[k] ? renderCriterionRow(sid, k, s.writtenCriteria[k]) : '').join('')}
      </div>
    `;
    container.appendChild(sectionDiv);

    // Toggle collapse
    sectionDiv.querySelector('.written-section-header').addEventListener('click', () => {
      sectionDiv.querySelector('.written-section-body').classList.toggle('collapsed');
    });
  });

  // Update totals display
  const total = calcWrittenTotal(sid);
  document.getElementById('written-total-display').textContent = total !== null ? total.toFixed(1) : '—';
  document.getElementById('written-ai-ref').textContent = s.aiWrittenScore ?? '—';
}

function renderCriterionRow(sid, key, crit) {
  const savedScore = getAnnotation(sid, `written_score_${key}`, '');
  const savedComment = getAnnotation(sid, `written_comment_${key}`, '');

  // Build score options: 0%, 40%, 75%, 100% of max
  const rawOptions = [
    0,
    Math.round(crit.maxScore * 0.40 * 100) / 100,
    Math.round(crit.maxScore * 0.75 * 100) / 100,
    crit.maxScore,
  ];
  // Deduplicate
  const scoreOptions = [...new Set(rawOptions)];
  const labels = {
    0: 'Insuffisant (0%)',
    [rawOptions[1]]: 'Faible (40%)',
    [rawOptions[2]]: 'Satisfaisant (75%)',
    [crit.maxScore]: 'Excellent (100%)',
  };

  const effectiveScore = (savedScore !== '' && savedScore !== null) ? parseFloat(savedScore) : crit.aiScore;

  return `
    <div class="criterion-row" id="crit-row-${key}">
      <div class="criterion-label">${escapeHtml(crit.label)}</div>
      <div class="criterion-max-label">max ${crit.maxScore} pt${crit.maxScore > 1 ? 's' : ''}</div>
      <div><span class="ai-score-badge" title="Score IA suggéré">IA : ${crit.aiScore}</span></div>
      <div>
        <select class="prof-score-select"
          title="Votre note pour ce critère"
          onchange="onWrittenScoreChange('${sid}', '${key}', this.value)">
          ${scoreOptions.map(v => `
            <option value="${v}" ${effectiveScore === v ? 'selected' : ''}>
              ${v} — ${labels[v] || ''}
            </option>
          `).join('')}
        </select>
      </div>
      <div>
        <button class="evidence-btn"
          onclick="showEvidence('${sid}', '${key}', 'written')"
          title="Voir le passage du texte">📄</button>
      </div>
    </div>
    <div class="criterion-comment-row">
      <textarea class="criterion-comment" rows="2"
        placeholder="Commentaire sur ce critère..."
        onblur="setAnnotation('${sid}', 'written_comment_${key}', this.value)"
      >${escapeHtml(savedComment)}</textarea>
    </div>
  `;
}

function onWrittenScoreChange(sid, key, val) {
  setAnnotation(sid, `written_score_${key}`, val);
  // Update section total and global total
  renderWrittenTab(sid);
  updateScoreBar();
}

// ═══════════════════════════════════════════════════════════
// ORAL CRITERIA TAB
// ═══════════════════════════════════════════════════════════

function renderOralTab(sid) {
  const s = STUDENTS_DATA[sid];
  const container = document.getElementById('oral-grid-container');
  container.innerHTML = '';

  // ── RC Criteria section ──
  const rcSection = document.createElement('div');
  rcSection.innerHTML = `<h3 class="rc-section-title">Critères de Raisonnement Clinique (RC)</h3>`;

  Object.entries(s.rcCriteria).forEach(([k, crit]) => {
    const savedLevel = getAnnotation(sid, `rc_level_${k}`, crit.aiLevel);
    const savedComment = getAnnotation(sid, `rc_comment_${k}`, '');

    const card = document.createElement('div');
    card.className = 'rc-criterion-card';
    card.id = `rc-card-${k}`;
    card.innerHTML = `
      <div class="crit-label">${escapeHtml(crit.label)}</div>
      <div class="ai-level-indicator">Niveau IA suggéré : <strong>${crit.aiLevel}</strong></div>
      <div class="rc-level-selector">
        ${RC_LEVELS.map(lv => `
          <button class="level-btn ${savedLevel === lv ? 'selected' : ''}"
            data-level="${lv}"
            onclick="onRcLevelChange('${sid}', '${k}', '${lv}', this.closest('.rc-criterion-card'))">
            ${lv}
          </button>
        `).join('')}
      </div>
      <textarea class="criterion-comment" rows="2"
        placeholder="Commentaire sur ce critère..."
        onblur="setAnnotation('${sid}', 'rc_comment_${k}', this.value)"
      >${escapeHtml(savedComment)}</textarea>
      <button class="evidence-btn" style="margin-top:8px"
        onclick="showEvidence('${sid}', '${k}', 'rc')"
        title="Voir le passage du RC">📄 Evidence</button>
    `;
    rcSection.appendChild(card);
  });
  container.appendChild(rcSection);

  // ── TFF Oral section (if applicable) ──
  if (s.type !== 'RC') {
    const tffOralSection = document.createElement('div');
    tffOralSection.innerHTML = `
      <h3 class="rc-section-title" style="margin-top:24px">
        Grille de Défense Orale — TFF (notation suggérée /40)
      </h3>
      <p class="subtitle" style="margin-bottom:14px">
        Note : Les critères en gras comptent double. Un seul "Absent" sur critère majeur limite à max 24/40.
      </p>
    `;

    TFF_ORAL_BLOCKS.forEach(block => {
      const blockDiv = document.createElement('div');
      blockDiv.className = 'oral-block';
      blockDiv.innerHTML = `<div class="oral-block-header">${block.label}</div>`;

      block.criteria.forEach(crit => {
        const savedVal = getAnnotation(sid, `oral_${block.key}_${crit.key}`, '');
        const savedComment = getAnnotation(sid, `oral_comment_${block.key}_${crit.key}`, '');
        const row = document.createElement('div');
        row.className = 'oral-criterion-row';
        row.id = `oral-row-${block.key}-${crit.key}`;
        row.innerHTML = `
          <div class="oral-crit-label">
            <strong>${escapeHtml(crit.label)}</strong>
            ${crit.double ? '<span class="double-tag">(compte double)</span>' : ''}
          </div>
          <div class="presence-selector">
            ${PRESENCE_OPTIONS.map(p => `
              <button class="presence-btn ${savedVal === p ? 'selected' : ''}"
                data-val="${p}"
                onclick="onPresenceChange('${sid}', '${block.key}', '${crit.key}', '${p}', this.closest('.oral-criterion-row'))">
                ${p}
              </button>
            `).join('')}
          </div>
          <textarea class="criterion-comment" rows="1"
            placeholder="Commentaire..."
            onblur="setAnnotation('${sid}', 'oral_comment_${block.key}_${crit.key}', this.value)"
          >${escapeHtml(savedComment)}</textarea>
        `;
        blockDiv.appendChild(row);
      });

      tffOralSection.appendChild(blockDiv);
    });

    // Oral final score input
    const finalSection = document.createElement('div');
    finalSection.className = 'oral-final-section';
    const savedOralScore = getAnnotation(sid, 'oral_final_score', '');
    finalSection.innerHTML = `
      <label for="oral-final-score-input">Note finale orale :</label>
      <input type="number" id="oral-final-score-input" class="oral-score-num"
        min="0" max="40" value="${escapeHtml(savedOralScore)}"
        placeholder="—"
        onchange="setAnnotation('${sid}', 'oral_final_score', this.value); updateScoreBar();">
      <span class="oral-score-max">/ 40</span>
    `;
    tffOralSection.appendChild(finalSection);
    container.appendChild(tffOralSection);
  }
}

function onRcLevelChange(sid, key, level, card) {
  setAnnotation(sid, `rc_level_${key}`, level);
  card.querySelectorAll('.level-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.level === level);
  });
}

function onPresenceChange(sid, blockKey, critKey, val, row) {
  setAnnotation(sid, `oral_${blockKey}_${critKey}`, val);
  row.querySelectorAll('.presence-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.val === val);
  });
}

// ═══════════════════════════════════════════════════════════
// QUESTIONS TAB
// ═══════════════════════════════════════════════════════════

function renderQuestionsTab(sid) {
  const s = STUDENTS_DATA[sid];

  document.getElementById('questions-list').innerHTML =
    s.oralQuestions.map((q, i) => `
      <div class="question-item">
        <span class="q-num">${i + 1}.</span>${escapeHtml(q)}
      </div>
    `).join('');

  const customEl = document.getElementById('custom-questions-input');
  customEl.value = getAnnotation(sid, 'custom_questions', '');
  customEl.oninput = () => setAnnotation(sid, 'custom_questions', customEl.value);
}

// ═══════════════════════════════════════════════════════════
// SCORE BAR
// ═══════════════════════════════════════════════════════════

function updateScoreBar() {
  const sid = STATE.currentStudent;
  if (!sid) return;

  const s = STUDENTS_DATA[sid];
  const writtenContainer = document.getElementById('score-written-container');

  // Written score
  if (s.writtenCriteria) {
    writtenContainer.style.display = '';
    const total = calcWrittenTotal(sid);
    document.getElementById('score-written-val').textContent = total !== null ? total.toFixed(1) : '—';
  } else {
    writtenContainer.style.display = 'none';
  }

  // Oral max
  const oralMax = s.type === 'RC' ? 20 : 40;
  document.getElementById('score-oral-max').textContent = `/${oralMax}`;

  // Oral score
  const savedOral = getAnnotation(sid, 'oral_final_score', '');
  const oralInput = document.getElementById('score-oral-val');
  if (oralInput) {
    oralInput.value = savedOral;
    oralInput.max = oralMax;
  }

  // Progress
  const progress = calcProgress(sid);
  document.getElementById('score-progress-fill').style.width = progress + '%';
  document.getElementById('score-progress-label').textContent = progress + '%';
}

function updateProgressFill(sid) {
  updateScoreBar();
  // Also refresh dashboard chip
  const card = document.querySelector(`.student-card:nth-of-type(${Object.keys(STUDENTS_DATA).indexOf(sid) + 1})`);
  if (card) {
    const fill = card.querySelector('.progress-bar-fill');
    const label = card.querySelector('.progress-label');
    const p = calcProgress(sid);
    if (fill) fill.style.width = p + '%';
    if (label) label.textContent = p + '%';
  }
}

// ═══════════════════════════════════════════════════════════
// EVIDENCE MODAL
// ═══════════════════════════════════════════════════════════

function showEvidence(sid, criterionKey, type) {
  const s = STUDENTS_DATA[sid];
  const crit = type === 'written'
    ? s.writtenCriteria?.[criterionKey]
    : s.rcCriteria?.[criterionKey];

  if (!crit) return;

  document.getElementById('modal-criterion-label').textContent = crit.label;
  document.getElementById('modal-quote').textContent = crit.evidence.quote;
  document.getElementById('modal-ai-comment').textContent = crit.aiComment;

  const pdfContainer = document.getElementById('modal-pdf-link-container');
  const pdfFile = type === 'written' ? s.tffFile : s.rcFile;

  if (crit.evidence.page && pdfFile) {
    pdfContainer.innerHTML = `
      <a href="${pdfFile}#page=${crit.evidence.page}" target="_blank">
        📄 Ouvrir le PDF à la page ${crit.evidence.page}
      </a>
    `;
  } else {
    pdfContainer.innerHTML = '';
  }

  document.getElementById('evidence-modal').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('evidence-modal').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ═══════════════════════════════════════════════════════════
// COMPARE VIEW
// ═══════════════════════════════════════════════════════════

function renderCompare() {
  const container = document.getElementById('compare-table-container');

  const rows = Object.values(STUDENTS_DATA).map(s => {
    const written = s.writtenCriteria ? calcWrittenTotal(s.id) + '/20' : '—';
    const aiWritten = s.aiWrittenScore ? `${s.aiWrittenScore}/20` : '—';
    const oralScore = getAnnotation(s.id, 'oral_final_score', '');
    const oralDisplay = oralScore ? `${oralScore}/${s.type === 'RC' ? 20 : 40}` : '—';
    const progress = calcProgress(s.id);

    let rowClass = '';
    const wNum = s.writtenCriteria ? calcWrittenTotal(s.id) : null;
    if (wNum !== null && wNum >= 16) rowClass = 'style="background:var(--green-lt)"';

    return `<tr ${rowClass} onclick="showStudent('${s.id}')">
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.type)}</td>
      <td>${written} <span style="color:var(--text-lt);font-size:.78rem">(IA: ${aiWritten})</span></td>
      <td>${escapeHtml(oralDisplay)}</td>
      <td>${escapeHtml(s.aiRcLevel)}</td>
      <td>
        <div class="compare-progress">
          <div class="compare-progress-bar">
            <div class="compare-progress-fill" style="width:${progress}%"></div>
          </div>
          <span style="font-size:.8rem">${progress}%</span>
        </div>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Étudiant</th>
          <th>Type</th>
          <th>Écrit /20</th>
          <th>Oral (saisi)</th>
          <th>Niveau RC (IA)</th>
          <th>Progression</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:10px;font-size:.8rem;color:var(--text-lt)">Cliquez sur une ligne pour accéder à l'évaluation de l'étudiant.</p>
  `;
}

// ═══════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  renderDashboard();
  showView('dashboard');

  // Home button
  document.getElementById('btn-home').addEventListener('click', () => {
    STATE.currentStudent = null;
    document.getElementById('app-title').textContent = 'Évaluation Mémoires CUTM 2026';
    renderDashboard();
    showView('dashboard');
  });

  // Compare button
  document.getElementById('btn-compare').addEventListener('click', () => {
    renderCompare();
    showView('compare');
    document.getElementById('app-title').textContent = 'Comparaison';
  });

  // Save button
  document.getElementById('btn-save').addEventListener('click', () => {
    saveAnnotations();
    const btn = document.getElementById('btn-save');
    btn.textContent = '✓ Sauvegardé !';
    btn.style.background = '#e8f5e9';
    btn.style.color = '#2e7d32';
    setTimeout(() => {
      btn.textContent = '💾 Sauvegarder';
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled') || btn.disabled) return;
      showTab(btn.dataset.tab);
    });
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Oral score input in score bar
  document.getElementById('score-oral-val').addEventListener('input', (e) => {
    if (STATE.currentStudent) {
      setAnnotation(STATE.currentStudent, 'oral_final_score', e.target.value);
    }
  });

  // Print questions button
  document.getElementById('btn-print-questions').addEventListener('click', () => {
    window.print();
  });
});
