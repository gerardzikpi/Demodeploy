/**
 * Demodeploy - Sleek Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyCLI();
  initPipelineSimulator();
  initTableFiltering();
  initModal();
  initRegionPingJitter();
  initChartInteractivity();
});

/* =========================================================
   Toast Notification System
   ========================================================= */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' 
    ? '✨' 
    : type === 'error' 
    ? '⚠️' 
    : '🚀';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* =========================================================
   CLI Command Copy to Clipboard
   ========================================================= */
function initCopyCLI() {
  const copyBtn = document.getElementById('copyCliBtn');
  const cliText = document.getElementById('cliCommandText');

  if (!copyBtn || !cliText) return;

  copyBtn.addEventListener('click', () => {
    const textToCopy = cliText.innerText.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
      `;
      copyBtn.style.color = 'var(--accent-emerald)';
      copyBtn.style.borderColor = 'var(--accent-emerald)';
      
      showToast('CLI command copied to clipboard!', 'success');

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.color = '';
        copyBtn.style.borderColor = '';
      }, 2000);
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  });
}

/* =========================================================
   Interactive Deployment Pipeline Simulation
   ========================================================= */
function initPipelineSimulator() {
  const triggerBtn = document.getElementById('triggerDeployBtn');
  const resetBtn = document.getElementById('resetDeployBtn');
  const terminalBody = document.getElementById('terminalOutput');
  const progressBar = document.getElementById('pipelineProgressBar');
  const steps = document.querySelectorAll('.pipeline-step');

  if (!triggerBtn || !terminalBody) return;

  let isDeploying = false;
  let deployTimeout = null;

  const logsSequence = [
    { step: 0, progress: 20, text: '<span class="t-cyan">[GIT]</span> Pulling latest commit <span class="t-purple">#9f2a71d</span> from branch <span class="t-cyan">main</span>...' },
    { step: 0, progress: 25, text: '<span class="t-cyan">[GIT]</span> Verifying GPG signatures: Valid verified commit.' },
    { step: 1, progress: 45, text: '<span class="t-yellow">[BUILD]</span> Initializing build environment (Python 3.12 / Django 6.1)...' },
    { step: 1, progress: 50, text: '<span class="t-yellow">[BUILD]</span> Compiling static assets and minifying CSS bundle (42.4 KB)...' },
    { step: 2, progress: 65, text: '<span class="t-purple">[TEST]</span> Running automated test suite: 28 test suites passed (0 errors).' },
    { step: 3, progress: 85, text: '<span class="t-yellow">[DOCKER]</span> Building multi-stage container image: demodeploy-edge:latest...' },
    { step: 3, progress: 90, text: '<span class="t-cyan">[DOCKER]</span> Pushing image layers to edge registry (sha256:d834a8...)' },
    { step: 4, progress: 100, text: '<span class="t-green">[DEPLOY]</span> Propagating to 74 global edge points in 18ms...' },
    { step: 4, progress: 100, text: '<span class="t-green">✔ Deployment successful! Active on https://demodeploy.dev</span>' }
  ];

  function appendLog(html) {
    const p = document.createElement('div');
    p.className = 'terminal-line';
    p.innerHTML = html;
    terminalBody.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function resetPipeline() {
    clearTimeout(deployTimeout);
    isDeploying = false;
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      Simulate Deployment
    `;
    progressBar.style.width = '0%';
    steps.forEach(s => {
      s.classList.remove('active', 'completed');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetPipeline();
      terminalBody.innerHTML = `
        <div class="terminal-line"><span class="t-muted">// Ready for deployment trigger. Click 'Simulate Deployment' above.</span></div>
      `;
      showToast('Pipeline simulator reset', 'info');
    });
  }

  triggerBtn.addEventListener('click', () => {
    if (isDeploying) return;
    isDeploying = true;
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
      Deploying...
    `;

    terminalBody.innerHTML = '';
    appendLog('<span class="t-muted">// Initiating automated deployment pipeline...</span>');

    let currentIndex = 0;

    function runNextStep() {
      if (currentIndex >= logsSequence.length) {
        isDeploying = false;
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Re-run Pipeline
        `;
        showToast('Deployment finished successfully!', 'success');
        return;
      }

      const item = logsSequence[currentIndex];
      appendLog(item.text);

      if (progressBar) {
        progressBar.style.width = `${item.progress}%`;
      }

      steps.forEach((step, idx) => {
        if (idx < item.step) {
          step.classList.remove('active');
          step.classList.add('completed');
        } else if (idx === item.step) {
          step.classList.add('active');
          step.classList.remove('completed');
        } else {
          step.classList.remove('active', 'completed');
        }
      });

      currentIndex++;
      deployTimeout = setTimeout(runNextStep, 650);
    }

    runNextStep();
  });
}

/* =========================================================
   Table Filtering (Tabs & Search)
   ========================================================= */
function initTableFiltering() {
  const tabs = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('deploymentSearch');
  const tableRows = document.querySelectorAll('.custom-table tbody tr');

  function filterRows() {
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.filter || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    tableRows.forEach(row => {
      const env = row.dataset.env || '';
      const text = row.innerText.toLowerCase();

      const matchesTab = (activeTab === 'all') || (env === activeTab);
      const matchesSearch = !query || text.includes(query);

      if (matchesTab && matchesSearch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterRows();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterRows);
  }
}

/* =========================================================
   New Deployment Modal
   ========================================================= */
function initModal() {
  const openBtns = document.querySelectorAll('.btn-open-deploy-modal');
  const modal = document.getElementById('deployModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const deployForm = document.getElementById('deployModalForm');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (deployForm) {
    deployForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const repo = document.getElementById('repoInput')?.value || 'my-app';
      closeModal();
      showToast(`Initiating build for repository: ${repo}`, 'success');
      
      // Auto trigger pipeline simulator if on screen
      const triggerBtn = document.getElementById('triggerDeployBtn');
      if (triggerBtn) {
        setTimeout(() => triggerBtn.click(), 400);
      }
    });
  }
}

/* =========================================================
   Regional Edge Latency Dynamic Jitter
   ========================================================= */
function initRegionPingJitter() {
  const pings = document.querySelectorAll('.region-ping-val');
  if (!pings.length) return;

  setInterval(() => {
    pings.forEach(el => {
      const base = parseInt(el.dataset.base || '24', 10);
      const jitter = Math.floor(Math.random() * 5) - 2;
      const newVal = Math.max(8, base + jitter);
      el.textContent = `${newVal}ms`;
    });
  }, 4000);
}

/* =========================================================
   Chart Interactivity
   ========================================================= */
function initChartInteractivity() {
  const chartWrapper = document.querySelector('.chart-container');
  const hoverBadge = document.getElementById('chartHoverBadge');

  if (!chartWrapper || !hoverBadge) return;

  chartWrapper.addEventListener('mousemove', (e) => {
    const rect = chartWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(Math.max(x / rect.width, 0), 1);
    
    // Approximate latency value based on curve
    const latencyVal = Math.round(18 + Math.sin(pct * Math.PI * 2) * 6 + Math.random() * 2);
    
    hoverBadge.style.opacity = '1';
    hoverBadge.style.left = `${Math.min(Math.max(x - 30, 10), rect.width - 70)}px`;
    hoverBadge.innerText = `${latencyVal}ms`;
  });

  chartWrapper.addEventListener('mouseleave', () => {
    hoverBadge.style.opacity = '0';
  });
}
