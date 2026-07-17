if (!global.Headers) {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = {};
      if (init) {
        if (init instanceof Headers) {
          this.map = { ...init.map };
        } else if (Array.isArray(init)) {
          for (const [key, value] of init) {
            this.set(key, value);
          }
        } else {
          for (const [key, value] of Object.entries(init)) {
            this.set(key, value);
          }
        }
      }
    }
    set(name, value) { this.map[name.toLowerCase()] = String(value); }
    append(name, value) {
      const key = name.toLowerCase();
      this.map[key] = this.map[key] ? `${this.map[key]}, ${value}` : String(value);
    }
    get(name) { return this.map[name.toLowerCase()] || null; }
    has(name) { return name.toLowerCase() in this.map; }
    forEach(callback, thisArg) {
      for (const [key, value] of Object.entries(this.map)) {
        callback.call(thisArg, value, key, this);
      }
    }
  };
}

if (!global.fetch) {
  const axios = require('axios');
  global.fetch = async (url, options = {}) => {
    try {
      const headers = {};
      if (options.headers) {
        if (options.headers instanceof global.Headers) {
          options.headers.forEach((value, key) => { headers[key] = value; });
        } else if (Array.isArray(options.headers)) {
          for (const [key, value] of options.headers) headers[key] = value;
        } else {
          for (const [key, value] of Object.entries(options.headers)) headers[key] = value;
        }
      }
      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.body,
        headers,
        responseType: 'text'
      });
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        text: async () => response.data,
        json: async () => typeof response.data === 'string' ? JSON.parse(response.data) : response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          statusText: error.response.statusText,
          text: async () => typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
          json: async () => typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data
        };
      }
      throw error;
    }
  };
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const delay = ms => new Promise(res => setTimeout(res, ms));

const getAllKeys = () => {
  const keys = [];
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key !== 'PASTE_KEY_HERE') keys.push({ key, index: i });
  }
  return keys;
};

async function testKey(apiKeyObj) {
  const { key: apiKey, index } = apiKeyObj;
  console.log(`\nTesting Key ${index}: ${apiKey.substring(0, 15)}...`);
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent('Say "DRISHTI online" in exactly those words.');
    console.log(`✅ Key ${index} works! Response: ${result.response.text()}`);
    return true;
  } catch (err) {
    console.error(`❌ Key ${index} failed: ${err.message}`);
    return false;
  }
}

async function test() {
  const keys = getAllKeys();
  console.log(`Found ${keys.length} API keys. Testing all with 5-second delays...\n`);

  if (keys.length === 0) {
    console.error('No keys found in .env — make sure GEMINI_API_KEY_1 through GEMINI_API_KEY_10 are set');
    return;
  }

  let workingKeys = 0;
  for (let i = 0; i < keys.length; i++) {
    const worked = await testKey(keys[i]);
    if (worked) workingKeys++;
    if (i < keys.length - 1) {
      console.log('Waiting 5 seconds before next key...');
      await delay(5000);
    }
  }

  console.log(`\n===========================`);
  console.log(`Result: ${workingKeys}/${keys.length} keys working`);
  console.log(`===========================`);
}

test();