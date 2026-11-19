/**
 * Naseer Plywood & Hardware — Production E2E Smoke Test Suite
 * Validates public visitor journeys, bilingual RTL flows, real-time search,
 * enquiry submissions, and admin dashboard & build workflows.
 */

const puppeteer = require('puppeteer');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || path.join(
  process.env.HOME,
  '.cache/puppeteer/chrome/linux-158.0.8127.36/chrome-linux64/chrome-wrapper.sh'
);

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

async function runE2ESmokeTests() {
  console.log('======================================================================');
  console.log('STARTING END-TO-END SMOKE TEST SUITE');
  console.log(`Target: ${BASE_URL} with Headless Chrome`);
  console.log('======================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const results = {
    englishFlow: false,
    enquiryFormSubmission: false,
    bilingualUrduRtlFlow: false,
    realtimeSearchFlow: false,
    adminAuthAndBuildFlow: false,
    pricingPolicyIntegrity: false,
    errors: []
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // ------------------------------------------------------------------------
    // JOURNEY 1: English Public Visitor Flow
    // ------------------------------------------------------------------------
    console.log('[Test 1/5] Running English Public Visitor Journey...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Verify title and semantic markup
    const homeTitle = await page.title();
    console.log(`  -> Homepage Title: "${homeTitle}"`);
    if (!homeTitle.includes('Naseer Plywood & Hardware')) {
      throw new Error(`Unexpected homepage title: ${homeTitle}`);
    }

    // Verify Hero Slider
    const heroSlideExists = await page.$('.hero-slide');
    if (!heroSlideExists) throw new Error('Hero slide not found on homepage');
    console.log('  -> Hero slider verified.');

    // Click Category Navigation (Hardware)
    await page.goto(`${BASE_URL}/hardware/`, { waitUntil: 'networkidle2' });
    const categoryH1 = await page.$eval('h1', el => el.textContent.trim());
    console.log(`  -> Category H1: "${categoryH1}"`);
    if (!categoryH1.includes('Hardware')) throw new Error(`Unexpected category H1: ${categoryH1}`);

    // Verify all cards enforce "Price on Request"
    const priceTexts = await page.$$eval('.price-status', els => els.map(e => e.textContent.trim()));
    const numericPricesFound = priceTexts.some(t => /\d+/.test(t) && !t.includes('Request') && !t.includes('رابطہ'));
    if (numericPricesFound) {
      throw new Error(`Found unexpected numeric prices on catalogue: ${JSON.stringify(priceTexts)}`);
    }
    console.log(`  -> Checked ${priceTexts.length} product cards: All enforce Price on Request.`);

    // Navigate to Product Detail (DS-681 Smart Door Lock)
    await page.goto(`${BASE_URL}/products/ds-681-smart-door-lock/`, { waitUntil: 'networkidle2' });
    const productH1 = await page.$eval('h1.product-title', el => el.textContent.trim());
    console.log(`  -> Product Detail Title: "${productH1}"`);
    if (!productH1.includes('DS-681')) throw new Error(`Unexpected product title: ${productH1}`);

    // Verify SKU
    const skuText = await page.$eval('.sku-badge', el => el.textContent.trim());
    console.log(`  -> SKU: "${skuText}"`);
    if (!skuText.includes('NP-LK-DS681')) throw new Error(`Expected SKU NP-LK-DS681, got: ${skuText}`);

    // Verify Häfele is NOT displayed as brand for DS-681
    const brandTag = await page.$('.product-brand-tag');
    if (brandTag) {
      const brandText = await page.evaluate(el => el.textContent, brandTag);
      if (brandText.toLowerCase().includes('hafele')) {
        throw new Error('Unverified brand Häfele still displayed for DS-681');
      }
    }
    console.log('  -> Brand verification: Häfele is cleanly unassigned.');

    // Verify WhatsApp CTA link structure
    const waHref = await page.$eval('a.whatsapp-primary-btn', el => el.getAttribute('href'));
    if (!waHref.includes('wa.me/923045030046') || !waHref.includes('DS-681')) {
      throw new Error(`Malformed WhatsApp link: ${waHref}`);
    }
    console.log('  -> WhatsApp CTA link verified.');

    results.englishFlow = true;
    results.pricingPolicyIntegrity = true;

    // ------------------------------------------------------------------------
    // JOURNEY 2: Enquiry Form Submission
    // ------------------------------------------------------------------------
    console.log('\n[Test 2/5] Testing Enquiry Form Submission on Product Page...');
    await page.evaluate(() => {
      document.querySelector('.enquiry-form')?.scrollIntoView();
    });

    await page.type('#enquiry-name', 'Chaudhry E2E Tester');
    await page.type('#enquiry-phone', '03001234567');
    await page.type('#enquiry-email', 'tester@example.com');
    await page.type('#enquiry-message', 'Automated E2E smoke test inquiry for commercial door locks.');

    const submitBtn = await page.$('.enquiry-form button[type="submit"]');
    await submitBtn.click();

    // Wait for submission confirmation alert
    await page.waitForSelector('.enquiry-success', { timeout: 10000 });
    const successMsg = await page.$eval('.enquiry-success .success-heading', el => el.textContent.trim());
    console.log(`  -> Enquiry Submission Response: "${successMsg}"`);
    if (!successMsg.toLowerCase().includes('received') && !successMsg.toLowerCase().includes('thank') && !successMsg.toLowerCase().includes('موصول')) {
      throw new Error(`Unexpected enquiry success message: ${successMsg}`);
    }
    results.enquiryFormSubmission = true;

    // ------------------------------------------------------------------------
    // JOURNEY 3: Bilingual Urdu RTL Flow
    // ------------------------------------------------------------------------
    console.log('\n[Test 3/5] Running Bilingual Urdu RTL Flow...');
    await page.goto(`${BASE_URL}/ur/`, { waitUntil: 'networkidle2' });

    // Check html dir and lang attributes
    const dir = await page.$eval('html', el => el.getAttribute('dir'));
    const lang = await page.$eval('html', el => el.getAttribute('lang'));
    console.log(`  -> Urdu Root: dir="${dir}", lang="${lang}"`);
    if (dir !== 'rtl' || lang !== 'ur') {
      throw new Error(`Urdu page layout incorrect: dir=${dir}, lang=${lang}`);
    }

    // Check Urdu Category Page
    await page.goto(`${BASE_URL}/ur/hardware/`, { waitUntil: 'networkidle2' });
    const urH1 = await page.$eval('h1', el => el.textContent.trim());
    console.log(`  -> Urdu Category H1: "${urH1}"`);

    // Check Urdu Product Detail
    await page.goto(`${BASE_URL}/ur/products/ds-681-smart-door-lock/`, { waitUntil: 'networkidle2' });
    const urProductH1 = await page.$eval('h1.product-title', el => el.textContent.trim());
    console.log(`  -> Urdu Product Title: "${urProductH1}"`);
    if (!urProductH1.includes('ڈی ایس 681') && !urProductH1.includes('DS-681')) {
      throw new Error(`Unexpected Urdu product title: ${urProductH1}`);
    }

    results.bilingualUrduRtlFlow = true;

    // ------------------------------------------------------------------------
    // JOURNEY 4: Interactive Real-Time Search Flow
    // ------------------------------------------------------------------------
    console.log('\n[Test 4/5] Testing Interactive Search Flow...');
    await page.goto(`${BASE_URL}/search/`, { waitUntil: 'networkidle2' });

    const searchInput = await page.$('input[type="search"], input[type="text"].search-input, .search-bar input');
    if (!searchInput) throw new Error('Search input element not found');

    await searchInput.type('brass');
    await new Promise(r => setTimeout(r, 600)); // debounce wait

    const searchResults = await page.$$('.search-result-card, .search-results article, .product-card');
    console.log(`  -> Search for "brass" returned ${searchResults.length} results.`);
    if (searchResults.length === 0) {
      throw new Error('Search returned 0 results for query "brass"');
    }
    results.realtimeSearchFlow = true;

    // ------------------------------------------------------------------------
    // JOURNEY 5: Admin Auth, Metrics & Rebuild Flow
    // ------------------------------------------------------------------------
    console.log('\n[Test 5/5] Testing Admin Authentication, Metrics & Rebuild Flow...');
    
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@naseerhardware.com', password: 'AdminPass123!' })
    });
    if (!loginRes.ok) throw new Error(`Admin login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    const refreshToken = loginData.refresh_token;
    console.log('  -> Admin login: SUCCESS (Bearer token issued).');

    // Fetch metrics
    const metricsRes = await fetch(`${BASE_URL}/api/v1/admin/dashboard/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!metricsRes.ok) throw new Error(`Dashboard metrics failed: ${metricsRes.status}`);
    const metrics = await metricsRes.json();
    console.log(`  -> Dashboard Metrics: ${metrics.total_products} products, ${metrics.total_categories} categories, ${metrics.total_enquiries} enquiries.`);

    // Trigger rebuild
    const buildRes = await fetch(`${BASE_URL}/api/v1/admin/build/trigger`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!buildRes.ok) throw new Error(`Build trigger failed: ${buildRes.status}`);
    const buildData = await buildRes.json();
    console.log(`  -> Build trigger: ${buildData.status} (active: ${buildData.active_release_id})`);

    // Poll status
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`${BASE_URL}/api/v1/admin/build/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pollData = await pollRes.json();
      if (pollData.status !== 'building') {
        console.log(`  -> Build completed with status: ${pollData.status} (${pollData.last_duration_seconds}s)`);
        break;
      }
    }

    // Test token refresh
    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!refreshRes.ok) throw new Error(`Token refresh failed: ${refreshRes.status}`);
    const refreshData = await refreshRes.json();
    const newAccessToken = refreshData.access_token;
    console.log('  -> Refresh token rotation: SUCCESS.');

    // Logout
    const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${newAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshData.refresh_token })
    });
    if (!logoutRes.ok) throw new Error(`Logout failed: ${logoutRes.status}`);
    console.log('  -> Admin logout & session revocation: SUCCESS.');

    results.adminAuthAndBuildFlow = true;

  } catch (err) {
    console.error('\nE2E TEST FAILURE:', err.message);
    results.errors.push(err.message);
  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log('END-TO-END SMOKE TEST RESULTS');
  console.log('======================================================================');
  console.log(`English Public Visitor Flow:   ${results.englishFlow ? 'PASSED' : 'FAILED'}`);
  console.log(`Enquiry Form Submission:       ${results.enquiryFormSubmission ? 'PASSED' : 'FAILED'}`);
  console.log(`Bilingual Urdu RTL Flow:       ${results.bilingualUrduRtlFlow ? 'PASSED' : 'FAILED'}`);
  console.log(`Real-Time Search Flow:         ${results.realtimeSearchFlow ? 'PASSED' : 'FAILED'}`);
  console.log(`Admin Auth & Rebuild Flow:     ${results.adminAuthAndBuildFlow ? 'PASSED' : 'FAILED'}`);
  console.log(`Pricing Policy Integrity:      ${results.pricingPolicyIntegrity ? 'PASSED' : 'FAILED'}`);
  console.log('======================================================================');

  const allPassed = Object.keys(results)
    .filter(k => k !== 'errors')
    .every(k => results[k] === true);

  if (!allPassed) {
    console.error('One or more E2E tests failed!');
    process.exit(1);
  } else {
    console.log('ALL END-TO-END SMOKE TESTS PASSED CLEANLY!\n');
  }
}

if (require.main === module) {
  runE2ESmokeTests().catch(err => {
    console.error('Fatal E2E suite error:', err);
    process.exit(1);
  });
}

module.exports = { runE2ESmokeTests };
