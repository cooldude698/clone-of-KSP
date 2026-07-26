const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Readable } = require('stream');
const chatHandler = require('./index');

async function runTest() {
    console.log("Running Chat Function local test...");

    const testPayload = {
        query: "How many vehicle thefts happened in Koramangala last month?",
        language: "en",
        conversation_id: "test_conv_123",
        conversation_history: []
    };

    // Create a mock Readable stream for the request body
    const req = Readable.from(JSON.stringify(testPayload));
    req.getMethod = () => 'POST';

    // Mock functions for catalyst context (since we're running locally, we need mock/dummy behaviors)
    // We will bypass actual catalyst SDK initialization in SDK call if zcatalyst-sdk-node fails
    // or mocks can be set up.
    // Wait, let's mock req.headers and getHeader to prevent errors if catalyst SDK tries to read them.
    req.headers = {
        'content-type': 'application/json'
    };

    const res = {
        headers: {},
        statusCode: 200,
        set: function(name, value) {
            this.headers[name] = value;
            return this;
        },
        setHeader: function(name, value) {
            this.headers[name] = value;
            return this;
        },
        writeHead: function(statusCode, headers = {}) {
            this.statusCode = statusCode;
            Object.assign(this.headers, headers);
            return this;
        },
        write: function(data) {
            console.log("Response chunk:", data);
        },
        end: function(data) {
            console.log("\n--- Response End ---");
            console.log("Status Code:", this.statusCode);
            console.log("Headers:", JSON.stringify(this.headers, null, 2));
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    console.log("Body:", JSON.stringify(parsed, null, 2));
                } catch {
                    console.log("Body (raw):", data);
                }
            }
            console.log("--------------------");
        }
    };

    try {
        await chatHandler(req, res);
    } catch (err) {
        console.error("Test execution failed:", err);
    }
}

runTest();
