const sampleImages = [
  'https://via.placeholder.com/800x600.png?text=MRI+Sample+1',
  'https://via.placeholder.com/800x600.png?text=MRI+Sample+2',
  'https://via.placeholder.com/800x600.png?text=MRI+Sample+3',
  'https://via.placeholder.com/800x600.png?text=MRI+Sample+4',
  'https://via.placeholder.com/800x600.png?text=MRI+Sample+5'
];


let historyData = JSON.parse(localStorage.getItem('brain_history')) || [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1758691463569-66de91d76452?auto=format&q=60&w=900',
    tumorType: 'Benign',
    confidence: 94,
    date: 'November 16, 2025',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1612836696857-bf3d0eab59a9?auto=format&q=60&w=900',
    tumorType: 'Benign',
    confidence: 87,
    date: 'November 10, 2025',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1549925245-f20a1bac6454?auto=format&q=60&w=900',
    tumorType: 'Malignant',
    confidence: 92,
    date: 'November 3, 2025',
  }
];


let currentResult = JSON.parse(localStorage.getItem('brain_current')) || {
  tumorType: 'Benign',
  confidence: 94,
  location: 'Frontal Lobe',
  size: '2.3 cm',
  cellsAffected: false,
  impactLevel: 15,
  imageUrl: sampleImages[0],
  id: '1',
  patientName: 'John Doe',
  scanDate: 'November 16, 2025',
  notes: 'The detected tumor shows characteristics consistent with a benign growth. Recommend follow-up scan in 6 months.'
};

function renderHomeSections() {
  const g = document.getElementById('sampleGallery');
  if (!g) return;
  sampleImages.forEach(src=>{
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Sample MRI';
    img.addEventListener('click', ()=> openModal({imageUrl:src, tumorType:'Sample', confidence:0, date: '—'}));
    g.appendChild(img);
  });

  const features = [
    {icon:'🎯', title:'Accurate Tumor Detection', description:'Advanced AI algorithms precisely identify tumor locations in brain MRI scans'},
    {icon:'🛡️', title:'Benign / Malignant Classification', description:'Classify tumors with high confidence to assist in treatment planning'},
    {icon:'📊', title:'Cell Impact Analysis', description:'Analyze whether surrounding brain cells are affected by the tumor'}
  ];
  const fgrid = document.getElementById('featuresGrid');
  if (!fgrid) return;
  features.forEach(f=>{
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.innerHTML = `<div class="feature-icon">${f.icon}</div><h3>${f.title}</h3><p class="muted">${f.description}</p>`;
    fgrid.appendChild(card);
  });
}

function initScanModule(){
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const captureBtn = document.getElementById('captureBtn');
  const preview = document.getElementById('preview');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const cameraMeta = document.getElementById('cameraMeta');
  const capturedThumb = document.getElementById('capturedThumb');

  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const clearBtn = document.getElementById('clearBtn');
  const uploadMeta = document.getElementById('uploadMeta');
  const uploadThumb = document.getElementById('uploadThumb');
  const uploadName = document.getElementById('uploadName');

  const analyzeBtn = document.getElementById('analyzeBtn');
  const scanResult = document.getElementById('scanResult');

  if (!startBtn || !analyzeBtn) return; 

  let stream = null;
  let currentFile = null;

  function enableAnalyze(){ analyzeBtn.disabled = !currentFile; }

  startBtn.addEventListener('click', async ()=>{
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      preview.srcObject = stream;
      preview.style.display = 'block';
      videoPlaceholder.style.display = 'none';
      startBtn.disabled = true; stopBtn.disabled=false; captureBtn.disabled=false;
    }catch(e){
      console.error('camera error', e);
      alert('Unable to access camera. Check permissions.');
    }
  });

  stopBtn.addEventListener('click', ()=>{
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    preview.srcObject = null; preview.style.display='none'; videoPlaceholder.style.display='block';
    startBtn.disabled = false; stopBtn.disabled=true; captureBtn.disabled=true;
  });

  captureBtn.addEventListener('click', ()=>{
    if(!preview || !preview.videoWidth) return alert('Camera not ready');
    const canvas = document.createElement('canvas'); canvas.width = preview.videoWidth; canvas.height = preview.videoHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(preview,0,0,canvas.width,canvas.height);
    canvas.toBlob(blob=>{
      if(!blob) return;
      const file = new File([blob],'captured-mri.jpg',{type:'image/jpeg'});
      currentFile = file;
      showPreviewFromFile(file, capturedThumb, document.getElementById('capturedName'), cameraMeta);
      showPreviewFromFile(file, uploadThumb, uploadName, uploadMeta);
      clearBtn.style.display='inline-block';
      enableAnalyze();
      // stop camera
      if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
      preview.srcObject=null; preview.style.display='none'; videoPlaceholder.style.display='block';
      startBtn.disabled=false; stopBtn.disabled=true; captureBtn.disabled=true;
    },'image/jpeg',0.92);
  });

  function showPreviewFromFile(file, thumbEl, nameEl, metaEl){
    const reader = new FileReader();
    reader.onload = function(e){
      thumbEl.src = e.target.result;
      metaEl.style.display='flex';
    };
    reader.readAsDataURL(file);
    nameEl.textContent = file.name || 'image';
  }

  dropArea.addEventListener('click', ()=> fileInput.click());
  dropArea.addEventListener('dragover', e=>{ e.preventDefault(); dropArea.classList.add('dragover'); });
  dropArea.addEventListener('dragleave', ()=> dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', e=>{ e.preventDefault(); dropArea.classList.remove('dragover'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f) handleFileChosen(f); });

  fileInput.addEventListener('change', e=> { const f = e.target.files && e.target.files[0]; if(f) handleFileChosen(f); });
  browseBtn.addEventListener('click', ()=> fileInput.click());
  clearBtn.addEventListener('click', ()=> { currentFile=null; uploadMeta.style.display='none'; cameraMeta.style.display='none'; clearBtn.style.display='none'; enableAnalyze(); });

  function handleFileChosen(file){
    if(!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.dcm')) { alert('Unsupported file type.'); return; }
    currentFile = file;
    showPreviewFromFile(file, uploadThumb, uploadName, uploadMeta);
    cameraMeta.style.display='none';
    clearBtn.style.display='inline-block';
    enableAnalyze();
  }

  analyzeBtn.addEventListener('click', ()=> {
    if(!currentFile) return alert('Please upload or capture an MRI scan first.');
    scanResult.innerHTML = `<div class="note info">Analyzing... (simulated)</div>`;
    setTimeout(()=>{
      const imageUrl = URL.createObjectURL(currentFile);
      currentResult = {
        tumorType: Math.random() > 0.6 ? 'Malignant' : 'Benign',
        confidence: Math.floor(80 + Math.random()*15),
        location: ['Frontal Lobe','Temporal Lobe','Parietal Lobe'][Math.floor(Math.random()*3)],
        size: `${(1 + Math.random()*3).toFixed(1)} cm`,
        cellsAffected: Math.random() > 0.75,
        impactLevel: Math.floor(Math.random()*40),
        imageUrl,
        id: String(Date.now()),
        patientName: 'John Doe',
        scanDate: new Date().toLocaleDateString(),
        notes: 'Simulated note: follow-up recommended.'
      };
      historyData.unshift({
        id: currentResult.id,
        imageUrl: currentResult.imageUrl,
        tumorType: currentResult.tumorType,
        confidence: currentResult.confidence,
        date: currentResult.scanDate
      });
      localStorage.setItem('brain_history', JSON.stringify(historyData));
      localStorage.setItem('brain_current', JSON.stringify(currentResult));
      location.href = 'results.html';
    }, 1400);
  });

  if(dropArea){
    dropArea.addEventListener('keydown', e=> { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); fileInput.click(); } });
  }
}

function renderResultsUI(result){
  const resultImage = document.getElementById('resultImage');
  if (resultImage) resultImage.src = result.imageUrl || sampleImages[0];
  const resultLocation = document.getElementById('resultLocation');
  if (resultLocation) resultLocation.textContent = result.location;
  const resultType = document.getElementById('resultType');
  if (resultType) resultType.textContent = result.tumorType;
  const resultConfidence = document.getElementById('resultConfidence');
  if (resultConfidence) resultConfidence.textContent = result.confidence + '%';
  const resultConfBar = document.getElementById('resultConfBar');
  if (resultConfBar) setTimeout(()=> { resultConfBar.style.width = result.confidence + '%'; }, 120);
  const cellsAffected = document.getElementById('cellsAffected');
  if (cellsAffected) cellsAffected.textContent = result.cellsAffected ? 'Yes' : 'No';
  const impactVal = document.getElementById('impactVal');
  if (impactVal) impactVal.textContent = result.impactLevel + '%';
  const impactBar = document.getElementById('impactBar');
  if (impactBar) setTimeout(()=> { impactBar.style.width = result.impactLevel + '%'; }, 140);

  const sumType = document.getElementById('sumType');
  if (sumType) sumType.textContent = result.tumorType;
  const sumLoc = document.getElementById('sumLoc');
  if (sumLoc) sumLoc.textContent = result.location;
  const sumSize = document.getElementById('sumSize');
  if (sumSize) sumSize.textContent = result.size;
  const sumConf = document.getElementById('sumConf');
  if (sumConf) sumConf.textContent = result.confidence + '%';
  const sumCells = document.getElementById('sumCells');
  if (sumCells) sumCells.textContent = result.cellsAffected ? 'Yes' : 'No';
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  if (downloadReportBtn) downloadReportBtn.addEventListener('click', ()=> downloadReport(result));
}

function downloadReport(result){
  const now = new Date().toISOString();
  const text = [
    'Brain MRI Analysis Report',
    `Generated: ${now}`,
    '----------------------------------------',
    `Tumor Type: ${result.tumorType}`,
    `Confidence: ${result.confidence}%`,
    `Location: ${result.location}`,
    `Size: ${result.size}`,
    `Cells Affected: ${result.cellsAffected ? 'Yes':'No'}`,
    '',
    'Notes:',
    result.notes || ''
  ].join('\n');
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `brain-report-${result.id}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function renderHistory(){
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = '';
  if(!historyData || historyData.length===0){
    const tpl = document.getElementById('emptyHistoryTpl'); list.appendChild(document.importNode(tpl.content,true)); return;
  }
  historyData.forEach(item=>{
    const el = document.createElement('div'); el.className='history-item';
    el.tabIndex = 0;
    el.innerHTML = `<img class="thumb" src="${item.imageUrl}" alt="scan ${item.id}"/><div style="flex:1"><div style="font-weight:700">${item.tumorType}</div><div class="muted">${item.date}</div></div><div style="text-align:right"><div style="font-weight:800">${item.confidence}%</div><div class="muted">Confidence</div></div>`;
    el.addEventListener('click', ()=> openModal(item));
    el.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') openModal(item); });
    list.appendChild(el);
  });
}

const modal = document.getElementById('historyModal');
const modalImg = document.getElementById('modalImg');
const modalInfo = document.getElementById('modalInfo');
const modalClose = document.getElementById('modalClose');
function openModal(item){
  if (!modal || !modalImg || !modalInfo) return;
  modalImg.src = item.imageUrl;
  modalInfo.innerHTML = `<div style="font-weight:700">${item.tumorType}</div><div class="muted">${item.date}</div><div style="margin-top:8px">Confidence: ${item.confidence}%</div>`;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeModal(){ 
  if (!modal) return;
  modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; 
}
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });

function renderAboutFeatures(){
  const f = [
    {icon:'🛡️', title:'HIPAA Compliant', description:'All patient data is encrypted and securely stored'},
    {icon:'👩‍⚕️', title:'Expert Validated', description:'Reviewed and approved by radiologists'},
    {icon:'🤖', title:'AI-Powered', description:'Advanced neural networks trained on extensive datasets'}
  ];
  const grid = document.getElementById('aboutFeatures');
  if (!grid) return;
  f.forEach(item=>{
    const c = document.createElement('div'); c.className='feature-card';
    c.innerHTML = `<div class="feature-icon">${item.icon}</div><h3>${item.title}</h3><p class="muted">${item.description}</p>`;
    grid.appendChild(c);
  });
}

function animateStats(){
  document.querySelectorAll('.stat-value').forEach(el=>{
    const target = parseInt(el.getAttribute('data-target')||0,10);
    if(isNaN(target)) return;
    let v=0; const step = Math.max(1, Math.floor(target/40));
    const iv = setInterval(()=>{ v += step; if(v>=target){ v=target; clearInterval(iv);} el.textContent = target >= 1000 ? (v.toLocaleString()) : v + (el.dataset.target==='2' ? 's' : ''); }, 20);
  });
}

function renderReportFromQuery(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || currentResult.id || '1';
  let r = historyData.find(h => h.id === id) || currentResult;
  if (!r || r.id !== id) r = currentResult; // fallback
  const reportImg = document.getElementById('reportImg');
  if (reportImg) reportImg.src = r.imageUrl || sampleImages[0];
  const ids = ['reportPatient','reportDate','reportLoc','rTumorType','rLocation','rSize','rConfidence','rCells','rId','rNotes'];
  const mapping = {
    reportPatient: r.patientName || 'John Doe',
    reportDate: r.scanDate || new Date().toLocaleDateString(),
    reportLoc: r.location,
    rTumorType: r.tumorType,
    rLocation: r.location,
    rSize: r.size,
    rConfidence: (r.confidence||0) + '%',
    rCells: r.cellsAffected ? 'Yes' : 'No',
    rId: '#'+r.id,
    rNotes: r.notes || ''
  };
  ids.forEach(idk=>{ const el = document.getElementById(idk); if(el) el.textContent = mapping[idk]; });
}

const printReportBtn = document.getElementById('printReportBtn');
if (printReportBtn) printReportBtn.addEventListener('click', ()=> window.print());
const dlReportBtn = document.getElementById('dlReportBtn');
if (dlReportBtn) dlReportBtn.addEventListener('click', ()=> {
  renderReportFromQuery();
  const r = currentResult;
  const now = new Date().toISOString();
  const lines = [
    'Brain MRI Analysis Report',
    `Report ID: ${r.id}`,
    `Generated: ${now}`,
    '----------------------------------------',
    `Patient: ${r.patientName}`,
    `Scan Date: ${r.scanDate}`,
    `Tumor Type: ${r.tumorType}`,
    `Location: ${r.location}`,
    `Size: ${r.size}`,
    `Confidence: ${r.confidence}%`,
    `Cells Affected: ${r.cellsAffected ? 'Yes' : 'No'}`,
    '',
    'Notes:',
    r.notes || ''
  ].join('\n');
  const blob = new Blob([lines], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `brain-report-${r.id}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

window.renderHomeSections = renderHomeSections;
window.initScanModule = initScanModule;
window.renderHistory = renderHistory;
window.renderResultsUI = renderResultsUI;
window.renderReportFromQuery = renderReportFromQuery;
window.downloadReport = downloadReport;
window.openModal = openModal;
window.animateStats = animateStats;
window.renderAboutFeatures = renderAboutFeatures;

