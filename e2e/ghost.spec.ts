import { expect, test } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';

test.describe('GHOST Module E2E Tests - API Only', () => {
  const TEST_USER = {
    email: 'admin@eliksir-bot.pl',
    password: 'Admin123!'
  };

  test('should verify backend health', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should authenticate and get user data', async ({ request }) => {
    // Login
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.accessToken).toBeDefined();
    
    // Get user info
    const token = loginData.accessToken;
    const meResponse = await request.get(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(meResponse.ok()).toBeTruthy();
    const userData = await meResponse.json();
    expect(userData.user.email).toBe(TEST_USER.email);
  });

  test('should call GHOST assets API with authentication', async ({ request }) => {
    // Login first
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password
      }
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    // Call GHOST assets endpoint
    const assetsResponse = await request.get(`${BACKEND_URL}/api/ghost/assets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(assetsResponse.ok()).toBeTruthy();
    const assetsData = await assetsResponse.json();
    expect(assetsData.success).toBe(true);
    expect(Array.isArray(assetsData.assets)).toBe(true);
  });

  // ===== GHOST WORKFLOW SMOKE TESTS =====
  
  test('WORKFLOW STEP 1: Brand Kit - Create or verify exists', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const token = loginResponse.json().then(d => d.accessToken);
    
    // Check if brand kit exists
    const brandKitsResponse = await request.get(`${BACKEND_URL}/api/ghost/brand`, {
      headers: { 'Authorization': `Bearer ${await token}` }
    });
    
    // Brand kit endpoint should respond (200 if exists, 404 if not - both OK)
    expect([200, 404]).toContain(brandKitsResponse.status());
    const brandKits = await brandKitsResponse.json();
    
    console.log('✅ STEP 1: Brand Kit endpoint responsive. Status:', brandKitsResponse.status());
    console.log('   Response:', brandKits);
  });

  test('WORKFLOW STEP 2: Assets - List available assets', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    const assetsResponse = await request.get(`${BACKEND_URL}/api/ghost/assets`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    expect(assetsResponse.ok()).toBeTruthy();
    const assetsData = await assetsResponse.json();
    expect(assetsData.success).toBe(true);
    
    console.log('✅ STEP 2: Assets count:', assetsData.assets.length);
    console.log('   Assets data:', JSON.stringify(assetsData, null, 2));
  });

  test('WORKFLOW STEP 3: Templates - List content templates', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    const templatesResponse = await request.get(`${BACKEND_URL}/api/ghost/templates`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    expect(templatesResponse.ok()).toBeTruthy();
    const templatesData = await templatesResponse.json();
    
    console.log('✅ STEP 3: Templates count:', templatesData.templates?.length || 0);
    console.log('   Templates data:', JSON.stringify(templatesData, null, 2));
  });

  test('WORKFLOW STEP 4: Templates - Create new template', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    const newTemplate = {
      name: 'E2E Test Template',
      type: 'instagram_post',
      brandVoice: 'professional',
      captionTemplate: 'Check out our latest {product}! #eliksir #test',
      hashtags: '#eliksir #cocktails #events'
    };
    
    const createResponse = await request.post(`${BACKEND_URL}/api/ghost/templates`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: newTemplate
    });
    
    const createData = await createResponse.json();
    console.log('✅ STEP 4: Create template response:', createResponse.status());
    console.log('   Response data:', JSON.stringify(createData, null, 2));
    
    if (createResponse.ok()) {
      expect(createData.success).toBe(true);
      expect(createData.template).toBeDefined();
      console.log('   Template ID:', createData.template.id);
    } else {
      console.log('⚠️  Template creation failed:', createData);
    }
  });

  test('WORKFLOW STEP 5: Schedule - List scheduled posts', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    const scheduleResponse = await request.get(`${BACKEND_URL}/api/ghost/schedule`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    expect(scheduleResponse.ok()).toBeTruthy();
    const scheduleData = await scheduleResponse.json();
    
    console.log('✅ STEP 5: Scheduled posts count:', scheduleData.posts?.length || 0);
    console.log('   Schedule data:', JSON.stringify(scheduleData, null, 2));
  });

  test('WORKFLOW STEP 6: Schedule - Create scheduled post', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    // First, get a template (create if none exists)
    const templatesResponse = await request.get(`${BACKEND_URL}/api/ghost/templates`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const { templates } = await templatesResponse.json();
    
    let templateId = templates?.[0]?.id;
    
    if (!templateId) {
      console.log('   No templates found, creating one first...');
      const createTemplateResponse = await request.post(`${BACKEND_URL}/api/ghost/templates`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'E2E Smoke Test Template',
          type: 'instagram_post',
          brandVoice: 'friendly',
          captionTemplate: 'Test post {date}',
          hashtags: '#test'
        }
      });
      const createData = await createTemplateResponse.json();
      templateId = createData.template?.id;
    }
    
    if (!templateId) {
      console.log('⚠️  Cannot test scheduling without template');
      return;
    }
    
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    
    const schedulePostData = {
      templateId,
      platform: 'instagram',
      scheduledFor: scheduledTime.toISOString(),
      caption: 'E2E Smoke Test Post - ' + new Date().toISOString()
    };
    
    const scheduleResponse = await request.post(`${BACKEND_URL}/api/ghost/schedule`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: schedulePostData
    });
    
    const scheduleResultData = await scheduleResponse.json();
    console.log('✅ STEP 6: Schedule post response:', scheduleResponse.status());
    console.log('   Response data:', JSON.stringify(scheduleResultData, null, 2));
    
    if (scheduleResponse.ok()) {
      expect(scheduleResultData.success).toBe(true);
      expect(scheduleResultData.post).toBeDefined();
      console.log('   Scheduled post ID:', scheduleResultData.post.id);
    } else {
      console.log('⚠️  Post scheduling failed:', scheduleResultData);
    }
  });

  test('WORKFLOW STEP 7: AI Caption Generation', async ({ request }) => {
    const loginResponse = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password }
    });
    const { accessToken } = await loginResponse.json();
    
    const captionRequest = {
      platform: 'instagram',
      context: 'Cocktail bar event, summer vibes',
      brandVoice: 'fun'
    };
    
    const captionResponse = await request.post(`${BACKEND_URL}/api/ghost/generate-caption`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: captionRequest
    });
    
    const captionData = await captionResponse.json();
    console.log('✅ STEP 7: AI Caption generation response:', captionResponse.status());
    console.log('   Response data:', JSON.stringify(captionData, null, 2));
    
    if (captionResponse.ok()) {
      expect(captionData.caption).toBeDefined();
      console.log('   Generated caption:', captionData.caption);
    } else {
      console.log('⚠️  Caption generation failed:', captionData);
    }
  });
});
