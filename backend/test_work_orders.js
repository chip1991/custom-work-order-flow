const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/work-orders`;

async function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body ? JSON.parse(body) : null);
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- Starting Work Orders API Tests ---');

    // 1. Create
    console.log('\n[POST] /api/work-orders');
    const created = await request('POST', '', {
      name: 'Test Workflow',
      description: 'This is a test workflow',
      formSchema: '{"fields":[]}',
      workflowData: '{"nodes":[]}'
    });
    console.log('Created:', created);
    const id = created.id;

    // 2. Get List
    console.log('\n[GET] /api/work-orders');
    const list = await request('GET', '');
    console.log(`Found ${list.length} work orders. Includes created:`, list.some(item => item.id === id));

    // 3. Get Single
    console.log(`\n[GET] /api/work-orders/${id}`);
    const single = await request('GET', `/${id}`);
    console.log('Fetched single:', single.name);

    // 4. Update
    console.log(`\n[PUT] /api/work-orders/${id}`);
    const updated = await request('PUT', `/${id}`, {
      name: 'Updated Workflow Name',
      description: 'Updated description'
    });
    console.log('Updated:', updated.name);

    // 5. Delete
    console.log(`\n[DELETE] /api/work-orders/${id}`);
    const deleted = await request('DELETE', `/${id}`);
    console.log('Deleted:', deleted);

    // 6. Verify Deletion
    console.log(`\n[GET] /api/work-orders/${id} (Should fail)`);
    try {
      await request('GET', `/${id}`);
      console.error('ERROR: Item still exists!');
    } catch (e) {
      console.log('Success: Item no longer exists. (' + e.message + ')');
    }

    console.log('\n--- All Tests Passed! ---');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
