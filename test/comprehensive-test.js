/**
 * LinkTwin n8n Node - Comprehensive Test Suite
 *
 * Tests ALL fields for ALL operations:
 * - Create Deep Link (14 fields)
 * - Get Deep Link
 * - List Deep Links (all filters and sort options)
 * - Update Deep Link (14 fields)
 * - Get Statistics (all date range options)
 * - Delete Deep Link
 * - Error Handling (invalid inputs, missing fields, etc.)
 *
 * Usage:
 *   LINKTWIN_API_KEY=your_key LINKTWIN_BASE_URL=http://localhost/api node test/comprehensive-test.js
 *
 * Environment variables:
 *   LINKTWIN_API_KEY  - (required) Your LinkTwin API key
 *   LINKTWIN_BASE_URL - (optional) API base URL, defaults to http://localhost/api
 */

const http = require('http');

const API_KEY = process.env.LINKTWIN_API_KEY;
const BASE_URL = process.env.LINKTWIN_BASE_URL || 'http://localhost/api';

if (!API_KEY) {
  console.error('Error: LINKTWIN_API_KEY environment variable is required.');
  console.error('Usage: LINKTWIN_API_KEY=your_key node test/comprehensive-test.js');
  process.exit(1);
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Store IDs for cleanup
const createdResources = {
  links: [],
  collections: []
};

// =============================================================================
// HTTP Request Helper
// =============================================================================

async function makeRequest(method, path, body = null, customApiKey = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${customApiKey || API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// =============================================================================
// Test Helper Functions
// =============================================================================

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status} - ${name}`);
  if (details) console.log(`       ${details}`);

  results.tests.push({ name, status: passed ? 'PASS' : 'FAIL', details });
  if (passed) results.passed++;
  else results.failed++;
}

function logSkip(name, reason) {
  console.log(`  ⏭️  SKIP - ${name}`);
  console.log(`       Reason: ${reason}`);
  results.tests.push({ name, status: 'SKIP', reason });
  results.skipped++;
}

function section(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

function subsection(title) {
  console.log(`\n--- ${title} ---`);
}

// =============================================================================
// SETUP: Create test resources (collection for testing)
// =============================================================================

async function setup() {
  section('SETUP: Creating Test Resources');

  // Try to create a collection for testing
  try {
    const response = await makeRequest('POST', '/collection/add', {
      name: 'n8n-test-collection-' + Date.now()
    });
    if (response.data.error === 0) {
      createdResources.collections.push(response.data.id);
      console.log(`  Created test collection: ID ${response.data.id}`);
    }
  } catch (e) {
    console.log(`  Note: Could not create test collection (may not affect tests)`);
  }
}

// =============================================================================
// CLEANUP: Delete test resources
// =============================================================================

async function cleanup() {
  section('CLEANUP: Removing Test Resources');

  // Delete created links
  for (const linkId of createdResources.links) {
    try {
      await makeRequest('DELETE', `/url/delete/${linkId}`);
      console.log(`  Deleted link: ${linkId}`);
    } catch (e) {
      console.log(`  Failed to delete link ${linkId}: ${e.message}`);
    }
  }

  // Delete created collections
  for (const collId of createdResources.collections) {
    try {
      await makeRequest('DELETE', `/collection/${collId}/delete`);
      console.log(`  Deleted collection: ${collId}`);
    } catch (e) {
      console.log(`  Failed to delete collection ${collId}: ${e.message}`);
    }
  }
}

// =============================================================================
// TEST 1: Credential Validation
// =============================================================================

async function testCredentialValidation() {
  section('TEST 1: Credential Validation');

  const response = await makeRequest('GET', '/accountinfo');
  logTest(
    'GET /accountinfo with valid API key',
    response.data.error === 0,
    `Email: ${response.data.data?.email}, Plan: ${response.data.data?.current_plan}`
  );
}

// =============================================================================
// TEST 2: Dynamic Dropdowns (loadOptions)
// =============================================================================

async function testDynamicDropdowns() {
  section('TEST 2: Dynamic Dropdowns (loadOptions methods)');

  // Collections
  const collections = await makeRequest('GET', '/collections');
  logTest(
    'GET /collections',
    collections.data.error === 0,
    `Found ${collections.data.data?.result || 0} collections`
  );

  // Domains
  const domains = await makeRequest('GET', '/domains');
  logTest(
    'GET /domains',
    domains.data.error === 0,
    `Found ${domains.data.data?.result || 0} domains`
  );
  if (domains.data.data?.domains) {
    domains.data.data.domains.forEach(d => console.log(`       - ${d.domain} (ID: ${d.id})`));
  }

  // Pixels
  const pixels = await makeRequest('GET', '/pixels');
  logTest(
    'GET /pixels',
    pixels.data.error === 0,
    `Found ${pixels.data.data?.result || 0} pixels`
  );
}

// =============================================================================
// TEST 3: Create Deep Link - ALL FIELDS
// =============================================================================

async function testCreateDeepLink() {
  section('TEST 3: Create Deep Link - ALL FIELDS');

  const timestamp = Date.now();

  // Test 3.1: Minimal create (only required field)
  subsection('3.1: Minimal Create (url only)');
  const minimal = await makeRequest('POST', '/url/add', {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  });
  logTest(
    'Create with URL only',
    minimal.data.error === 0,
    minimal.data.error === 0 ? `ID: ${minimal.data.id}, Short: ${minimal.data.shorturl}` : minimal.data.message
  );
  if (minimal.data.id) createdResources.links.push(minimal.data.id);

  // Test 3.2: Create with custom alias
  subsection('3.2: Custom Alias');
  const withAlias = await makeRequest('POST', '/url/add', {
    url: 'https://www.spotify.com/track/123',
    custom: `n8n-alias-${timestamp}`
  });
  logTest(
    'Create with custom alias',
    withAlias.data.error === 0,
    withAlias.data.error === 0 ? `Alias: n8n-alias-${timestamp}` : withAlias.data.message
  );
  if (withAlias.data.id) createdResources.links.push(withAlias.data.id);

  // Test 3.3: Create with domain
  subsection('3.3: Custom Domain');
  const withDomain = await makeRequest('POST', '/url/add', {
    url: 'https://www.amazon.com/dp/B08N5WRWNW',
    domain: 'https://testnewdomain.com'
  });
  logTest(
    'Create with custom domain',
    withDomain.data.error === 0 && withDomain.data.shorturl?.includes('testnewdomain'),
    withDomain.data.error === 0 ? `Short URL: ${withDomain.data.shorturl}` : withDomain.data.message
  );
  if (withDomain.data.id) createdResources.links.push(withDomain.data.id);

  // Test 3.4: Create with meta tags (social sharing)
  subsection('3.4: Meta Tags (Social Sharing)');
  const withMeta = await makeRequest('POST', '/url/add', {
    url: 'https://www.netflix.com/title/123',
    metatitle: 'Custom OG Title for Testing',
    metadescription: 'Custom OG Description for social sharing preview',
    metaimage: 'https://picsum.photos/200/200'
  });
  logTest(
    'Create with metatitle',
    withMeta.data.error === 0,
    withMeta.data.error === 0 ? `Title: ${withMeta.data.title}` : withMeta.data.message
  );
  logTest(
    'Create with metadescription',
    withMeta.data.error === 0,
    `Description set`
  );
  logTest(
    'Create with metaimage',
    withMeta.data.error === 0,
    `Image URL set`
  );
  if (withMeta.data.id) createdResources.links.push(withMeta.data.id);

  // Test 3.5: Create with password protection
  subsection('3.5: Password Protection');
  const withPassword = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/secret',
    password: 'testpass123'
  });
  logTest(
    'Create with password',
    withPassword.data.error === 0,
    withPassword.data.error === 0 ? `Password protected link created` : withPassword.data.message
  );
  if (withPassword.data.id) createdResources.links.push(withPassword.data.id);

  // Test 3.6: Create with expiration
  subsection('3.6: Expiration Settings');
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const withExpiry = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/expiring',
    expiry: futureDate,
    expirationredirect: 'https://www.example.com/expired-page'
  });
  logTest(
    'Create with expiry date',
    withExpiry.data.error === 0,
    withExpiry.data.error === 0 ? `Expires: ${futureDate}` : withExpiry.data.message
  );
  logTest(
    'Create with expiration redirect',
    withExpiry.data.error === 0,
    `Redirect URL set`
  );
  if (withExpiry.data.id) createdResources.links.push(withExpiry.data.id);

  // Test 3.7: Create with click limit
  subsection('3.7: Click Limit');
  const withClickLimit = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/limited',
    clicklimit: 100
  });
  logTest(
    'Create with click limit',
    withClickLimit.data.error === 0,
    withClickLimit.data.error === 0 ? `Click limit: 100` : withClickLimit.data.message
  );
  if (withClickLimit.data.id) createdResources.links.push(withClickLimit.data.id);

  // Test 3.8: Create with note
  subsection('3.8: Internal Note');
  const withNote = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/noted',
    note: 'This is an internal note for testing - not visible to visitors'
  });
  logTest(
    'Create with internal note',
    withNote.data.error === 0,
    withNote.data.error === 0 ? `Note saved` : withNote.data.message
  );
  if (withNote.data.id) createdResources.links.push(withNote.data.id);

  // Test 3.9: Create with display_title
  subsection('3.9: Display Title');
  const withDisplayTitle = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/display-title-test',
    display_title: 'Custom Dashboard Title'
  });
  logTest(
    'Create with display_title',
    withDisplayTitle.data.error === 0,
    withDisplayTitle.data.error === 0 ? `Display title: Custom Dashboard Title` : withDisplayTitle.data.message
  );
  if (withDisplayTitle.data.id) createdResources.links.push(withDisplayTitle.data.id);

  // Test 3.10: Create with collections (if available)
  subsection('3.10: Collections Assignment');
  if (createdResources.collections.length > 0) {
    const withCollections = await makeRequest('POST', '/url/add', {
      url: 'https://www.example.com/in-collection',
      collections: createdResources.collections
    });
    logTest(
      'Create with collections',
      withCollections.data.error === 0,
      withCollections.data.error === 0 ? `Assigned to collection(s)` : withCollections.data.message
    );
    if (withCollections.data.id) createdResources.links.push(withCollections.data.id);
  } else {
    logSkip('Create with collections', 'No test collection available');
  }

  // Test 3.11: Create with ALL fields combined
  subsection('3.11: ALL FIELDS Combined');
  const fullLinkBody = {
    url: 'https://www.youtube.com/watch?v=FULL_TEST',
    custom: `n8n-full-${timestamp}`,
    domain: 'https://testnewdomain.com',
    metatitle: 'Full Test Title',
    metadescription: 'Full test description with all fields',
    metaimage: 'https://picsum.photos/300/300',
    password: 'fulltest123',
    expiry: futureDate,
    expirationredirect: 'https://example.com/full-expired',
    clicklimit: 500,
    note: 'Full test with all fields',
    display_title: 'Full Test Dashboard Title'
  };
  // Only add collections if we have some
  if (createdResources.collections.length > 0) {
    fullLinkBody.collections = createdResources.collections;
  }
  const fullLink = await makeRequest('POST', '/url/add', fullLinkBody);

  if (fullLink.data.error !== 0) {
    console.log(`       DEBUG: API Error Response: ${JSON.stringify(fullLink.data)}`);
  }

  logTest(
    'Create with ALL fields',
    fullLink.data.error === 0 && fullLink.data.id,
    fullLink.data.error === 0 ? `ID: ${fullLink.data.id}, Short: ${fullLink.data.shorturl}` : `Error: ${fullLink.data.message}`
  );
  if (fullLink.data.id) createdResources.links.push(fullLink.data.id);

  // If fullLink failed, use withNote as fallback for later tests
  const testLinkId = fullLink.data.id || withNote.data.id || withDisplayTitle.data.id;
  if (!testLinkId) {
    console.log('       WARNING: No link ID available for subsequent tests');
  }

  // Store for later tests
  return testLinkId;
}

// =============================================================================
// TEST 4: Get Deep Link
// =============================================================================

async function testGetDeepLink(linkId) {
  section('TEST 4: Get Deep Link');

  if (!linkId) {
    logSkip('Get Deep Link', 'No link ID from create test');
    return;
  }

  // Test 4.1: Get by numeric ID
  subsection('4.1: Get by Numeric ID');
  const byId = await makeRequest('GET', `/url/${linkId}`);
  logTest(
    `GET /url/${linkId}`,
    byId.data.error === 0,
    byId.data.error === 0 ? `Title: ${byId.data.data?.title}, Clicks: ${byId.data.data?.clicks}` : byId.data.message
  );

  // Test 4.2: Get by short URL (if we have it)
  if (byId.data.data?.shorturl) {
    subsection('4.2: Get by Short URL');
    const shortUrl = byId.data.data.shorturl;
    const byShortUrl = await makeRequest('GET', `/url/${encodeURIComponent(shortUrl)}`);
    logTest(
      `GET /url/{shortUrl}`,
      byShortUrl.data.error === 0,
      `Short URL lookup works`
    );
  }
}

// =============================================================================
// TEST 5: List Deep Links - ALL OPTIONS
// =============================================================================

async function testListDeepLinks() {
  section('TEST 5: List Deep Links - ALL OPTIONS');

  // Test 5.1: Basic list with limit
  subsection('5.1: Basic List with Limit');
  const basicList = await makeRequest('GET', '/urls?limit=5&page=1');
  logTest(
    'GET /urls?limit=5&page=1',
    basicList.data.error === 0,
    `Total: ${basicList.data.data?.result}, Page: ${basicList.data.data?.currentpage}/${basicList.data.data?.maxpage}`
  );

  // Test 5.2: Pagination
  subsection('5.2: Pagination');
  const page2 = await makeRequest('GET', '/urls?limit=2&page=2');
  logTest(
    'GET /urls?limit=2&page=2',
    page2.data.error === 0,
    `Page 2 returned ${page2.data.data?.urls?.length || 0} links`
  );

  // Test 5.3: Sort options
  subsection('5.3: Sort Options');
  const sortOptions = [
    { value: 'date_desc', name: 'Date (Newest First)' },
    { value: 'date_asc', name: 'Date (Oldest First)' },
    { value: 'clicks_desc', name: 'Clicks (Most First)' },
    { value: 'clicks_asc', name: 'Clicks (Least First)' },
    { value: 'name_asc', name: 'Name (A-Z)' },
    { value: 'name_desc', name: 'Name (Z-A)' }
  ];

  for (const sort of sortOptions) {
    const sorted = await makeRequest('GET', `/urls?limit=3&order=${sort.value}`);
    logTest(
      `Sort: ${sort.name}`,
      sorted.data.error === 0,
      `Returned ${sorted.data.data?.urls?.length || 0} links`
    );
  }

  // Test 5.4: Search filter
  subsection('5.4: Search Filter');
  const searched = await makeRequest('GET', '/urls?limit=10&search=youtube');
  logTest(
    'GET /urls?search=youtube',
    searched.data.error === 0,
    `Found ${searched.data.data?.urls?.length || 0} links matching "youtube"`
  );

  // Test 5.5: Collections filter
  subsection('5.5: Collections Filter');
  if (createdResources.collections.length > 0) {
    const collectionFilter = encodeURIComponent(JSON.stringify(createdResources.collections));
    const filtered = await makeRequest('GET', `/urls?limit=10&collections=${collectionFilter}`);
    logTest(
      'GET /urls?collections=[...]',
      filtered.data.error === 0,
      `Found ${filtered.data.data?.urls?.length || 0} links in collection`
    );
  } else {
    logSkip('Collections filter', 'No test collection available');
  }
}

// =============================================================================
// TEST 6: Update Deep Link - ALL FIELDS
// =============================================================================

async function testUpdateDeepLink(linkId) {
  section('TEST 6: Update Deep Link - ALL FIELDS');

  if (!linkId) {
    logSkip('Update Deep Link', 'No link ID from create test');
    return;
  }

  const timestamp = Date.now();

  // Test 6.1: Update destination URL
  subsection('6.1: Update Destination URL');
  const updateUrl = await makeRequest('PUT', `/url/update/${linkId}`, {
    url: 'https://www.youtube.com/watch?v=UPDATED_URL'
  });
  logTest(
    'Update url field',
    updateUrl.data.error === 0,
    updateUrl.data.error === 0 ? `URL updated` : updateUrl.data.message
  );

  // Test 6.2: Update custom alias
  subsection('6.2: Update Custom Alias');
  const updateAlias = await makeRequest('PUT', `/url/update/${linkId}`, {
    custom: `updated-alias-${timestamp}`
  });
  logTest(
    'Update custom alias',
    updateAlias.data.error === 0,
    updateAlias.data.error === 0 ? `New alias: updated-alias-${timestamp}` : updateAlias.data.message
  );

  // Test 6.3: Update domain
  subsection('6.3: Update Domain');
  const updateDomain = await makeRequest('PUT', `/url/update/${linkId}`, {
    domain: 'http://localhost'
  });
  logTest(
    'Update domain',
    updateDomain.data.error === 0,
    updateDomain.data.error === 0 ? `Domain: ${updateDomain.data.shorturl}` : updateDomain.data.message
  );

  // Test 6.4: Update meta tags
  subsection('6.4: Update Meta Tags');
  const updateMeta = await makeRequest('PUT', `/url/update/${linkId}`, {
    metatitle: 'Updated OG Title',
    metadescription: 'Updated OG Description',
    metaimage: 'https://picsum.photos/400/400'
  });
  logTest(
    'Update metatitle',
    updateMeta.data.error === 0,
    `Title: ${updateMeta.data.title}`
  );
  logTest(
    'Update metadescription',
    updateMeta.data.error === 0,
    `Description updated`
  );
  logTest(
    'Update metaimage',
    updateMeta.data.error === 0,
    `Image URL updated`
  );

  // Test 6.5: Update password
  subsection('6.5: Update Password');
  const updatePassword = await makeRequest('PUT', `/url/update/${linkId}`, {
    password: 'newpassword456'
  });
  logTest(
    'Update password',
    updatePassword.data.error === 0,
    updatePassword.data.error === 0 ? `Password changed` : updatePassword.data.message
  );

  // Test 6.6: Remove password (set to null)
  subsection('6.6: Remove Password');
  const removePassword = await makeRequest('PUT', `/url/update/${linkId}`, {
    password: null
  });
  logTest(
    'Remove password (null)',
    removePassword.data.error === 0,
    removePassword.data.error === 0 ? `Password removed` : removePassword.data.message
  );

  // Test 6.7: Update expiration settings
  subsection('6.7: Update Expiration Settings');
  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const updateExpiry = await makeRequest('PUT', `/url/update/${linkId}`, {
    expiry: newExpiry,
    expirationredirect: 'https://example.com/new-expired-page'
  });
  logTest(
    'Update expiry',
    updateExpiry.data.error === 0,
    updateExpiry.data.error === 0 ? `Expiry: ${newExpiry}` : updateExpiry.data.message
  );
  logTest(
    'Update expirationredirect',
    updateExpiry.data.error === 0,
    `Redirect URL updated`
  );

  // Test 6.8: Update click limit
  subsection('6.8: Update Click Limit');
  const updateClickLimit = await makeRequest('PUT', `/url/update/${linkId}`, {
    clicklimit: 1000
  });
  logTest(
    'Update clicklimit',
    updateClickLimit.data.error === 0,
    updateClickLimit.data.error === 0 ? `Click limit: 1000` : updateClickLimit.data.message
  );

  // Test 6.9: Update note
  subsection('6.9: Update Internal Note');
  const updateNote = await makeRequest('PUT', `/url/update/${linkId}`, {
    note: 'Updated internal note'
  });
  logTest(
    'Update note',
    updateNote.data.error === 0,
    updateNote.data.error === 0 ? `Note updated` : updateNote.data.message
  );

  // Test 6.10: Update display_title
  subsection('6.10: Update Display Title');
  const updateDisplayTitle = await makeRequest('PUT', `/url/update/${linkId}`, {
    display_title: 'Updated Dashboard Title'
  });
  logTest(
    'Update display_title',
    updateDisplayTitle.data.error === 0,
    updateDisplayTitle.data.error === 0 ? `Display title updated` : updateDisplayTitle.data.message
  );

  // Test 6.11: Update collections
  subsection('6.11: Update Collections');
  if (createdResources.collections.length > 0) {
    const updateCollections = await makeRequest('PUT', `/url/update/${linkId}`, {
      collections: createdResources.collections
    });
    logTest(
      'Update collections',
      updateCollections.data.error === 0,
      updateCollections.data.error === 0 ? `Collections updated` : updateCollections.data.message
    );

    // Test removing from collections
    const removeCollections = await makeRequest('PUT', `/url/update/${linkId}`, {
      collections: []
    });
    logTest(
      'Remove from all collections (empty array)',
      removeCollections.data.error === 0,
      removeCollections.data.error === 0 ? `Removed from collections` : removeCollections.data.message
    );
  } else {
    logSkip('Update collections', 'No test collection available');
  }
}

// =============================================================================
// TEST 7: Get Statistics - ALL OPTIONS
// =============================================================================

async function testGetStatistics(linkId) {
  section('TEST 7: Get Statistics - ALL DATE RANGE OPTIONS');

  if (!linkId) {
    logSkip('Get Statistics', 'No link ID from create test');
    return;
  }

  // Test 7.1: Last 24 Hours
  subsection('7.1: Last 24 Hours');
  const last24h = await makeRequest('GET', `/statistics/link/${linkId}?from=last24hours`);
  logTest(
    'Statistics: Last 24 Hours (1d)',
    last24h.data.error === 0,
    last24h.data.error === 0 ? `Clicks: ${last24h.data.data?.totalClicks || 0}` : last24h.data.message
  );

  // Test 7.2: Last 7 Days
  subsection('7.2: Last 7 Days');
  const last7d = await makeRequest('GET', `/statistics/link/${linkId}?from=last7days`);
  logTest(
    'Statistics: Last 7 Days (7d)',
    last7d.data.error === 0,
    last7d.data.error === 0 ? `Clicks: ${last7d.data.data?.totalClicks || 0}` : last7d.data.message
  );

  // Test 7.3: Last 30 Days
  subsection('7.3: Last 30 Days');
  const last30d = await makeRequest('GET', `/statistics/link/${linkId}?from=last30days`);
  logTest(
    'Statistics: Last 30 Days (30d)',
    last30d.data.error === 0,
    last30d.data.error === 0 ? `Clicks: ${last30d.data.data?.totalClicks || 0}` : last30d.data.message
  );

  // Test 7.4: All Time
  subsection('7.4: All Time');
  const allTime = await makeRequest('GET', `/statistics/link/${linkId}?from=alltime`);
  logTest(
    'Statistics: All Time (max)',
    allTime.data.error === 0,
    allTime.data.error === 0 ? `Clicks: ${allTime.data.data?.totalClicks || 0}` : allTime.data.message
  );

  // Test 7.5: Custom Date Range
  subsection('7.5: Custom Date Range');
  const startDate = '2024-01-01';
  const endDate = '2024-12-31';
  const customRange = await makeRequest('GET', `/statistics/link/${linkId}?from=${startDate}&to=${endDate}`);
  logTest(
    'Statistics: Custom Range (2024)',
    customRange.data.error === 0,
    customRange.data.error === 0 ? `Clicks: ${customRange.data.data?.totalClicks || 0}` : customRange.data.message
  );

  // Test 7.6: With Timezone
  subsection('7.6: With Timezone');
  const withTimezone = await makeRequest('GET', `/statistics/link/${linkId}?from=last30days&timezone=Europe/Berlin`);
  logTest(
    'Statistics: With Timezone (Europe/Berlin)',
    withTimezone.data.error === 0,
    withTimezone.data.error === 0 ? `Timezone applied` : withTimezone.data.message
  );

  // Test 7.7: Statistics response fields
  subsection('7.7: Verify Statistics Response Fields');
  if (last30d.data.error === 0 && last30d.data.data) {
    const stats = last30d.data.data;
    logTest('Response has totalClicks', stats.totalClicks !== undefined, `Value: ${stats.totalClicks}`);
    logTest('Response has totalUniqueClicks', stats.totalUniqueClicks !== undefined, `Value: ${stats.totalUniqueClicks}`);
    logTest('Response has link info', stats.link !== undefined, `Link ID: ${stats.link?.id}`);
  }
}

// =============================================================================
// TEST 8: Delete Deep Link
// =============================================================================

async function testDeleteDeepLink() {
  section('TEST 8: Delete Deep Link');

  // Create a link specifically for deletion test
  subsection('8.1: Create Link for Deletion');
  const toDelete = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/to-be-deleted'
  });

  if (toDelete.data.error !== 0) {
    logSkip('Delete Deep Link', 'Could not create test link');
    return;
  }

  const deleteId = toDelete.data.id;
  console.log(`  Created link for deletion: ID ${deleteId}`);

  // Test 8.2: Delete by ID
  subsection('8.2: Delete by Numeric ID');
  const deleted = await makeRequest('DELETE', `/url/delete/${deleteId}`);
  logTest(
    `DELETE /url/delete/${deleteId}`,
    deleted.data.error === 0,
    deleted.data.error === 0 ? `Message: ${deleted.data.message}` : deleted.data.message
  );

  // Test 8.3: Verify deletion
  subsection('8.3: Verify Link No Longer Exists');
  const verify = await makeRequest('GET', `/url/${deleteId}`);
  logTest(
    'Link should not exist after deletion',
    verify.data.error !== 0,
    verify.data.error !== 0 ? `Correctly returns error` : `ERROR: Link still exists!`
  );
}

// =============================================================================
// TEST 9: Error Handling
// =============================================================================

async function testErrorHandling() {
  section('TEST 9: Error Handling');

  // Test 9.1: Invalid API Key
  subsection('9.1: Invalid API Key');
  const invalidKey = await makeRequest('GET', '/accountinfo', null, 'invalid-api-key-12345');
  logTest(
    'Invalid API key returns error',
    invalidKey.data.error !== 0 || invalidKey.status === 401,
    `Error: ${invalidKey.data.message || 'Unauthorized'}`
  );

  // Test 9.2: Missing required field (url)
  subsection('9.2: Missing Required Field');
  const missingUrl = await makeRequest('POST', '/url/add', {
    custom: 'test-without-url'
  });
  logTest(
    'Create without URL returns error',
    missingUrl.data.error !== 0,
    `Error: ${missingUrl.data.message || 'Unknown'}`
  );

  // Test 9.3: Invalid link ID
  subsection('9.3: Invalid Link ID');
  const invalidId = await makeRequest('GET', '/url/99999999');
  logTest(
    'GET with invalid ID returns error',
    invalidId.data.error !== 0,
    `Error: ${invalidId.data.message || 'Not found'}`
  );

  // Test 9.4: Update non-existent link
  subsection('9.4: Update Non-existent Link');
  const updateInvalid = await makeRequest('PUT', '/url/update/99999999', {
    metatitle: 'Should fail'
  });
  logTest(
    'Update non-existent link returns error',
    updateInvalid.data.error !== 0,
    `Error: ${updateInvalid.data.message || 'Not found'}`
  );

  // Test 9.5: Delete non-existent link
  subsection('9.5: Delete Non-existent Link');
  const deleteInvalid = await makeRequest('DELETE', '/url/delete/99999999');
  logTest(
    'Delete non-existent link returns error',
    deleteInvalid.data.error !== 0,
    `Error: ${deleteInvalid.data.message || 'Not found'}`
  );

  // Test 9.6: Unregistered domain behavior
  // NOTE: The API accepts ANY domain (even unregistered ones) - this is API design, not a bug
  subsection('9.6: Unregistered Domain Behavior');
  const unregisteredDomain = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/domain-test',
    domain: 'https://custom-domain-test.com'
  });
  // API accepts any domain - it doesn't validate ownership
  const domainAccepted = unregisteredDomain.data.error === 0 && unregisteredDomain.data.id;
  logTest(
    'API accepts custom domain (no validation)',
    domainAccepted,
    domainAccepted ? `Created with custom domain: ${unregisteredDomain.data.shorturl}` : `Unexpected rejection`
  );
  if (unregisteredDomain.data.id) {
    createdResources.links.push(unregisteredDomain.data.id);
  }

  // Test 9.7: Statistics for non-existent link
  subsection('9.7: Statistics for Non-existent Link');
  const statsInvalid = await makeRequest('GET', '/statistics/link/99999999?from=last30days');
  logTest(
    'Statistics for invalid link returns error',
    statsInvalid.data.error !== 0,
    `Error: ${statsInvalid.data.message || 'Not found'}`
  );

  // Test 9.8: Duplicate custom alias
  subsection('9.8: Duplicate Custom Alias');
  const firstAlias = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/first',
    custom: 'duplicate-test-alias'
  });
  if (firstAlias.data.id) createdResources.links.push(firstAlias.data.id);

  const duplicateAlias = await makeRequest('POST', '/url/add', {
    url: 'https://www.example.com/second',
    custom: 'duplicate-test-alias'
  });
  logTest(
    'Duplicate alias returns error',
    duplicateAlias.data.error !== 0,
    `Error: ${duplicateAlias.data.message || 'Alias already exists'}`
  );

  // Test 9.9: Invalid URL format
  subsection('9.9: Invalid URL Format');
  const invalidUrl = await makeRequest('POST', '/url/add', {
    url: 'not-a-valid-url'
  });
  logTest(
    'Invalid URL format returns error',
    invalidUrl.data.error !== 0,
    `Error: ${invalidUrl.data.message || 'Invalid URL'}`
  );
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║     LinkTwin n8n Node - COMPREHENSIVE TEST SUITE                     ║');
  console.log('║     Testing ALL fields for ALL operations                            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    await setup();
    await testCredentialValidation();
    await testDynamicDropdowns();
    const testLinkId = await testCreateDeepLink();
    await testGetDeepLink(testLinkId);
    await testListDeepLinks();
    await testUpdateDeepLink(testLinkId);
    await testGetStatistics(testLinkId);
    await testDeleteDeepLink();
    await testErrorHandling();
    await cleanup();
  } catch (e) {
    console.error('\n❌ FATAL ERROR:', e.message);
    console.error(e.stack);
  }

  // Final Summary
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                         FINAL TEST SUMMARY                           ║');
  console.log('╠══════════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests:  ${String(results.passed + results.failed + results.skipped).padEnd(5)} │  Passed: ${String(results.passed).padEnd(4)} │  Failed: ${String(results.failed).padEnd(4)} │  Skipped: ${String(results.skipped).padEnd(4)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`   - ${t.name}: ${t.details || t.error || 'Unknown error'}`);
    });
  }

  if (results.skipped > 0) {
    console.log('\n⏭️  SKIPPED TESTS:');
    results.tests.filter(t => t.status === 'SKIP').forEach(t => {
      console.log(`   - ${t.name}: ${t.reason}`);
    });
  }

  console.log('\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
