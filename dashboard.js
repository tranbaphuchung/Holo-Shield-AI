// IndexedDB Setup
const DB_NAME = 'HoloShieldDB';
const DB_VERSION = 1;
let db;

// Toast Notification System
function showToast(type, title, message, duration = 5000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">×</button>
    <div class="toast-progress"></div>
  `;
  
  container.appendChild(toast);
  
  // Add confetti for success
  if (type === 'success') {
    createConfetti();
  }
  
  // Play subtle sound (optional - can be disabled)
  playToastSound(type);
  
  // Close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));
  
  // Auto remove after duration
  setTimeout(() => removeToast(toast), duration);
  
  return toast;
}

function playToastSound(type) {
  // Create audio context for subtle notification sounds
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 700
    };
    
    oscillator.frequency.value = frequencies[type] || 700;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio context not supported
  }
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

function createConfetti() {
  const colors = ['#60efff', '#00d4ff', '#51cf66', '#ffd43b', '#ff6b6b'];
  const confettiCount = 30;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentElement) {
        confetti.parentElement.removeChild(confetti);
      }
    }, 3000);
  }
}

// Initialize Database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      if (!db.objectStoreNames.contains('reports')) {
        const reportStore = db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
        reportStore.createIndex('category', 'category', { unique: false });
        reportStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('evidence')) {
        const evidenceStore = db.createObjectStore('evidence', { keyPath: 'id', autoIncrement: true });
        evidenceStore.createIndex('type', 'type', { unique: false });
        evidenceStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('scans')) {
        const scanStore = db.createObjectStore('scans', { keyPath: 'id', autoIncrement: true });
        scanStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        messageStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Database operations
function addData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Update active view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Load view data
    if (view === 'dashboard') loadDashboard();
    if (view === 'reports') loadReports();
    if (view === 'evidence') loadEvidence();
    if (view === 'community') loadMessages();
    
    // Show navigation toast
    const viewNames = {
      dashboard: 'Dashboard Overview',
      scanner: 'Scam Scanner',
      reports: 'Community Reports',
      recovery: 'Recovery Help',
      evidence: 'Evidence Vault',
      community: 'Community Chat',
      student: 'Student Support'
    };
    
    if (view !== 'dashboard') {
      showToast('info', viewNames[view], `Switched to ${viewNames[view]}`, 2000);
    }
  });
});

// Dashboard functionality
async function loadDashboard() {
  // Load stats
  const scans = await getAllData('scans');
  const reports = await getAllData('reports');
  const evidence = await getAllData('evidence');
  
  document.getElementById('total-scans').textContent = scans.length;
  document.getElementById('threats-blocked').textContent = scans.filter(s => s.result.riskScore >= 60).length;
  document.getElementById('community-reports').textContent = reports.length;
  document.getElementById('evidence-count').textContent = evidence.length;
  
  // Load recent scans
  loadRecentScans(scans);
  
  // Load recent reports
  loadRecentReports(reports);
}

function loadRecentScans(scans) {
  const container = document.getElementById('recent-scans');
  container.innerHTML = '';
  
  if (scans.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M12 2L3 5v6c0 5.25 3.91 9.73 9 11 5.09-1.27 9-5.75 9-11V5l-9-3z" fill="currentColor" opacity="0.2"/></svg>
        <p>No scans yet</p>
        <small>Start by scanning a suspicious link or message</small>
      </div>
    `;
    return;
  }
  
  scans.slice(-5).reverse().forEach(scan => {
    const riskClass = scan.result.riskScore >= 60 ? 'danger' : 
                      scan.result.riskScore >= 30 ? 'warning' : 'safe';
    
    const item = document.createElement('div');
    item.className = `activity-item ${riskClass}`;
    item.innerHTML = `
      <div class="activity-info">
        <h4>${scan.result.riskLevel}</h4>
        <p>${scan.content.substring(0, 40)}${scan.content.length > 40 ? '...' : ''}</p>
      </div>
      <span class="activity-time">${formatTimeAgo(scan.timestamp)}</span>
    `;
    container.appendChild(item);
  });
}

function loadRecentReports(reports) {
  const container = document.getElementById('recent-reports');
  container.innerHTML = '';
  
  if (reports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M4 4h16v12H7l-3 3V4z" fill="currentColor" opacity="0.18"/></svg>
        <p>No reports yet</p>
        <small>Be the first to report a scam</small>
      </div>
    `;
    return;
  }
  
  reports.slice(-3).reverse().forEach(report => {
    const item = document.createElement('div');
    item.className = 'report-item';
    item.innerHTML = `
      <span class="badge badge-${getCategoryColor(report.category)}">${formatCategory(report.category)}</span>
      <h4>${report.title}</h4>
      <p>${report.description.substring(0, 80)}${report.description.length > 80 ? '...' : ''}</p>
    `;
    container.appendChild(item);
  });
}

function formatTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000); // seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Quick scan button
document.getElementById('quick-scan-btn').addEventListener('click', () => {
  document.querySelector('[data-view="scanner"]').click();
});

// Quick action buttons
document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelector(`[data-view="${view}"]`).click();
  });
});

// Safety tips
const safetyTips = [
  "Never share your banking passwords or PINs, even if someone claims to be from your bank. Banks will never ask for this information via email, text, or phone.",
  "Be suspicious of urgent requests for money or personal information. Scammers create a sense of urgency to pressure you into acting without thinking.",
  "Check the sender's email address carefully. Scammers often use addresses that look similar to legitimate ones but have small differences.",
  "Hover over links before clicking to see the actual URL. If it looks suspicious or doesn't match the claimed destination, don't click it.",
  "If an offer seems too good to be true, it probably is. Be especially wary of prizes, lottery wins, or investment opportunities you didn't sign up for.",
  "Never pay for a job, rental property, or purchase using gift cards, cryptocurrency, or wire transfers to strangers. These payment methods are hard to trace and recover.",
  "Verify requests independently. If someone claims to be from a company, hang up and call the official number from their website, not the number they provide.",
  "Keep your software and antivirus up to date. Many scams exploit security vulnerabilities in outdated software.",
  "Use two-factor authentication (2FA) on all important accounts. This adds an extra layer of security even if your password is compromised.",
  "Be cautious with rental listings. If you can't physically inspect a property or meet the landlord in person, it could be a scam."
];

let currentTipIndex = 0;

document.getElementById('next-tip').addEventListener('click', () => {
  currentTipIndex = (currentTipIndex + 1) % safetyTips.length;
  document.getElementById('daily-tip').textContent = safetyTips[currentTipIndex];
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
  showToast('warning', 'Logout Confirmation', 'Click again within 3 seconds to confirm logout.', 3000);
  
  // Create temporary confirmation
  const confirmLogout = () => {
    // Clear user data
    localStorage.removeItem('userEmail');
    
    showToast('success', 'Logging Out...', 'Redirecting to home page.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  };
  
  // Add one-time click listener for confirmation
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.style.background = 'rgba(255, 107, 107, 0.3)';
  logoutBtn.style.borderColor = 'var(--danger)';
  
  const confirmHandler = () => {
    confirmLogout();
    logoutBtn.removeEventListener('click', confirmHandler);
  };
  
  logoutBtn.addEventListener('click', confirmHandler, { once: true });
  
  // Reset button style after 3 seconds
  setTimeout(() => {
    logoutBtn.style.background = '';
    logoutBtn.style.borderColor = '';
    logoutBtn.removeEventListener('click', confirmHandler);
  }, 3000);
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Update active view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Load view data
    if (view === 'reports') loadReports();
    if (view === 'evidence') loadEvidence();
    if (view === 'community') loadMessages();
  });
});

// Scanner functionality
document.getElementById('scan-btn').addEventListener('click', async () => {
  const input = document.getElementById('scan-input').value.trim();
  const type = document.getElementById('scan-type').value;
  
  if (!input) {
    showToast('warning', 'Input Required', 'Please enter something to scan');
    return;
  }
  
  showToast('info', 'Analyzing...', 'Scanning for threats and suspicious patterns');
  
  const result = await analyzeContent(input, type);
  displayScanResult(result);
  
  // Save scan to database
  await addData('scans', {
    content: input,
    type: type,
    result: result,
    timestamp: new Date().toISOString()
  });
  
  // Show result toast
  if (result.riskScore >= 60) {
    showToast('error', 'High Risk Detected!', 'This content shows multiple warning signs. Avoid interaction.');
  } else if (result.riskScore >= 30) {
    showToast('warning', 'Medium Risk', 'Some suspicious characteristics detected. Proceed with caution.');
  } else {
    showToast('success', 'Low Risk', 'No major threats detected, but always stay vigilant.');
  }
  
  loadDashboard();
});

function analyzeContent(content, type) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate AI analysis
      const indicators = [];
      let riskScore = 0;
      let riskLevel = 'Low Risk';
      
      // URL analysis
      if (type === 'url' || type === 'auto') {
        if (content.includes('bit.ly') || content.includes('tinyurl')) {
          indicators.push({ type: 'warning', text: 'Shortened URL detected - cannot verify destination' });
          riskScore += 30;
        }
        if (!content.startsWith('https://')) {
          indicators.push({ type: 'warning', text: 'Not using secure HTTPS connection' });
          riskScore += 20;
        }
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(content)) {
          indicators.push({ type: 'danger', text: 'Using IP address instead of domain name - highly suspicious' });
          riskScore += 40;
        }
        if (content.match(/paypal|bank|login|verify|account|secure/i)) {
          indicators.push({ type: 'warning', text: 'Contains common phishing keywords' });
          riskScore += 25;
        }
      }
      
      // Phone analysis
      if (type === 'phone' || (type === 'auto' && /\d{10,}/.test(content))) {
        indicators.push({ type: 'safe', text: 'Phone number format detected' });
        if (content.includes('+61')) {
          indicators.push({ type: 'safe', text: 'Australian phone number' });
        } else {
          indicators.push({ type: 'warning', text: 'International or unknown number' });
          riskScore += 20;
        }
      }
      
      // Email analysis
      if (type === 'email' || (type === 'auto' && content.includes('@'))) {
        if (!content.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          indicators.push({ type: 'danger', text: 'Invalid email format' });
          riskScore += 50;
        }
        if (content.match(/@(gmail|yahoo|hotmail|outlook)\./i)) {
          indicators.push({ type: 'warning', text: 'Free email provider - verify sender identity' });
          riskScore += 15;
        }
      }
      
      // Message analysis
      if (type === 'message' || type === 'auto') {
        const urgencyWords = ['urgent', 'immediately', 'act now', 'limited time', 'expire', 'suspended'];
        if (urgencyWords.some(word => content.toLowerCase().includes(word))) {
          indicators.push({ type: 'danger', text: 'Contains urgency pressure tactics - common scam indicator' });
          riskScore += 35;
        }
        if (content.match(/click here|verify now|confirm identity/i)) {
          indicators.push({ type: 'danger', text: 'Suspicious call-to-action detected' });
          riskScore += 30;
        }
        if (content.match(/prize|winner|congratulations|claim/i)) {
          indicators.push({ type: 'danger', text: 'Possible prize/lottery scam language' });
          riskScore += 40;
        }
      }
      
      // Determine risk level
      if (riskScore >= 60) {
        riskLevel = 'High Risk';
      } else if (riskScore >= 30) {
        riskLevel = 'Medium Risk';
      } else {
        riskLevel = 'Low Risk';
      }
      
      if (indicators.length === 0) {
        indicators.push({ type: 'safe', text: 'No obvious red flags detected' });
      }
      
      resolve({
        riskScore,
        riskLevel,
        indicators,
        description: getRiskDescription(riskLevel, riskScore)
      });
    }, 1500);
  });
}

function getRiskDescription(level, score) {
  if (level === 'High Risk') {
    return 'This content shows multiple warning signs commonly associated with scams. We strongly recommend not interacting with it and reporting it if you received it unsolicited.';
  } else if (level === 'Medium Risk') {
    return 'This content has some suspicious characteristics. Proceed with caution and verify the source independently before taking any action.';
  } else {
    return 'This content appears relatively safe, but always verify the source and be cautious with personal information.';
  }
}

function displayScanResult(result) {
  const resultDiv = document.getElementById('scan-result');
  const needle = document.getElementById('risk-needle');
  const levelEl = document.getElementById('risk-level');
  const descEl = document.getElementById('risk-description');
  const indicatorsList = document.getElementById('threat-indicators');
  
  resultDiv.classList.remove('hidden');
  
  // Animate needle
  const needlePosition = Math.min(result.riskScore, 100);
  needle.style.left = `${10 + (needlePosition * 0.8)}%`;
  
  // Update text
  levelEl.textContent = result.riskLevel;
  levelEl.style.color = result.riskLevel === 'High Risk' ? 'var(--danger)' : 
                        result.riskLevel === 'Medium Risk' ? '#ffc107' : 'var(--accent)';
  descEl.textContent = result.description;
  
  // Update indicators
  indicatorsList.innerHTML = '';
  result.indicators.forEach(indicator => {
    const li = document.createElement('li');
    li.className = indicator.type;
    li.textContent = indicator.text;
    indicatorsList.appendChild(li);
  });
  
  // Scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Save scan as report
document.getElementById('save-report-btn').addEventListener('click', () => {
  const input = document.getElementById('scan-input').value;
  document.getElementById('report-content').value = input;
  document.getElementById('report-modal').classList.remove('hidden');
  showToast('info', 'Create Report', 'Fill in the details to submit your report to the community.');
});

// Recovery help
document.getElementById('recovery-btn').addEventListener('click', () => {
  document.querySelector('[data-view="recovery"]').click();
});

document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    const scenario = card.dataset.scenario;
    showRecoverySteps(scenario);
  });
});

function showRecoverySteps(scenario) {
  const stepsDiv = document.getElementById('recovery-steps');
  stepsDiv.classList.remove('hidden');
  
  const steps = getRecoverySteps(scenario);
  stepsDiv.innerHTML = '<h3>Immediate Actions:</h3>';
  
  steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'recovery-step';
    stepDiv.innerHTML = `
      <h4>Step ${index + 1}: ${step.title}</h4>
      <p>${step.description}</p>
      ${step.actions ? `<ul>${step.actions.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
    `;
    stepsDiv.appendChild(stepDiv);
  });
  
  stepsDiv.scrollIntoView({ behavior: 'smooth' });
  
  showToast('info', 'Recovery Guide Ready', 'Follow these steps carefully to protect yourself.');
}

function getRecoverySteps(scenario) {
  const steps = {
    payment: [
      {
        title: 'Contact Your Bank Immediately',
        description: 'Time is critical. Call your bank\'s fraud hotline right now.',
        actions: [
          'Commonwealth Bank: 13 2221',
          'Westpac: 132 032',
          'ANZ: 13 33 50',
          'NAB: 13 22 65',
          'Request immediate transaction freeze',
          'Ask about chargeback options'
        ]
      },
      {
        title: 'Document Everything',
        description: 'Gather all evidence while it\'s fresh.',
        actions: [
          'Take screenshots of all communications',
          'Save transaction receipts',
          'Note exact times and amounts',
          'Record any phone numbers or email addresses'
        ]
      },
      {
        title: 'Report to Authorities',
        description: 'Official reports help track scammers and may assist recovery.',
        actions: [
          'Report to Scamwatch: scamwatch.gov.au',
          'File police report: 131 444',
          'Report to ReportCyber: cyber.gov.au',
          'Contact ACCC: 1300 302 502'
        ]
      },
      {
        title: 'Secure Your Accounts',
        description: 'Prevent further unauthorized access.',
        actions: [
          'Change all banking passwords',
          'Enable two-factor authentication',
          'Monitor accounts daily for suspicious activity',
          'Consider credit monitoring services'
        ]
      }
    ],
    info: [
      {
        title: 'Assess What Was Shared',
        description: 'Determine the extent of information disclosed.',
        actions: [
          'List all personal details shared',
          'Note if you provided: ID numbers, passwords, addresses, financial info',
          'Check if you clicked any links or downloaded files'
        ]
      },
      {
        title: 'Change Passwords Immediately',
        description: 'Secure all potentially compromised accounts.',
        actions: [
          'Change passwords for email, banking, social media',
          'Use unique, strong passwords for each account',
          'Enable two-factor authentication everywhere possible',
          'Use a password manager'
        ]
      },
      {
        title: 'Monitor for Identity Theft',
        description: 'Watch for signs of misuse.',
        actions: [
          'Check bank statements daily',
          'Review credit report (free annually)',
          'Set up fraud alerts with credit bureaus',
          'Watch for unexpected bills or account notifications'
        ]
      },
      {
        title: 'Report the Incident',
        description: 'Create official records.',
        actions: [
          'Report to Scamwatch: scamwatch.gov.au',
          'File police report if ID documents were shared',
          'Notify your bank and credit card companies',
          'Report to IDCARE: 1800 595 160'
        ]
      }
    ],
    clicked: [
      {
        title: 'Disconnect from Internet',
        description: 'If you suspect malware, disconnect immediately.',
        actions: [
          'Turn off WiFi or unplug ethernet cable',
          'This prevents data theft and further infection'
        ]
      },
      {
        title: 'Run Security Scan',
        description: 'Check for malware or spyware.',
        actions: [
          'Use Windows Defender or your antivirus software',
          'Run a full system scan',
          'Consider using Malwarebytes (free version available)',
          'Update all security software first'
        ]
      },
      {
        title: 'Change Passwords',
        description: 'Do this from a different, secure device if possible.',
        actions: [
          'Change email passwords first',
          'Then banking and financial accounts',
          'Update social media and other important accounts',
          'Enable two-factor authentication'
        ]
      },
      {
        title: 'Monitor Accounts',
        description: 'Watch for unauthorized activity.',
        actions: [
          'Check bank accounts daily',
          'Review email for password reset attempts',
          'Look for suspicious logins on social media',
          'Set up account alerts'
        ]
      }
    ],
    account: [
      {
        title: 'Secure the Account',
        description: 'Regain control if possible.',
        actions: [
          'Try to change password immediately',
          'Use "forgot password" if locked out',
          'Contact platform support',
          'Revoke access to third-party apps'
        ]
      },
      {
        title: 'Alert Your Contacts',
        description: 'Warn others about potential scam messages.',
        actions: [
          'Post warning on other social media',
          'Send email/text to close contacts',
          'Explain your account was compromised',
          'Tell them to ignore suspicious messages from you'
        ]
      },
      {
        title: 'Check Connected Accounts',
        description: 'Secure accounts that may be linked.',
        actions: [
          'Change passwords for email',
          'Update passwords for accounts using same login',
          'Check for unauthorized purchases',
          'Review account recovery options'
        ]
      },
      {
        title: 'Report and Document',
        description: 'Create official records.',
        actions: [
          'Report to platform (Facebook, Instagram, etc.)',
          'File report with Scamwatch',
          'Screenshot any scam messages sent from your account',
          'Report to police if financial loss occurred'
        ]
      }
    ]
  };
  
  return steps[scenario] || steps.info;
}

// Reports functionality
document.getElementById('new-report-btn').addEventListener('click', () => {
  document.getElementById('report-modal').classList.remove('hidden');
  showToast('info', 'Submit Report', 'Help protect others by reporting suspicious activity.');
});

document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const report = {
    category: document.getElementById('report-category').value,
    title: document.getElementById('report-title').value,
    description: document.getElementById('report-description').value,
    content: document.getElementById('report-content').value,
    timestamp: new Date().toISOString(),
    upvotes: 0
  };
  
  await addData('reports', report);
  document.getElementById('report-modal').classList.add('hidden');
  document.getElementById('report-form').reset();
  loadReports();
  loadDashboard();
  
  showToast('success', 'Report Submitted!', 'Thank you for helping keep the community safe.');
});

async function loadReports(category = 'all') {
  const reports = await getAllData('reports');
  const filtered = category === 'all' ? reports : reports.filter(r => r.category === category);
  
  const container = document.getElementById('reports-list');
  container.innerHTML = '';
  
  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px;">No reports found. Be the first to submit one!</p>';
    return;
  }
  
  filtered.reverse().forEach(report => {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <span class="badge badge-${getCategoryColor(report.category)}">${formatCategory(report.category)}</span>
      <h3>${report.title}</h3>
      <p>${report.description}</p>
      ${report.content ? `<p style="font-size: 0.85rem; color: var(--accent); word-break: break-all;">${report.content}</p>` : ''}
      <div class="report-meta">
        <span>${new Date(report.timestamp).toLocaleDateString()}</span>
        <span>👍 ${report.upvotes || 0}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function getCategoryColor(category) {
  const colors = {
    phishing: 'danger',
    'fake-website': 'danger',
    'scam-call': 'watch',
    'fake-social': 'watch',
    rental: 'watch',
    job: 'watch',
    other: 'safe'
  };
  return colors[category] || 'safe';
}

function formatCategory(category) {
  return category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadReports(btn.dataset.category);
  });
});

// Evidence functionality
document.getElementById('add-evidence-btn').addEventListener('click', () => {
  document.getElementById('evidence-modal').classList.remove('hidden');
  showToast('info', 'Add Evidence', 'Store important evidence securely for future reference.');
});

document.getElementById('evidence-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const evidence = {
    type: document.getElementById('evidence-type').value,
    title: document.getElementById('evidence-title').value,
    description: document.getElementById('evidence-description').value,
    notes: document.getElementById('evidence-notes').value,
    timestamp: new Date().toISOString()
  };
  
  await addData('evidence', evidence);
  document.getElementById('evidence-modal').classList.add('hidden');
  document.getElementById('evidence-form').reset();
  loadEvidence();
  loadDashboard();
  
  showToast('success', 'Evidence Saved!', 'Your evidence has been securely stored in the vault.');
});

async function loadEvidence() {
  const evidence = await getAllData('evidence');
  const container = document.getElementById('evidence-list');
  container.innerHTML = '';
  
  if (evidence.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px;">No evidence stored yet. Add your first piece of evidence!</p>';
    return;
  }
  
  evidence.reverse().forEach(item => {
    const card = document.createElement('div');
    card.className = 'evidence-card';
    card.innerHTML = `
      <span class="badge badge-safe">${formatCategory(item.type)}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      ${item.notes ? `<p style="font-size: 0.85rem; margin-top: 8px;"><strong>Notes:</strong> ${item.notes}</p>` : ''}
      <span class="timestamp">${new Date(item.timestamp).toLocaleString()}</span>
    `;
    container.appendChild(card);
  });
}

// Community chat
document.getElementById('send-chat-btn').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  
  if (!text) return;
  
  const message = {
    text,
    user: 'You',
    timestamp: new Date().toISOString()
  };
  
  await addData('messages', message);
  input.value = '';
  loadMessages();
  
  showToast('success', 'Message Sent', 'Your message has been posted to the community.');
  
  // Simulate AI response
  setTimeout(async () => {
    const response = {
      text: generateAIResponse(text),
      user: 'Holo Assistant',
      timestamp: new Date().toISOString()
    };
    await addData('messages', response);
    loadMessages();
  }, 1000);
}

function generateAIResponse(userMessage) {
  const lower = userMessage.toLowerCase();
  
  if (lower.includes('link') || lower.includes('url')) {
    return 'I can help you check that link! Go to the "Scan Link" tab and paste it there for a detailed risk analysis.';
  }
  if (lower.includes('scam') || lower.includes('suspicious')) {
    return 'If you\'ve encountered a scam, I recommend: 1) Don\'t interact further, 2) Use our scanner to analyze it, 3) Report it to authorities. Need specific help?';
  }
  if (lower.includes('payment') || lower.includes('money')) {
    return 'If you\'ve made a payment to a scammer, contact your bank immediately! Check the "Recovery Help" section for step-by-step guidance.';
  }
  if (lower.includes('australia') || lower.includes('student')) {
    return 'Check out our "Student Mode" tab for Australia-specific scam information and local reporting contacts!';
  }
  
  return 'Thanks for your message! I\'m here to help with scam detection and recovery. You can scan suspicious content, browse community reports, or get recovery guidance using the menu on the left.';
}

async function loadMessages() {
  const messages = await getAllData('messages');
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  
  if (messages.length === 0) {
    const welcome = document.createElement('div');
    welcome.className = 'chat-message other';
    welcome.innerHTML = '<strong>Holo Assistant</strong><p>Welcome! Ask me anything about scams, suspicious links, or how to stay safe online.</p>';
    container.appendChild(welcome);
    return;
  }
  
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-message ${msg.user === 'You' ? 'user' : 'other'}`;
    div.innerHTML = `<strong>${msg.user}</strong><p>${msg.text}</p>`;
    container.appendChild(div);
  });
  
  container.scrollTop = container.scrollHeight;
}

// Modal close handlers
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.add('hidden');
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

// Initialize app
initDB().then(() => {
  console.log('Database initialized');
  loadDashboard();
  loadReports();
  
  // Add some sample data if database is empty
  addSampleDataIfEmpty();
  
  // Load user info from localStorage
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    const userName = userEmail.split('@')[0].replace(/[._]/g, ' ');
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    document.getElementById('user-name').textContent = userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-plan').textContent = userEmail.includes('.edu') ? 'Student Account' : 'Premium Plan';
  }
  
  // Welcome toast
  setTimeout(() => {
    const userName = document.getElementById('user-name').textContent;
    showToast('info', `Welcome back, ${userName}! 🛡️`, 'Your personal scam protection dashboard is ready.');
  }, 500);
}).catch(err => {
  console.error('Database initialization failed:', err);
  showToast('error', 'Database Error', 'Failed to initialize local storage. Some features may not work.');
});

// Add sample data for demonstration
async function addSampleDataIfEmpty() {
  const scans = await getAllData('scans');
  const reports = await getAllData('reports');
  
  if (scans.length === 0) {
    // Add sample scans
    const sampleScans = [
      {
        content: 'https://secure-bank-login.suspicious-site.com',
        type: 'url',
        result: {
          riskScore: 85,
          riskLevel: 'High Risk',
          indicators: [
            { type: 'danger', text: 'Domain mimics legitimate bank website' },
            { type: 'danger', text: 'Recently registered domain' }
          ]
        },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        content: 'Click here to claim your prize: bit.ly/prize123',
        type: 'message',
        result: {
          riskScore: 70,
          riskLevel: 'High Risk',
          indicators: [
            { type: 'danger', text: 'Contains prize/lottery scam language' },
            { type: 'warning', text: 'Shortened URL detected' }
          ]
        },
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        content: 'https://www.google.com',
        type: 'url',
        result: {
          riskScore: 5,
          riskLevel: 'Low Risk',
          indicators: [
            { type: 'safe', text: 'Well-known legitimate website' },
            { type: 'safe', text: 'Secure HTTPS connection' }
          ]
        },
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    for (const scan of sampleScans) {
      await addData('scans', scan);
    }
  }
  
  if (reports.length === 0) {
    // Add sample reports
    const sampleReports = [
      {
        category: 'phishing',
        title: 'Fake ATO Tax Refund Email',
        description: 'Received email claiming to be from Australian Taxation Office offering tax refund. Link leads to fake login page.',
        content: 'ato-refund-portal.com',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        upvotes: 24
      },
      {
        category: 'rental',
        title: 'Fake Apartment Listing in Sydney CBD',
        description: 'Too-good-to-be-true rental price. Landlord asks for deposit before viewing. Uses stolen photos from real estate sites.',
        content: '+61 400 123 456',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        upvotes: 18
      },
      {
        category: 'scam-call',
        title: 'NBN Technical Support Scam',
        description: 'Caller claimed to be from NBN saying my internet will be disconnected. Asked for remote access to computer.',
        content: '+61 2 9876 5432',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        upvotes: 31
      }
    ];
    
    for (const report of sampleReports) {
      await addData('reports', report);
    }
  }
  
  // Reload dashboard with sample data
  loadDashboard();
  loadReports();
}
