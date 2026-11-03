/**
 * Green Lending x Neo Gen Technologies
 * AI-Powered Mortgage Lead Engagement & Texting Platform
 * Core Client Application Logic
 */

// Application State
const state = {
  currentTab: 'simulator',
  currentWorkflow: 'HELOC',
  activeLeadId: 'lead-101',
  simulatorTakeover: false,
  leads: [],
  campaigns: [],
  selectedAddons: {},
  simulatorMessages: {
    HELOC: [
      { sender: 'system', text: 'Campaign Triggered: HELOC Equity Unlock 2026', time: '10:14 AM' },
      { sender: 'ai', text: 'Hi Marcus! This is Alex from Green Lending. Noticed you recently checked home equity rates in Austin. Were you looking to tap your equity for home upgrades or consolidating some debts?', time: '10:15 AM' },
      { sender: 'lead', text: 'Hey Alex, yes we want to remodel the master bath and kitchen. Curious what kind of line we could get without touching our 3.1% first mortgage.', time: '10:18 AM' },
      { sender: 'ai', text: 'Great goal Marcus! A standalone HELOC is perfect because it leaves your 3.1% first mortgage completely untouched. What is your estimated home value and roughly what do you owe today?', time: '10:18 AM' },
      { sender: 'lead', text: 'Homes on our street sell for $680k, and we owe about $310k. Looking to borrow around $95,000.', time: '10:20 AM' },
      { sender: 'ai', text: 'You have fantastic equity (~$370k total, well below 80% CLTV)! I have our senior equity specialist Sarah Jenkins ready to show you rate options with zero prepayment penalties. Can Sarah give you a 5-minute call today at 2:30 PM or 4:00 PM?', time: '10:21 AM' }
    ],
    Refinance: [
      { sender: 'system', text: 'Campaign Triggered: Q4 Refi Rate-Drop Alert', time: '09:40 AM' },
      { sender: 'ai', text: 'Hello Elena! Alex with Green Lending. Mortgage rates had a noticeable dip this week. Are you still interested in lowering your monthly payment on your Phoenix home?', time: '09:41 AM' },
      { sender: 'lead', text: 'Hi Alex. Yeah my rate is 7.125% from last year and my payment is killing me. What are rates looking like now?', time: '09:55 AM' },
      { sender: 'ai', text: '7.125% definitely has room for improvement today! Depending on credit and equity, many clients are saving $350-$500/month. What is your approximate mortgage balance currently?', time: '09:56 AM' }
    ],
    Purchase: [
      { sender: 'system', text: 'Campaign Triggered: First-Time Buyer Launchpad', time: '08:30 AM' },
      { sender: 'ai', text: 'Hi Derek! Alex from Green Lending. Congratulations on beginning your home search in North Carolina! Do you already have a verified pre-approval letter for touring homes?', time: '08:31 AM' },
      { sender: 'lead', text: 'Not yet! We found a townhouse in Cary listed at $475k that we want to put an offer on by Sunday.', time: '08:45 AM' },
      { sender: 'ai', text: 'Exciting news! In Cary homes move quickly, so a rapid pre-approval letter is essential for your offer. How much do you have set aside for your down payment?', time: '08:46 AM' }
    ]
  },
  workflowPresets: {
    HELOC: [
      { label: '💰 $95k Remodel Budget', text: 'Looking to borrow around $95,000 for a kitchen & bath renovation.' },
      { label: '🏡 Home Value & Balance', text: 'Current value is about $680,000 and we owe $310,000 on our 1st mortgage.' },
      { label: '⏱️ Immediate 30-Day Timeline', text: 'We are ready to start construction within 30 days.' },
      { label: '📞 Speak to Loan Officer', text: 'Can I speak with a licensed loan officer today?' },
      { label: '⛔ Simulate STOP (Opt-Out)', text: 'STOP' }
    ],
    Refinance: [
      { label: '📉 High 7.25% Current Rate', text: 'Currently at 7.25% fixed, looking to lower my monthly payment.' },
      { label: '💳 $420k Balance / 750 Credit', text: 'Balance is $420,000 and my credit score is around 750.' },
      { label: '💵 Cash-Out Inquiry', text: 'Can we do a cash-out refinance to pay off $40k in cards?' },
      { label: '📞 Speak to Loan Officer', text: 'Please have someone call me this afternoon.' },
      { label: '⛔ Simulate STOP (Opt-Out)', text: 'STOP' }
    ],
    Purchase: [
      { label: '🎯 $480k Target Budget', text: 'Looking for a home around $480,000 in Raleigh-Durham.' },
      { label: '💵 10% Liquid Down Payment', text: 'We have $50,000 liquid ready for our down payment.' },
      { label: '📄 Urgent Pre-Approval Needed', text: 'We need a verified pre-approval letter for an offer by Sunday!' },
      { label: '📞 Speak to Loan Officer', text: 'Can a mortgage advisor call me right now?' },
      { label: '⛔ Simulate STOP (Opt-Out)', text: 'STOP' }
    ]
  }
};

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  fetchLeads();
  fetchCampaigns();
  renderSimulatorChat();
  renderQuickChips();
});

// Real-time carrier clock
function initClock() {
  const clockEl = document.getElementById('carrierTime');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  update();
  setInterval(update, 30000);
}

// Tab Switching
function switchTab(tabId) {
  state.currentTab = tabId;

  // Update tabs nav
  document.querySelectorAll('.tab-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });

  // Update tab views
  document.querySelectorAll('.tab-view').forEach(el => {
    el.classList.toggle('active', el.id === `tab-${tabId}`);
  });

  if (tabId === 'crm') {
    renderLeadsTable();
  } else if (tabId === 'inbox') {
    renderInbox();
  }
}

// ==========================================================================
// AI SMS SIMULATOR LOGIC
// ==========================================================================

function selectWorkflow(wf) {
  state.currentWorkflow = wf;
  state.simulatorTakeover = false;
  updateSimulatorTakeoverBtn();

  document.querySelectorAll('.wf-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.wf === wf);
  });

  renderSimulatorChat();
  renderQuickChips();
  updateIntelPanelOnWorkflowChange(wf);
}

function updateIntelPanelOnWorkflowChange(wf) {
  const catEl = document.getElementById('extractCategory');
  const valEl = document.getElementById('extractPropValue');
  const balEl = document.getElementById('extractBalance');
  const eqEl = document.getElementById('extractEquity');
  const desEl = document.getElementById('extractDesired');
  const purpEl = document.getElementById('extractPurpose');
  const timeEl = document.getElementById('extractTimeline');
  const loEl = document.getElementById('extractLO');
  const scoreBadge = document.getElementById('simScoreBadge');
  const scoreFill = document.getElementById('simScoreFill');
  const intentText = document.getElementById('simIntentText');

  if (wf === 'HELOC') {
    catEl.textContent = 'HELOC (Home Equity)';
    valEl.textContent = '$680,000';
    balEl.textContent = '$310,000';
    eqEl.textContent = '$370,000 (54% LTV)';
    desEl.textContent = '$95,000';
    purpEl.textContent = 'Kitchen & Bath Remodel';
    timeEl.textContent = 'Ready within 30 days';
    loEl.textContent = 'Sarah Jenkins (Senior LO)';
    setSimulatorScore('Hot', 94, 'High Intent - HELOC Equity Stated');
  } else if (wf === 'Refinance') {
    catEl.textContent = 'Rate & Term Refinance';
    valEl.textContent = '$520,000';
    balEl.textContent = '$410,000';
    eqEl.textContent = 'Current Rate: 7.125%';
    desEl.textContent = 'Target: Save $350+/mo';
    purpEl.textContent = 'Lower Monthly Payment';
    timeEl.textContent = '1-3 Months';
    loEl.textContent = 'David Miller';
    setSimulatorScore('Warm', 78, 'Refinance Goal - Rate Lowering');
  } else if (wf === 'Purchase') {
    catEl.textContent = 'Residential Purchase';
    valEl.textContent = '$480,000 Target';
    balEl.textContent = 'Down Pmt: $50,000 (10%)';
    eqEl.textContent = 'Townhouse in Cary, NC';
    desEl.textContent = 'Needs Rapid Pre-Approval';
    purpEl.textContent = 'Putting Offer on Sunday';
    timeEl.textContent = 'Immediate (This Weekend)';
    loEl.textContent = 'Sarah Jenkins (Senior LO)';
    setSimulatorScore('Hot', 96, 'Offer Impending - Rapid Pre-Approval');
  }
}

function setSimulatorScore(scoreType, scoreVal, intentStr) {
  const badge = document.getElementById('simScoreBadge');
  const fill = document.getElementById('simScoreFill');
  const intent = document.getElementById('simIntentText');

  badge.className = `lead-score-badge ${scoreType.toLowerCase()}`;
  badge.textContent = `${scoreType === 'Hot' ? '🔥' : scoreType === 'Warm' ? '☀️' : '❄️'} ${scoreType} Lead (${scoreVal}%)`;

  fill.className = `meter-fill ${scoreType.toLowerCase()}`;
  fill.style.width = `${scoreVal}%`;

  intent.textContent = intentStr;
}

function renderSimulatorChat() {
  const chatBody = document.getElementById('phoneChatBody');
  const messages = state.simulatorMessages[state.currentWorkflow] || [];

  chatBody.innerHTML = messages.map(m => {
    let senderTag = 'Borrower';
    if (m.sender === 'ai') senderTag = '🤖 Green Lending AI';
    if (m.sender === 'agent') senderTag = '👤 Loan Officer Takeover';

    if (m.sender === 'system') {
      return `<div class="sms-bubble system">${escapeHtml(m.text)}</div>`;
    }

    return `
      <div class="sms-bubble ${m.sender}">
        <span class="sms-sender-tag">${senderTag}</span>
        <div>${escapeHtml(m.text)}</div>
        <div class="sms-meta">${m.time}</div>
      </div>
    `;
  }).join('');

  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderQuickChips() {
  const container = document.getElementById('quickChipsContainer');
  const presets = state.workflowPresets[state.currentWorkflow] || [];

  container.innerHTML = presets.map((p, idx) => `
    <button class="chip-btn" onclick="sendQuickPreset('${escapeHtml(p.text)}')">
      ${escapeHtml(p.label)}
    </button>
  `).join('');
}

function sendQuickPreset(text) {
  const input = document.getElementById('phoneChatInput');
  input.value = text;
  document.getElementById('phoneChatForm').dispatchEvent(new Event('submit'));
}

async function handleSendSms(e) {
  e.preventDefault();
  const input = document.getElementById('phoneChatInput');
  const messageText = input.value.trim();
  if (!messageText) return;

  input.value = '';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Add user message to state & UI
  state.simulatorMessages[state.currentWorkflow].push({
    sender: 'lead',
    text: messageText,
    time: timeNow
  });
  renderSimulatorChat();

  // If agent takeover is active, AI is paused
  if (state.simulatorTakeover) {
    showToast('AI is paused. Loan Officer is currently in manual takeover mode.', 'warning');
    return;
  }

  // Show typing indicator
  const typing = document.getElementById('phoneTypingIndicator');
  typing.style.display = 'flex';

  try {
    const res = await fetch('/api/sms/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: state.currentWorkflow,
        message: messageText
      })
    });

    const data = await res.json();

    // Artificial realistic response delay (800ms)
    setTimeout(() => {
      typing.style.display = 'none';

      state.simulatorMessages[state.currentWorkflow].push({
        sender: 'ai',
        text: data.aiResponse,
        time: data.timestamp || timeNow
      });

      renderSimulatorChat();

      // Update scoring & intent
      if (data.score && data.scoreValue !== undefined) {
        setSimulatorScore(data.score, data.scoreValue, data.intentDetected || 'Lead Responded');
      }

      // Handle takeover / opt out flags
      if (data.takeover) {
        state.simulatorTakeover = true;
        updateSimulatorTakeoverBtn();
        showToast('⚡ Hot Lead Alert: Loan officer handoff recommended!', 'success');
      } else if (data.optOut) {
        showToast('🛡️ TCPA Opt-out recognized. Messaging halted.', 'info');
      }
    }, 850);

  } catch (err) {
    typing.style.display = 'none';
    console.error('Error generating AI response:', err);
  }
}

function toggleSimulatorTakeover() {
  state.simulatorTakeover = !state.simulatorTakeover;
  updateSimulatorTakeoverBtn();

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const text = state.simulatorTakeover
    ? '⚡ Loan Officer Sarah Jenkins initiated Human Agent Takeover. AI messaging paused.'
    : '🤖 Loan Officer resumed Autonomous AI Messaging.';

  state.simulatorMessages[state.currentWorkflow].push({
    sender: 'system',
    text: text,
    time: timeNow
  });

  renderSimulatorChat();
  showToast(state.simulatorTakeover ? 'Loan officer takeover active.' : 'AI engagement resumed.', 'info');
}

function updateSimulatorTakeoverBtn() {
  const btn = document.getElementById('btnTakeoverSimulator');
  const text = document.getElementById('btnTakeoverSimText');
  const aiState = document.getElementById('aiActiveState');

  if (state.simulatorTakeover) {
    btn.classList.add('active-takeover');
    text.textContent = 'Resume AI Automation';
    if (aiState) aiState.textContent = 'Human Agent Active (Sarah Jenkins)';
  } else {
    btn.classList.remove('active-takeover');
    text.textContent = 'Take Over as Loan Officer';
    if (aiState) aiState.textContent = 'AI Active · 1-800-GREEN-LOAN';
  }
}

function simulateOptOut() {
  sendQuickPreset('STOP');
}

function resetSimulatorChat() {
  selectWorkflow(state.currentWorkflow);
  showToast('Simulator conversation reset.', 'info');
}

// ==========================================================================
// MORTGAGE CRM & LEADS LOGIC
// ==========================================================================

async function fetchLeads() {
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    if (data.success && data.leads) {
      state.leads = data.leads;
      updateLeadCountBadges();
      renderLeadsTable();
    }
  } catch (err) {
    console.error('Error fetching leads:', err);
  }
}

function updateLeadCountBadges() {
  const badge = document.getElementById('leadCountBadge');
  if (badge) badge.textContent = state.leads.length;

  const totalEl = document.getElementById('crmTotalLeads');
  if (totalEl) totalEl.textContent = state.leads.length.toLocaleString();

  const hotCount = state.leads.filter(l => l.score === 'Hot').length;
  const warmCount = state.leads.filter(l => l.score === 'Warm').length;
  const takeoverCount = state.leads.filter(l => l.isAgentTakeover).length;

  const hotEl = document.getElementById('crmHotLeads');
  if (hotEl) hotEl.textContent = hotCount;

  const warmEl = document.getElementById('crmWarmLeads');
  if (warmEl) warmEl.textContent = warmCount;

  const toEl = document.getElementById('crmTakeoverCount');
  if (toEl) toEl.textContent = takeoverCount;
}

function renderLeadsTable() {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;

  const catFilter = document.getElementById('filterCategory')?.value || 'ALL';
  const scoreFilter = document.getElementById('filterScore')?.value || 'ALL';
  const search = document.getElementById('leadSearchInput')?.value.toLowerCase().trim() || '';

  const filtered = state.leads.filter(l => {
    if (catFilter !== 'ALL' && l.category !== catFilter) return false;
    if (scoreFilter !== 'ALL' && l.score !== scoreFilter) return false;
    if (search) {
      const matchName = l.name.toLowerCase().includes(search);
      const matchPhone = l.phone.toLowerCase().includes(search);
      const matchLO = (l.assignedLO || '').toLowerCase().includes(search);
      if (!matchName && !matchPhone && !matchLO) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">No mortgage leads found matching filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(lead => {
    let catClass = 'heloc';
    if (lead.category === 'Refinance') catClass = 'refi';
    if (lead.category === 'Purchase') catClass = 'purchase';

    let scoreClass = 'warm';
    if (lead.score === 'Hot') scoreClass = 'hot';
    if (lead.score === 'Cold') scoreClass = 'cold';

    let statusClass = 'engaging';
    if (lead.status === 'Qualified') statusClass = 'qualified';
    if (lead.status === 'Agent Takeover') statusClass = 'takeover';
    if (lead.optedOut) statusClass = 'optout';

    let keyFigures = lead.propertyValue ? `Val: ${lead.propertyValue}` : '';
    if (lead.existingBalance) keyFigures += ` | Bal: ${lead.existingBalance}`;
    if (lead.desiredAmount) keyFigures += ` | Line: ${lead.desiredAmount}`;
    if (lead.downPayment) keyFigures += ` | Down: ${lead.downPayment}`;

    return `
      <tr onclick="openLeadModal('${lead.id}')">
        <td>
          <div class="borrower-cell">
            <span class="borrower-name">${escapeHtml(lead.name)}</span>
            <span class="borrower-contact">${escapeHtml(lead.phone)} • ${escapeHtml(lead.email)}</span>
          </div>
        </td>
        <td>
          <span class="badge-tag ${catClass}">${lead.category}</span>
        </td>
        <td>
          <span class="lead-score-badge ${scoreClass}">
            ${lead.score === 'Hot' ? '🔥' : lead.score === 'Warm' ? '☀️' : '❄️'} ${lead.score} (${lead.scoreValue || 70}%)
          </span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: #cbd5e1;">
          ${escapeHtml(keyFigures || 'Inbound Assessment')}
        </td>
        <td>
          <span style="color: var(--neogen-cyan); font-weight: 600;">${escapeHtml(lead.assignedLO || 'Unassigned')}</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            ${lead.isAgentTakeover ? '⚡ LO Takeover' : lead.status}
          </span>
        </td>
        <td style="color: var(--text-dim); font-size: 0.8rem;">
          ${escapeHtml(lead.lastActivity || 'Recent')}
        </td>
        <td>
          <button class="btn-pill outline" onclick="event.stopPropagation(); openLeadModal('${lead.id}')">
            View File &amp; SMS
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterLeadsTable() {
  renderLeadsTable();
}

// Modal Lead Details
function openLeadModal(leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  state.activeLeadId = leadId;

  document.getElementById('modalLeadName').textContent = lead.name;
  document.getElementById('modalLeadSub').textContent = `${lead.category} Qualification • Assigned to ${lead.assignedLO}`;

  const body = document.getElementById('modalLeadBody');
  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
      
      <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <h4 style="font-size: 0.85rem; color: var(--green-light); margin-bottom: 10px; text-transform: uppercase;">Borrower Contact &amp; Status</h4>
        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px;">
          <div><span style="color: var(--text-muted);">Phone:</span> <strong>${escapeHtml(lead.phone)}</strong></div>
          <div><span style="color: var(--text-muted);">Email:</span> <strong>${escapeHtml(lead.email)}</strong></div>
          <div><span style="color: var(--text-muted);">AI Lead Score:</span> <strong>${lead.score} (${lead.scoreValue}%)</strong></div>
          <div><span style="color: var(--text-muted);">Assigned LO:</span> <strong>${escapeHtml(lead.assignedLO)}</strong></div>
          <div><span style="color: var(--text-muted);">Takeover State:</span> <strong>${lead.isAgentTakeover ? 'Human Active' : 'Autonomous AI'}</strong></div>
        </div>
      </div>

      <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <h4 style="font-size: 0.85rem; color: var(--neogen-cyan); margin-bottom: 10px; text-transform: uppercase;">Mortgage Qualification Data</h4>
        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px;">
          <div><span style="color: var(--text-muted);">Est. Property Value:</span> <strong>${lead.propertyValue || 'N/A'}</strong></div>
          <div><span style="color: var(--text-muted);">Existing Mortgage:</span> <strong>${lead.existingBalance || 'N/A'}</strong></div>
          <div><span style="color: var(--text-muted);">Available Equity / Goal:</span> <strong>${lead.availableEquity || lead.desiredObjective || lead.downPayment || 'N/A'}</strong></div>
          <div><span style="color: var(--text-muted);">Target Timeline:</span> <strong>${lead.timeline || 'Immediate'}</strong></div>
        </div>
      </div>

    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">Two-Way SMS Conversation Audit Trail</h4>
      <button class="btn-takeover" onclick="toggleModalLeadTakeover('${lead.id}')">
        <span>⚡ ${lead.isAgentTakeover ? 'Resume AI' : 'Take Over as LO'}</span>
      </button>
    </div>

    <div style="background: #0d1322; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
      ${(lead.conversation || []).map(m => `
        <div class="sms-bubble ${m.sender}" style="max-width: 90%;">
          <span class="sms-sender-tag">${m.sender === 'ai' ? 'Green Lending AI' : m.sender === 'agent' ? 'Loan Officer' : m.sender === 'system' ? 'System' : 'Borrower'}</span>
          <div>${escapeHtml(m.text)}</div>
          <div class="sms-meta">${m.time}</div>
        </div>
      `).join('')}
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-outline" onclick="closeLeadModal()">Close</button>
      <button class="btn-primary" onclick="goToInboxWithLead('${lead.id}')">Open in Full Two-Way Inbox</button>
    </div>
  `;

  document.getElementById('leadModalBackdrop').classList.add('active');
}

function closeLeadModal() {
  document.getElementById('leadModalBackdrop').classList.remove('active');
}

async function toggleModalLeadTakeover(leadId) {
  try {
    const res = await fetch(`/api/leads/${leadId}/takeover`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await fetchLeads();
      openLeadModal(leadId);
      showToast(data.isAgentTakeover ? 'Human takeover active for lead.' : 'AI engagement resumed.', 'info');
    }
  } catch (err) {
    console.error('Error toggling takeover:', err);
  }
}

function goToInboxWithLead(leadId) {
  closeLeadModal();
  state.activeLeadId = leadId;
  switchTab('inbox');
}

// Add New Inbound Lead Modal
function openNewLeadModal() {
  document.getElementById('newLeadModalBackdrop').classList.add('active');
}

function closeNewLeadModal() {
  document.getElementById('newLeadModalBackdrop').classList.remove('active');
}

async function handleCreateLead(e) {
  e.preventDefault();
  const name = document.getElementById('newLeadName').value;
  const phone = document.getElementById('newLeadPhone').value;
  const email = document.getElementById('newLeadEmail').value;
  const category = document.getElementById('newLeadCategory').value;
  const propertyValue = document.getElementById('newLeadVal').value;
  const assignedLO = document.getElementById('newLeadLO').value;

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, category, propertyValue, assignedLO, source: 'GreenLending.com Form' })
    });
    const data = await res.json();
    if (data.success) {
      closeNewLeadModal();
      await fetchLeads();
      showToast(`New lead ${name} created. Automated AI SMS triggered!`, 'success');
    }
  } catch (err) {
    console.error('Error creating lead:', err);
  }
}

function simulateCsvImport() {
  showToast('Importing sample CSV with 3 mortgage leads from lending aggregator...', 'info');
  setTimeout(async () => {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Montgomery',
        phone: '+1 (415) 890-4412',
        email: 'jordan.m@gmail.com',
        category: 'HELOC',
        propertyValue: '$920,000',
        existingBalance: '$450,000',
        source: 'CSV Aggregator Import'
      })
    });
    await fetchLeads();
    showToast('CSV import complete! 1 new high-equity lead added & queued for SMS.', 'success');
  }, 1000);
}

function exportLeadsCsv() {
  let csv = 'ID,Name,Phone,Email,Category,Score,ScoreValue,Status,AssignedLO\n';
  state.leads.forEach(l => {
    csv += `"${l.id}","${l.name}","${l.phone}","${l.email}","${l.category}","${l.score}","${l.scoreValue}","${l.status}","${l.assignedLO}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `greenlending_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  a.click();
  showToast('Mortgage leads table exported to CSV.', 'success');
}

// ==========================================================================
// TWO-WAY SMS INBOX LOGIC
// ==========================================================================

function renderInbox() {
  renderInboxThreadsList();
  renderActiveInboxConversation();
}

function renderInboxThreadsList(filter = '') {
  const container = document.getElementById('inboxThreadsList');
  if (!container) return;

  const filtered = state.leads.filter(l => {
    if (!filter) return true;
    return l.name.toLowerCase().includes(filter.toLowerCase()) || l.phone.includes(filter);
  });

  container.innerHTML = filtered.map(lead => {
    const isActive = lead.id === state.activeLeadId;
    const lastMsg = lead.conversation && lead.conversation.length > 0
      ? lead.conversation[lead.conversation.length - 1].text
      : 'New Lead Created';

    return `
      <div class="thread-item ${isActive ? 'active' : ''}" onclick="selectInboxLead('${lead.id}')">
        <div class="thread-top">
          <span class="thread-name">${escapeHtml(lead.name)}</span>
          <span class="thread-time">${escapeHtml(lead.lastActivity || '')}</span>
        </div>
        <div class="thread-preview">${escapeHtml(lastMsg)}</div>
        <div class="thread-badges">
          <span class="badge-tag ${lead.category.toLowerCase()}">${lead.category}</span>
          <span class="lead-score-badge ${lead.score.toLowerCase()}" style="font-size: 0.65rem; padding: 1px 6px;">
            ${lead.score === 'Hot' ? '🔥' : lead.score === 'Warm' ? '☀️' : '❄️'} ${lead.score}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function filterThreadsList(query) {
  renderInboxThreadsList(query);
}

function selectInboxLead(leadId) {
  state.activeLeadId = leadId;
  renderInbox();
}

function renderActiveInboxConversation() {
  const lead = state.leads.find(l => l.id === state.activeLeadId) || state.leads[0];
  if (!lead) return;

  document.getElementById('inboxBorrowerName').textContent = lead.name;
  document.getElementById('inboxBorrowerPhone').textContent = lead.phone;
  document.getElementById('inboxBorrowerCategory').textContent = lead.category;
  document.getElementById('inboxAssignedLO').textContent = lead.assignedLO || 'Loan Officer';

  const takeoverBtn = document.getElementById('inboxTakeoverBtn');
  const takeoverText = document.getElementById('inboxTakeoverText');
  if (lead.isAgentTakeover) {
    takeoverBtn.classList.add('active-takeover');
    takeoverText.textContent = 'Resume AI Automation';
  } else {
    takeoverBtn.classList.remove('active-takeover');
    takeoverText.textContent = 'Take Over as Loan Officer';
  }

  // Render Messages
  const body = document.getElementById('inboxMessagesBody');
  body.innerHTML = (lead.conversation || []).map(m => {
    if (m.sender === 'system') {
      return `<div class="sms-bubble system">${escapeHtml(m.text)}</div>`;
    }
    let senderLabel = 'Borrower';
    if (m.sender === 'ai') senderLabel = '🤖 Green Lending AI';
    if (m.sender === 'agent') senderLabel = `👤 LO: ${lead.assignedLO || 'Officer'}`;

    return `
      <div class="sms-bubble ${m.sender}">
        <span class="sms-sender-tag">${senderLabel}</span>
        <div>${escapeHtml(m.text)}</div>
        <div class="sms-meta">${m.time}</div>
      </div>
    `;
  }).join('');

  body.scrollTop = body.scrollHeight;

  // Render Profile Sidebar
  const profileDiv = document.getElementById('inboxProfileDetails');
  profileDiv.innerHTML = `
    <div class="data-row"><span class="d-label">Email:</span><span class="d-val">${escapeHtml(lead.email)}</span></div>
    <div class="data-row"><span class="d-label">Property Value:</span><span class="d-val">${lead.propertyValue || 'N/A'}</span></div>
    <div class="data-row"><span class="d-label">Existing Balance:</span><span class="d-val">${lead.existingBalance || 'N/A'}</span></div>
    <div class="data-row"><span class="d-label">Available Equity:</span><span class="d-val text-emerald">${lead.availableEquity || 'Calculating'}</span></div>
    <div class="data-row"><span class="d-label">Target Timeline:</span><span class="d-val">${lead.timeline || '30-60 Days'}</span></div>
    <div class="data-row"><span class="d-label">Lead Score:</span><span class="d-val text-red">${lead.score} (${lead.scoreValue}%)</span></div>
  `;

  // Render Notes
  const notesDiv = document.getElementById('inboxNotesList');
  notesDiv.innerHTML = (lead.notes || []).map(n => `
    <div class="note-bubble">
      <div class="note-author">
        <span>${escapeHtml(n.author)}</span>
        <span>${escapeHtml(n.date)}</span>
      </div>
      <div>${escapeHtml(n.text)}</div>
    </div>
  `).join('');
}

async function toggleActiveLeadTakeover() {
  const lead = state.leads.find(l => l.id === state.activeLeadId);
  if (!lead) return;

  try {
    const res = await fetch(`/api/leads/${lead.id}/takeover`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await fetchLeads();
      renderInbox();
      showToast(data.isAgentTakeover ? 'Loan officer takeover active.' : 'AI engagement resumed.', 'info');
    }
  } catch (err) {
    console.error('Error toggling takeover:', err);
  }
}

async function handleSendInboxManualMessage(e) {
  e.preventDefault();
  const input = document.getElementById('inboxManualInput');
  const text = input.value.trim();
  if (!text) return;

  const lead = state.leads.find(l => l.id === state.activeLeadId);
  if (!lead) return;

  input.value = '';

  try {
    const res = await fetch(`/api/leads/${lead.id}/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    if (data.success) {
      await fetchLeads();
      renderInbox();
      showToast('SMS dispatched via Twilio/Telnyx gateway.', 'success');
    }
  } catch (err) {
    console.error('Error sending manual SMS:', err);
  }
}

function insertCanned(str) {
  const input = document.getElementById('inboxManualInput');
  input.value = str;
  input.focus();
}

async function addInboxNote() {
  const input = document.getElementById('inboxNewNoteInput');
  const text = input.value.trim();
  if (!text) return;

  const lead = state.leads.find(l => l.id === state.activeLeadId);
  if (!lead) return;

  input.value = '';

  try {
    const res = await fetch(`/api/leads/${lead.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author: 'Sarah Jenkins (LO)' })
    });
    const data = await res.json();
    if (data.success) {
      await fetchLeads();
      renderInbox();
      showToast('Internal note saved.', 'success');
    }
  } catch (err) {
    console.error('Error adding note:', err);
  }
}

// ==========================================================================
// CAMPAIGNS & SEQUENCES LOGIC
// ==========================================================================

async function fetchCampaigns() {
  try {
    const res = await fetch('/api/campaigns');
    const data = await res.json();
    if (data.success && data.campaigns) {
      state.campaigns = data.campaigns;
      renderCampaigns();
    }
  } catch (err) {
    console.error('Error fetching campaigns:', err);
  }
}

function renderCampaigns() {
  const grid = document.getElementById('campaignsGrid');
  if (!grid) return;

  grid.innerHTML = state.campaigns.map(c => `
    <div class="campaign-card">
      <div>
        <div class="campaign-header-row">
          <span class="badge-tag ${c.category.toLowerCase()}">${c.category}</span>
          <span class="status-badge qualified">● ${c.status}</span>
        </div>
        <h3 class="campaign-name">${escapeHtml(c.name)}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Multi-touch sequence with dynamic intent detection and TCPA opt-out safety.</p>

        <div class="camp-stats-grid">
          <div class="c-stat-item">
            <span class="c-stat-label">Total Prospects</span>
            <span class="c-stat-val">${c.totalLeads.toLocaleString()}</span>
          </div>
          <div class="c-stat-item">
            <span class="c-stat-label">Response Rate</span>
            <span class="c-stat-val text-emerald">${c.responseRate}</span>
          </div>
          <div class="c-stat-item">
            <span class="c-stat-label">🔥 Hot Leads</span>
            <span class="c-stat-val text-red">${c.hotLeads}</span>
          </div>
          <div class="c-stat-item">
            <span class="c-stat-label">Opt-Out Rate</span>
            <span class="c-stat-val text-dim">${c.optOutRate}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="btn-pill outline" style="flex: 1;" onclick="showToast('Sequence rules: Active between 8:00 AM - 9:00 PM local time.', 'info')">
          Quiet Hours: 9pm-8am
        </button>
        <button class="btn-pill primary" onclick="showToast('Campaign live. Inbound leads are automatically enqueued.', 'success')">
          Running
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// ADD-ONS & PROPOSAL CALCULATOR LOGIC
// ==========================================================================

function toggleAddon(addonId, oneTimeCost, monthlyCost) {
  const chk = document.getElementById(`chk-${addonId}`);
  if (chk) {
    chk.checked = !chk.checked;
    syncAddonState(addonId, oneTimeCost, monthlyCost);
  }
}

function syncAddonState(addonId, oneTimeCost, monthlyCost) {
  const card = document.getElementById(`addon-${addonId}`);
  const chk = document.getElementById(`chk-${addonId}`);
  
  if (chk && chk.checked) {
    state.selectedAddons[addonId] = { oneTime: oneTimeCost, monthly: monthlyCost };
    if (card) card.classList.add('selected');
    showToast(`Added module: +$${oneTimeCost.toLocaleString()} (+$${monthlyCost}/mo)`, 'info');
  } else {
    delete state.selectedAddons[addonId];
    if (card) card.classList.remove('selected');
  }
  
  updateProposalCalculator();
}

function updateProposalCalculator() {
  const baseOneTime = 5700;
  const baseMonthly = 650;
  
  let addonOneTimeTotal = 0;
  let addonMonthlyTotal = 0;
  let count = 0;

  for (const key in state.selectedAddons) {
    addonOneTimeTotal += state.selectedAddons[key].oneTime;
    addonMonthlyTotal += state.selectedAddons[key].monthly;
    count++;
  }

  const grandOneTime = baseOneTime + addonOneTimeTotal;
  const grandMonthly = baseMonthly + addonMonthlyTotal;

  const countEl = document.getElementById('calcAddonsCount');
  const addOneEl = document.getElementById('calcAddonsOneTime');
  const totOneEl = document.getElementById('calcTotalOneTime');
  const totMonEl = document.getElementById('calcTotalMonthly');
  const monSubEl = document.getElementById('calcMonthlySubtext');

  if (countEl) countEl.textContent = `${count} optional module${count === 1 ? '' : 's'} selected`;
  if (addOneEl) addOneEl.textContent = `+$${addonOneTimeTotal.toLocaleString()}`;
  if (totOneEl) totOneEl.textContent = `$${grandOneTime.toLocaleString()}`;
  if (totMonEl) totMonEl.textContent = `$${grandMonthly.toLocaleString()}/mo`;
  if (monSubEl) monSubEl.textContent = count > 0 ? `Core ($650) + Add-Ons (+$${addonMonthlyTotal}/mo)` : `Core SLA ($650/mo)`;
}

// ==========================================================================
// KICKOFF MODAL & PROPOSAL ACTIONS
// ==========================================================================

function openKickoffModal() {
  const modal = document.getElementById('kickoffModalBackdrop');
  modal.classList.add('active');

  // Update kickoff modal summary based on selected add-ons
  let addonOneTime = 0;
  for (const key in state.selectedAddons) {
    addonOneTime += state.selectedAddons[key].oneTime;
  }
  const totalOneTime = 5700 + addonOneTime;

  const summaryLines = document.querySelector('.kickoff-summary-box');
  if (summaryLines) {
    summaryLines.innerHTML = `
      <div class="summary-line">
        <span>Project:</span>
        <strong>Custom AI Mortgage Lead Platform</strong>
      </div>
      <div class="summary-line">
        <span>Total Investment:</span>
        <strong class="text-emerald">$${totalOneTime.toLocaleString()} (${addonOneTime > 0 ? 'Core + ' + Object.keys(state.selectedAddons).length + ' Add-Ons' : 'Core 3 Milestones'})</strong>
      </div>
      <div class="summary-line">
        <span>Milestone 1 Initiation:</span>
        <strong>$2,280 (40% Core Sprint)</strong>
      </div>
      <div class="summary-line">
        <span>Target Delivery:</span>
        <strong>4–6 Weeks</strong>
      </div>
    `;
  }

  // Set default date to next Monday
  const dateInput = document.getElementById('kickoffDate');
  if (dateInput && !dateInput.value) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    dateInput.value = nextWeek.toISOString().slice(0, 10);
  }
}

function closeKickoffModal() {
  document.getElementById('kickoffModalBackdrop').classList.remove('active');
}

function handleScheduleKickoff(e) {
  e.preventDefault();
  const name = document.getElementById('signerName').value;
  const email = document.getElementById('signerEmail').value;
  const date = document.getElementById('kickoffDate').value;
  const provider = document.getElementById('smsProviderPref').value;

  closeKickoffModal();
  showToast(`🎉 Kickoff confirmed for ${date}! Neo Gen Technologies is initializing Green Lending onboarding.`, 'success');
}

// ==========================================================================
// UTILITY HELPERS
// ==========================================================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') toast.style.borderLeftColor = 'var(--green-light)';
  if (type === 'warning') toast.style.borderLeftColor = '#f59e0b';
  if (type === 'error') toast.style.borderLeftColor = '#ef4444';

  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'warning' ? '⚡' : 'ℹ️'}</span>
    <div>${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

