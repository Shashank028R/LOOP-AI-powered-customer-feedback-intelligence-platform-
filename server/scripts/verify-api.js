// Native global fetch will be used (supported in Node.js 18+)

const BASE_URL = 'http://localhost:5050/api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runVerification = async () => {
  console.log('=== STARTING LOOP API VERIFICATION ===\n');

  let adminToken = '';
  let analystToken = '';
  let viewerToken = '';
  
  let createdFeedbackId = '';

  try {
    // ----------------------------------------------------
    // TEST 1: Auth Login & Session Persistence (C1)
    // ----------------------------------------------------
    console.log('Test 1: Authenticating role credentials...');
    
    // Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shashank@projectloop.io', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok || !adminLoginData.success) {
      throw new Error(`Admin login failed: ${adminLoginData.message}`);
    }
    adminToken = adminLoginData.token;
    console.log('✅ Admin credentials verified.');

    // Analyst Login
    const analystLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sujal@projectloop.io', password: 'password123' })
    });
    const analystLoginData = await analystLoginRes.json();
    if (!analystLoginRes.ok || !analystLoginData.success) {
      throw new Error(`Analyst login failed: ${analystLoginData.message}`);
    }
    analystToken = analystLoginData.token;
    console.log('✅ Analyst credentials verified.');

    // Viewer Login
    const viewerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@projectloop.io', password: 'password123' })
    });
    const viewerLoginData = await viewerLoginRes.json();
    if (!viewerLoginRes.ok || !viewerLoginData.success) {
      throw new Error(`Viewer login failed: ${viewerLoginData.message}`);
    }
    viewerToken = viewerLoginData.token;
    console.log('✅ Viewer credentials verified.\n');


    // ----------------------------------------------------
    // TEST 2: RBAC Security Guarding (C2)
    // ----------------------------------------------------
    console.log('Test 2: Verifying role permissions (RBAC)...');

    // 2a. Viewer tries to write feedback -> Expect 403
    const viewerWriteRes = await fetch(`${BASE_URL}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${viewerToken}`
      },
      body: JSON.stringify({ title: 'Hack', description: 'Attempting forbidden post' })
    });
    if (viewerWriteRes.status === 403) {
      console.log('✅ RBAC: Viewer denied feedback write permissions (403 Forbidden).');
    } else {
      throw new Error(`RBAC FAILED: Viewer write returned status ${viewerWriteRes.status}`);
    }

    // 2b. Analyst tries to view members list -> Expect 403
    const analystMembersRes = await fetch(`${BASE_URL}/workspace/members`, {
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });
    if (analystMembersRes.status === 403) {
      console.log('✅ RBAC: Analyst denied workspace member settings (403 Forbidden).');
    } else {
      throw new Error(`RBAC FAILED: Analyst member fetch returned status ${analystMembersRes.status}`);
    }

    // 2c. Admin fetches workspace members -> Expect 200
    const adminMembersRes = await fetch(`${BASE_URL}/workspace/members`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminMembersData = await adminMembersRes.json();
    if (adminMembersRes.ok && adminMembersData.success) {
      console.log(`✅ RBAC: Admin authorized to manage members. Current count: ${adminMembersData.members.length}`);
    } else {
      throw new Error(`RBAC FAILED: Admin members query returned ${adminMembersRes.status}`);
    }
    console.log('');


    // ----------------------------------------------------
    // TEST 3: Feedback Ingestion & AI Classification (C3, AI1, AI2)
    // ----------------------------------------------------
    console.log('Test 3: Feedback Ingestion, AI Classification, & Embeddings...');

    const newFeedbackText = 'The teammate onboarding invitation link is extremely slow and times out.';
    const createFeedbackRes = await fetch(`${BASE_URL}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({
        title: 'Slow onboarding invites',
        description: newFeedbackText,
        channel: 'Support ticket',
        customerLabel: 'Enterprise'
      })
    });
    const createFeedbackData = await createFeedbackRes.json();
    if (createFeedbackRes.ok && createFeedbackData.success) {
      createdFeedbackId = createFeedbackData.feedback.id;
      console.log(`✅ Single Feedback Ingested. ID: ${createdFeedbackId}`);
      console.log(`✅ AI Classification Sentiment: ${createFeedbackData.aiAnalysis.sentiment} (Score: ${createFeedbackData.aiAnalysis.sentimentScore})`);
      console.log(`✅ AI Theme mapping count: ${createFeedbackData.aiAnalysis.themes.length}`);
      console.log(`✅ AI Summary Rationale: "${createFeedbackData.aiAnalysis.summary}"`);
    } else {
      throw new Error(`Ingest failed: ${createFeedbackData.message}`);
    }
    console.log('');


    // ----------------------------------------------------
    // TEST 4: Triage inline status modifications (C4)
    // ----------------------------------------------------
    console.log('Test 4: Triaging feedback status inline...');
    
    const triageRes = await fetch(`${BASE_URL}/feedbacks/${createdFeedbackId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({ status: 'REVIEWED' })
    });
    const triageData = await triageRes.json();
    if (triageRes.ok && triageData.success) {
      console.log(`✅ Feedback triaged successfully. New status: ${triageData.feedback.status}`);
    } else {
      throw new Error(`Triage failed: ${triageData.message}`);
    }
    console.log('');


    // ----------------------------------------------------
    // TEST 5: Ask LOOP Grounded Q&A (RAG / AI3)
    // ----------------------------------------------------
    console.log('Test 5: Executing Ask LOOP semantic RAG pipeline...');
    
    const qRes = await fetch(`${BASE_URL}/insights/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${viewerToken}`
      },
      body: JSON.stringify({ question: 'What issues are users having with onboarding?' })
    });
    const qData = await qRes.json();
    if (qRes.ok && qData.success) {
      console.log('✅ RAG Response Answer loaded successfully.');
      console.log(`✅ Grounded Citations referenced: ${qData.citations.length} records.`);
      console.log(`--- AI Answer Snippet ---\n${qData.answer.slice(0, 300)}...\n-------------------------`);
    } else {
      throw new Error(`RAG Query failed: ${qData.message}`);
    }
    console.log('');


    // ----------------------------------------------------
    // TEST 6: Voice-of-Customer Reports (AI4)
    // ----------------------------------------------------
    console.log('Test 6: Generating Voice-of-Customer PDF Executive Brief...');
    
    const repRes = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analystToken}`
      },
      body: JSON.stringify({
        title: 'Weekly Performance and Setup Summary',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      })
    });
    const repData = await repRes.json();
    if (repRes.ok && repData.success) {
      console.log(`✅ Executive Report generated. Title: "${repData.report.title}"`);
      console.log(`✅ Summary total analyzed logs: ${repData.report.contentJson.totalCount}`);
      console.log(`✅ Narrative markdown character length: ${repData.report.narrative.length}`);
    } else {
      throw new Error(`Report generation failed: ${repData.message}`);
    }
    console.log('');


    console.log('=== ALL LOOP API TESTS PASSED SUCCESSFULLY! ===');
  } catch (error) {
    console.error('❌ TEST RUN FAILED:', error.message);
    process.exit(1);
  }
};

runVerification();
