const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Initial in-memory demo data
let leadsData = [
  {
    id: 'lead-101',
    name: 'Marcus Vance',
    phone: '+1 (512) 843-2291',
    email: 'marcus.v@gmail.com',
    category: 'HELOC',
    status: 'Qualified',
    score: 'Hot',
    scoreValue: 94,
    propertyValue: '$680,000',
    existingBalance: '$310,000',
    availableEquity: '$370,000',
    desiredAmount: '$95,000',
    purpose: 'Home Renovation & Debt Consolidation',
    timeline: 'Within 30 Days',
    assignedLO: 'Sarah Jenkins (Senior LO)',
    isAgentTakeover: false,
    lastActivity: '2 mins ago',
    optedOut: false,
    conversation: [
      { sender: 'system', text: 'Campaign Triggered: HELOC Equity Unlock 2026', time: '10:14 AM' },
      { sender: 'ai', text: 'Hi Marcus! This is Alex from Green Lending. Noticed you recently checked home equity rates in Austin. Were you looking to tap your equity for home upgrades or consolidating some debts?', time: '10:15 AM' },
      { sender: 'lead', text: 'Hey Alex, yes we want to remodel the master bath and kitchen. Curious what kind of line we could get without touching our 3.1% first mortgage.', time: '10:18 AM' },
      { sender: 'ai', text: 'Great goal Marcus! A standalone HELOC is perfect because it leaves your 3.1% first mortgage completely untouched. What is your estimated home value and roughly what do you owe today?', time: '10:18 AM' },
      { sender: 'lead', text: 'Homes on our street sell for $680k, and we owe about $310k. Looking to borrow around $95,000.', time: '10:20 AM' },
      { sender: 'ai', text: 'You have fantastic equity (~$370k total, well below 80% CLTV)! I have our senior equity specialist Sarah Jenkins ready to show you rate options with zero prepayment penalties. Can Sarah give you a 5-minute call today at 2:30 PM or 4:00 PM?', time: '10:21 AM' },
      { sender: 'lead', text: '4:00 PM works perfect. My wife will be home then too.', time: '10:22 AM' }
    ],
    notes: [
      { author: 'AI Engine', text: 'High intent: CLTV ~60%, strong equity, immediate timeline.', date: '10:21 AM' },
      { author: 'Sarah Jenkins', text: 'Pre-meeting file prepared. Soft pull consent to be confirmed on call.', date: '10:25 AM' }
    ]
  },
  {
    id: 'lead-102',
    name: 'Elena Rostova',
    phone: '+1 (602) 419-7730',
    email: 'elena.rostova@outlook.com',
    category: 'Refinance',
    status: 'AI Engaging',
    score: 'Warm',
    scoreValue: 78,
    propertyValue: '$520,000',
    existingBalance: '$410,000',
    currentRate: '7.125%',
    desiredObjective: 'Rate & Term Reduction',
    monthlyPayment: '$2,760/mo',
    timeline: '1-3 Months',
    assignedLO: 'David Miller',
    isAgentTakeover: false,
    lastActivity: '14 mins ago',
    optedOut: false,
    conversation: [
      { sender: 'system', text: 'Campaign Triggered: Q4 Refi Rate-Drop Alert', time: '09:40 AM' },
      { sender: 'ai', text: 'Hello Elena! Alex with Green Lending. Mortgage rates had a noticeable dip this week. Are you still interested in lowering your monthly payment on your Phoenix home?', time: '09:41 AM' },
      { sender: 'lead', text: 'Hi Alex. Yeah my rate is 7.125% from last year and my payment is killing me. What are rates looking like now?', time: '09:55 AM' },
      { sender: 'ai', text: '7.125% definitely has room for improvement today! Depending on credit and equity, many clients are saving $350-$500/month. What is your approximate mortgage balance currently?', time: '09:56 AM' },
      { sender: 'lead', text: 'About $410k left on the balance. Credit score is around 740.', time: '10:05 AM' }
    ],
    notes: [
      { author: 'AI Engine', text: 'Qualifies for conventional rate-and-term refi. Follow up on property appraisal estimate.', date: '10:06 AM' }
    ]
  },
  {
    id: 'lead-103',
    name: 'Derek & Chloe Campbell',
    phone: '+1 (919) 321-9044',
    email: 'derek.c@icloud.com',
    category: 'Purchase',
    status: 'Agent Takeover',
    score: 'Hot',
    scoreValue: 96,
    propertyValue: '$480,000',
    downPayment: '10% ($48,000)',
    location: 'Raleigh-Durham, NC',
    preapprovalStatus: 'Needs Pre-Approval',
    timeline: 'Ready to buy this month',
    assignedLO: 'Sarah Jenkins (Senior LO)',
    isAgentTakeover: true,
    lastActivity: '4 mins ago',
    optedOut: false,
    conversation: [
      { sender: 'system', text: 'Campaign Triggered: First-Time Buyer Launchpad', time: '08:30 AM' },
      { sender: 'ai', text: 'Hi Derek! Alex from Green Lending. Congratulations on beginning your home search in North Carolina! Do you already have a verified pre-approval letter for touring homes?', time: '08:31 AM' },
      { sender: 'lead', text: 'Not yet! We found a townhouse in Cary listed at $475k that we want to put an offer on by Sunday.', time: '08:45 AM' },
      { sender: 'ai', text: 'Exciting news! In Cary homes move quickly, so a rapid pre-approval letter is essential for your offer. How much do you have set aside for your down payment?', time: '08:46 AM' },
      { sender: 'lead', text: 'We have $50k liquid ready to go. Can someone issue a letter today?', time: '08:48 AM' },
      { sender: 'system', text: '⚡ High Intent Detected: Rapid Pre-Approval Required. Human Takeover initiated.', time: '08:48 AM' },
      { sender: 'agent', text: 'Hi Derek, Sarah Jenkins here, Senior LO with Green Lending taking over. I can fast-track your pre-approval in 2 hours. Just sent a secure link to your email to verify docs. Let us get this done for Sunday!', time: '08:50 AM' }
    ],
    notes: [
      { author: 'AI Engine', text: 'Target property identified. Offer deadline this weekend.', date: '08:48 AM' },
      { author: 'Sarah Jenkins', text: 'Spoke on phone at 8:52 AM. Paystubs and W2s uploaded. 10/10 urgency.', date: '09:00 AM' }
    ]
  },
  {
    id: 'lead-104',
    name: 'Travis Sterling',
    phone: '+1 (720) 650-1129',
    email: 'tsterling@gmail.com',
    category: 'HELOC',
    status: 'Cold / Follow-up',
    score: 'Cold',
    scoreValue: 32,
    propertyValue: '$750,000',
    existingBalance: 'Unknown',
    timeline: '6+ Months',
    assignedLO: 'Alex Chen',
    isAgentTakeover: false,
    lastActivity: 'Yesterday',
    optedOut: false,
    conversation: [
      { sender: 'system', text: 'Campaign Triggered: HELOC Equity Unlock 2026', time: 'Yesterday' },
      { sender: 'ai', text: 'Hi Travis! Alex from Green Lending. Are you still thinking about tapping into your Denver property equity this spring?', time: 'Yesterday' },
      { sender: 'lead', text: 'Not right now, maybe in autumn when rates settle.', time: 'Yesterday' },
      { sender: 'ai', text: 'Totally understand Travis! We can keep an eye on Denver equity trends and check back in a few months. No pressure at all.', time: 'Yesterday' }
    ],
    notes: [
      { author: 'AI Engine', text: 'Scheduled for 60-day low-touch nurture sequence.', date: 'Yesterday' }
    ]
  }
];

// Helper to parse JSON body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// AI response engine for live simulator
function generateAiMortgageResponse(category, userMessage, conversationHistory = []) {
  const msg = userMessage.toLowerCase().trim();

  // Check STOP / TCPA opt out
  if (['stop', 'unsubscribe', 'cancel', 'quit', 'opt out', 'remove'].includes(msg)) {
    return {
      reply: 'Green Lending: You have successfully been unsubscribed. No further SMS messages will be sent. Reply START to resubscribe. Questions? Call 1-800-GREEN-LOAN.',
      intent: 'Opt-Out (TCPA Compliant)',
      score: 'Cold',
      scoreValue: 0,
      optOut: true,
      takeover: false,
      qualificationData: {}
    };
  }

  // Check Human Agent Request
  if (msg.includes('talk to someone') || msg.includes('speak to a person') || msg.includes('human') || msg.includes('loan officer') || msg.includes('agent') || msg.includes('call me')) {
    return {
      reply: 'Absolutely! I am connecting you directly with one of our licensed Senior Mortgage Advisors at Green Lending right now. They are reviewing your message history and will jump into this thread momentarily.',
      intent: 'Human Loan Officer Request',
      score: 'Hot',
      scoreValue: 98,
      takeover: true,
      qualificationData: { humanRequested: true }
    };
  }

  // Category specific logic
  if (category === 'HELOC') {
    if (msg.includes('remodel') || msg.includes('renovation') || msg.includes('debt') || msg.includes('invest') || msg.includes('upgrade') || msg.includes('roof') || msg.includes('cash')) {
      return {
        reply: 'That makes total sense! Using a HELOC for improvements can also offer tax advantages while keeping your primary mortgage interest rate intact. Roughly what do you estimate your home is worth today, and how much is left on your current mortgage?',
        intent: 'Stated Purpose of Funds',
        score: 'Warm',
        scoreValue: 75,
        qualificationData: { purpose: userMessage }
      };
    }
    if (msg.includes('worth') || msg.includes('owe') || msg.includes('$') || msg.includes('k') || msg.includes('equity') || /\d+/.test(msg)) {
      return {
        reply: 'Thank you for sharing those figures! With those numbers, you likely have strong borrowing capacity with a prime HELOC line up to 80-85% combined loan-to-value. What timeframe are you aiming for to access the funds (e.g. this month, 60 days, or just exploring)?',
        intent: 'Property & Balance Provided',
        score: 'Hot',
        scoreValue: 92,
        qualificationData: { financialDetail: userMessage }
      };
    }
    if (msg.includes('month') || msg.includes('asap') || msg.includes('now') || msg.includes('week') || msg.includes('ready')) {
      return {
        reply: 'Got it! Since you are on a timely schedule, our Senior Equity Officer can run an instant, no-obligation equity valuation and lock your rate structure. Would this afternoon around 2:30 PM or 4:00 PM work for a quick 5-minute phone review?',
        intent: 'High Intent Timeline',
        score: 'Hot',
        scoreValue: 96,
        takeover: true,
        qualificationData: { timeline: userMessage }
      };
    }
    return {
      reply: 'Thanks for reaching out! At Green Lending, our HELOC program lets you tap into your home equity with flexible draw periods and zero penalty on your existing low first mortgage. Are you looking into this for home improvements, debt consolidation, or an upcoming investment?',
      intent: 'General Inquiry',
      score: 'Warm',
      scoreValue: 65,
      qualificationData: {}
    };
  }

  if (category === 'Refinance') {
    if (msg.includes('rate') || msg.includes('lower') || msg.includes('payment') || msg.includes('save') || msg.includes('term')) {
      return {
        reply: 'Lowering that monthly payment is our top priority! Rates fluctuate daily, and recent market adjustments offer great opportunities. What is your current interest rate and approximately what is your remaining loan balance?',
        intent: 'Refinance Goal Identified',
        score: 'Warm',
        scoreValue: 74,
        qualificationData: { objective: 'Rate and payment reduction' }
      };
    }
    if (msg.includes('%') || msg.includes('$') || /\d+/.test(msg)) {
      return {
        reply: 'That gives us a clear picture. Every 0.75% to 1% drop can save between $280 and $450/month on average balances. Roughly what credit bracket are you in (e.g. 740+, 680-739, or under 680)?',
        intent: 'Balance / Rate Shared',
        score: 'Hot',
        scoreValue: 88,
        qualificationData: { rateBalanceInfo: userMessage }
      };
    }
    if (msg.includes('700') || msg.includes('720') || msg.includes('740') || msg.includes('750') || msg.includes('780') || msg.includes('800') || msg.includes('good') || msg.includes('excellent')) {
      return {
        reply: 'Excellent credit standing! That qualifies you for our premier Tier-1 pricing tiers. Let us run an official amortization comparison so you can see exact dollar savings. Can we schedule a brief 5-minute review with David Miller today?',
        intent: 'Credit Profile Qualified',
        score: 'Hot',
        scoreValue: 95,
        takeover: true,
        qualificationData: { creditTier: userMessage }
      };
    }
    return {
      reply: 'Hello! Green Lending specializes in custom rate-and-term as well as cash-out refinancing. Are you looking to reduce your monthly payment, shorten your mortgage term, or take cash out?',
      intent: 'Refinance Intro',
      score: 'Warm',
      scoreValue: 60,
      qualificationData: {}
    };
  }

  // Purchase
  if (msg.includes('preapproval') || msg.includes('pre-approval') || msg.includes('offer') || msg.includes('letter') || msg.includes('tour')) {
    return {
      reply: 'A solid pre-approval letter is what makes your offer stand out to sellers and listing agents! What price range or purchase budget are you looking at, and in which city or neighborhood?',
      intent: 'Pre-Approval Request',
      score: 'Hot',
      scoreValue: 91,
      qualificationData: { stage: 'Pre-approval needed' }
    };
  }
  if (msg.includes('$') || msg.includes('k') || msg.includes('budget') || /\d+/.test(msg)) {
    return {
      reply: 'Great target price point! We have customized loan products from conventional 3% down programs to FHA and Jumbo options. Roughly how much down payment do you plan to put down?',
      intent: 'Budget Stated',
      score: 'Hot',
      scoreValue: 89,
      qualificationData: { targetBudget: userMessage }
    };
  }
  if (msg.includes('down') || msg.includes('%') || msg.includes('cash') || msg.includes('savings')) {
    return {
      reply: 'That puts you in a solid qualifying position! Are you currently under contract or actively viewing homes this week with a real estate agent?',
      intent: 'Down Payment Stated',
      score: 'Hot',
      scoreValue: 94,
      takeover: true,
      qualificationData: { downPayment: userMessage }
    };
  }

  return {
    reply: 'Thank you for reaching out to Green Lending! Whether you are exploring a HELOC to access home equity, refinancing to lower your payment, or purchasing a new home, our AI platform and loan officers are here to assist. What type of mortgage financing are you exploring today?',
    intent: 'General Greeting',
    score: 'Warm',
    scoreValue: 65,
    qualificationData: {}
  };
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTES ---

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString(), platform: 'Neo Gen AI Mortgage Engine' }));
    return;
  }

  // Get leads
  if (pathname === '/api/leads' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: leadsData.length, leads: leadsData }));
    return;
  }

  // Create new lead
  if (pathname === '/api/leads' && method === 'POST') {
    const body = await getRequestBody(req);
    const newLead = {
      id: 'lead-' + (100 + leadsData.length + 1),
      name: body.name || 'New Prospect',
      phone: body.phone || '+1 (555) 000-0000',
      email: body.email || 'prospect@example.com',
      category: body.category || 'HELOC',
      status: 'New',
      score: 'Warm',
      scoreValue: 65,
      propertyValue: body.propertyValue || '$550,000',
      existingBalance: body.existingBalance || '$320,000',
      timeline: body.timeline || 'Within 60 Days',
      assignedLO: body.assignedLO || 'Sarah Jenkins (Senior LO)',
      isAgentTakeover: false,
      lastActivity: 'Just now',
      optedOut: false,
      conversation: [
        { sender: 'system', text: `Lead imported from ${body.source || 'Website Form'} into Green Lending CRM`, time: 'Just now' },
        { sender: 'ai', text: `Hi ${body.name || 'there'}! Alex here with Green Lending. I received your request regarding ${body.category || 'mortgage financing'}. How can we best assist with your home financing goals today?`, time: 'Just now' }
      ],
      notes: [
        { author: 'System', text: 'New inbound lead created via API/Form.', date: 'Just now' }
      ]
    };
    leadsData.unshift(newLead);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, lead: newLead }));
    return;
  }

  // Lead detail
  if (pathname.startsWith('/api/leads/') && method === 'GET') {
    const leadId = pathname.split('/')[3];
    const lead = leadsData.find(l => l.id === leadId);
    if (!lead) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Lead not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, lead }));
    return;
  }

  // Toggle Human Agent Takeover
  if (pathname.startsWith('/api/leads/') && pathname.endsWith('/takeover') && method === 'POST') {
    const leadId = pathname.split('/')[3];
    const lead = leadsData.find(l => l.id === leadId);
    if (!lead) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Lead not found' }));
      return;
    }
    lead.isAgentTakeover = !lead.isAgentTakeover;
    lead.status = lead.isAgentTakeover ? 'Agent Takeover' : 'AI Engaging';
    lead.conversation.push({
      sender: 'system',
      text: lead.isAgentTakeover ? '⚡ Loan Officer initiated Human Agent Takeover. AI messaging paused.' : '🤖 Human Takeover disabled. AI Autonomous messaging resumed.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, isAgentTakeover: lead.isAgentTakeover, status: lead.status }));
    return;
  }

  // Add internal note
  if (pathname.startsWith('/api/leads/') && pathname.endsWith('/notes') && method === 'POST') {
    const leadId = pathname.split('/')[3];
    const body = await getRequestBody(req);
    const lead = leadsData.find(l => l.id === leadId);
    if (!lead) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Lead not found' }));
      return;
    }
    const newNote = {
      author: body.author || 'Loan Officer',
      text: body.text || '',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    lead.notes.push(newNote);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, note: newNote, notes: lead.notes }));
    return;
  }

  // Send Manual Agent Message
  if (pathname.startsWith('/api/leads/') && pathname.endsWith('/send-sms') && method === 'POST') {
    const leadId = pathname.split('/')[3];
    const body = await getRequestBody(req);
    const lead = leadsData.find(l => l.id === leadId);
    if (!lead) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Lead not found' }));
      return;
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const agentMsg = {
      sender: 'agent',
      text: body.message || '',
      time: timeStr
    };
    lead.conversation.push(agentMsg);
    lead.lastActivity = 'Just now';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: agentMsg }));
    return;
  }

  // Simulate Inbound SMS & AI Response (Real-time testing engine)
  if (pathname === '/api/sms/simulate' && method === 'POST') {
    const body = await getRequestBody(req);
    const category = body.category || 'HELOC';
    const userMessage = body.message || 'Hello';
    const leadId = body.leadId;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let lead = leadsData.find(l => l.id === leadId);
    if (lead) {
      lead.conversation.push({ sender: 'lead', text: userMessage, time: timeStr });
      lead.lastActivity = 'Just now';
    }

    // Generate AI response
    const aiResult = generateAiMortgageResponse(category, userMessage);

    if (lead) {
      if (aiResult.optOut) {
        lead.optedOut = true;
        lead.status = 'Opted Out';
        lead.score = 'Cold';
        lead.scoreValue = 0;
      } else if (aiResult.takeover) {
        lead.isAgentTakeover = true;
        lead.status = 'Agent Takeover';
      }
      if (aiResult.scoreValue > lead.scoreValue) {
        lead.scoreValue = aiResult.scoreValue;
        lead.score = aiResult.score;
      }
      lead.conversation.push({ sender: 'ai', text: aiResult.reply, time: timeStr });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      userMessage,
      aiResponse: aiResult.reply,
      intentDetected: aiResult.intent,
      score: aiResult.score,
      scoreValue: aiResult.scoreValue,
      takeover: aiResult.takeover || false,
      optOut: aiResult.optOut || false,
      timestamp: timeStr
    }));
    return;
  }

  // Campaigns API
  if (pathname === '/api/campaigns' && method === 'GET') {
    const campaigns = [
      {
        id: 'camp-01',
        name: 'HELOC Equity Unlock 2026',
        category: 'HELOC',
        status: 'Active',
        totalLeads: 1240,
        contacted: 1180,
        responseRate: '43.2%',
        hotLeads: 218,
        optOutRate: '0.8%',
        sequenceSteps: [
          { day: 'Day 0', trigger: 'Lead created', action: 'Personalized Intro SMS with home valuation mention' },
          { day: 'Day 1', trigger: 'No reply after 24h', action: 'Value highlight: Tap equity with 0% penalty on 1st mortgage' },
          { day: 'Day 3', trigger: 'No reply after 72h', action: 'Case study: Local homeowner tapped $120k for home ADU' },
          { day: 'Day 5', trigger: 'No reply', action: 'Soft consultation offer: 5-minute equity calculation check' },
          { day: 'Day 7', trigger: 'Final attempt', action: 'Final check-in before switching to 60-day quiet nurture' }
        ]
      },
      {
        id: 'camp-02',
        name: 'Q4 Refinance Rate-Drop Alert',
        category: 'Refinance',
        status: 'Active',
        totalLeads: 890,
        contacted: 845,
        responseRate: '39.7%',
        hotLeads: 142,
        optOutRate: '1.1%',
        sequenceSteps: [
          { day: 'Day 0', trigger: 'Lead created', action: 'Rate drop notification + current payment comparison' },
          { day: 'Day 2', trigger: 'No reply', action: 'Monthly savings calculator example ($350-500/mo savings)' },
          { day: 'Day 4', trigger: 'No reply', action: 'Credit tier check for prime rate eligibility' },
          { day: 'Day 7', trigger: 'Final sequence', action: 'Senior Loan Officer calendar booking link' }
        ]
      },
      {
        id: 'camp-03',
        name: 'First-Time Homebuyer Launchpad',
        category: 'Purchase',
        status: 'Active',
        totalLeads: 620,
        contacted: 605,
        responseRate: '46.5%',
        hotLeads: 165,
        optOutRate: '0.5%',
        sequenceSteps: [
          { day: 'Day 0', trigger: 'Lead created', action: 'Rapid pre-approval readiness check + tour support' },
          { day: 'Day 1', trigger: 'No reply', action: 'Down payment assistance programs & 3% down options' },
          { day: 'Day 3', trigger: 'No reply', action: 'Offer readiness: Why pre-approval beats pre-qualification' },
          { day: 'Day 6', trigger: 'Final sequence', action: 'Connect with local verified real estate partner' }
        ]
      }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, campaigns }));
    return;
  }

  // Analytics API
  if (pathname === '/api/analytics' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      metrics: {
        totalLeads: 2750,
        leadsContacted: 2630,
        contactRate: '95.6%',
        messagesSent: 9480,
        messagesDelivered: '99.2%',
        incomingReplies: 4095,
        responseRate: '43.1%',
        hotLeads: 525,
        warmLeads: 1140,
        coldLeads: 965,
        humanHandoffs: 382,
        optOutRate: '0.8%',
        avgAiResponseTime: '1.4 seconds',
        estPipelineValue: '$48.5M'
      }
    }));
    return;
  }

  // Proposal details API
  if (pathname === '/api/proposal' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      preparedFor: 'Green Lending (https://greenlending.com)',
      preparedBy: 'Neo Gen Technologies (https://neogentechnologies.com)',
      coreInvestment: '$5,700',
      monthlyMaintenance: '$650/month',
      timeline: '4–6 weeks',
      milestones: [
        { milestone: 'Milestone 1: Project Initiation & Architecture', percent: '40%', amount: '$2,280' },
        { milestone: 'Milestone 2: Core Platform & AI Workflows', percent: '30%', amount: '$1,710' },
        { milestone: 'Milestone 3: Final Testing & Deployment', percent: '30%', amount: '$1,710' }
      ],
      addOns: [
        { id: 'voice', name: 'AI Voice Calling Agent', oneTime: 2400, monthly: 250 },
        { id: 'reactivation', name: 'AI Aged Lead Reactivation Engine', oneTime: 1200, monthly: 150 },
        { id: 'los', name: 'Direct LOS Integration (Encompass / LendingPad)', oneTime: 1800, monthly: 150 },
        { id: 'bilingual', name: 'Bilingual AI Engine (English + Spanish)', oneTime: 950, monthly: 100 },
        { id: 'mobile', name: 'Loan Officer Mobile PWA (iOS & Android)', oneTime: 1600, monthly: 150 },
        { id: 'omnichannel', name: 'Omnichannel Web Widget & WhatsApp AI', oneTime: 1100, monthly: 120 }
      ],
      scalabilityOptions: [
        { name: 'Multi-Branch Mortgage Architecture', price: '$2,800', monthly: '+$300/mo' },
        { name: 'Commercial Multi-Company SaaS Reseller Platform', price: '$4,500', monthly: '+$450/mo' },
        { name: 'Dedicated High-Throughput Carrier Short Code (100+ CPS)', price: '$1,500 Setup', monthly: 'Pass-through' }
      ]
    }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(__dirname, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to root or public index.html for SPA feel
      const rootIndex = path.join(__dirname, 'index.html');
      const publicIndex = path.join(PUBLIC_DIR, 'index.html');
      const targetIndex = fs.existsSync(rootIndex) ? rootIndex : publicIndex;

      fs.readFile(targetIndex, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Neo Gen Technologies x Green Lending Platform Ready!`);
    console.log(`🌐 Server running at: http://localhost:${portToTry}`);
    console.log(`✨ AI Mortgage Lead Engagement & Texting Platform`);
    console.log(`=======================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is in use, trying port ${PORT + 1}...`);
    PORT += 1;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);
