try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

let LOCAL_CONVERSATIONS_STORE = [
  {
    conversation_id: 'conv_demo_01',
    document_id: 'conv_demo_01',
    subject: 'Silk Board ANPR Intercept Investigation',
    last_updated: new Date().toISOString(),
    messages: [
      { role: 'user', content: 'Scan all CCTV cameras near Silk Board junction for suspect KA-05-HB-3342' },
      { role: 'assistant', content: 'Identified 3 active Safe City cameras near Silk Board with 98.7% ANPR confidence match. Trajectory shows vehicle headed towards Hosur Road.' }
    ]
  },
  {
    conversation_id: 'conv_demo_02',
    document_id: 'conv_demo_02',
    subject: 'Koramangala Vehicle Theft Hotspot Analysis',
    last_updated: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      { role: 'user', content: 'What are the repeat offenses in Koramangala 4th Block this month?' },
      { role: 'assistant', content: 'Koramangala 4th Block recorded 8 incidents (6 vehicle thefts, 2 burglaries). Primary suspect identified as Ramesh Kumar (Recidivism Risk: 92%).' }
    ]
  }
];

module.exports = async (req, res) => {
  const send = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  };

  const method = typeof req.getMethod === 'function' ? req.getMethod() : (req.method || 'GET');

  // OPTIONS — CORS preflight → 204
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // GET — List all conversations
  if (method === 'GET') {
    try {
      const queryParams = typeof req.getQueryParams === 'function' ? req.getQueryParams() || {} : (req.query || {});
      const limit = parseInt(queryParams.limit || '50', 10) || 50;

      let docs = [];
      try {
        const catalystApp = catalyst.initialize(req);
        const nosql = catalystApp.nosql();
        const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
        const collection = nosql.collection(collectionName);

        if (typeof collection.getDocuments === 'function') {
          docs = await collection.getDocuments();
        } else if (typeof collection.find === 'function') {
          const findResult = await collection.find();
          if (Array.isArray(findResult)) {
            docs = findResult;
          } else if (findResult && typeof findResult.toArray === 'function') {
            docs = await findResult.toArray();
          }
        } else if (typeof collection.getAllDocuments === 'function') {
          docs = await collection.getAllDocuments();
        } else if (typeof collection.getDocumentsDetails === 'function') {
          docs = await collection.getDocumentsDetails();
        }
      } catch (nosqlErr) {
        docs = LOCAL_CONVERSATIONS_STORE;
      }

      if (!docs || docs.length === 0) {
        docs = LOCAL_CONVERSATIONS_STORE;
      }

      // Sort by last_updated descending
      docs.sort((a, b) => new Date(b.last_updated || 0) - new Date(a.last_updated || 0));

      const total = docs.length;
      const slicedDocs = docs.slice(0, limit);

      const conversations = slicedDocs.map(doc => {
        let preview = '';
        if (doc.messages && doc.messages.length > 0) {
          const lastMsg = doc.messages[doc.messages.length - 1];
          preview = (lastMsg.content || '').substring(0, 120);
        }
        return {
          conversation_id: doc.document_id || doc.id || doc._id || doc.conversation_id || '',
          subject: doc.subject || '',
          last_updated: doc.last_updated || '',
          preview: preview,
          messages: doc.messages || [],
          message_count: doc.messages ? doc.messages.length : 0
        };
      });

      return send(200, { conversations, total });
    } catch (err) {
      return send(200, { conversations: LOCAL_CONVERSATIONS_STORE, total: LOCAL_CONVERSATIONS_STORE.length });
    }
  }

  // POST — Create or Update a conversation
  if (method === 'POST') {
    try {
      let body = req.body;
      if (!body || Object.keys(body).length === 0) {
        const raw = await new Promise((resolve, reject) => {
          let data = '';
          if (typeof req.on === 'function') {
            req.on('data', chunk => { data += chunk; });
            req.on('end', () => resolve(data));
            req.on('error', reject);
          } else {
            resolve('{}');
          }
        });
        body = JSON.parse(raw || '{}');
      }

      const { conversation_id, messages, subject } = body || {};
      const convId = conversation_id || `conv_${Date.now()}`;

      const docData = {
        document_id: convId,
        conversation_id: convId,
        subject: subject || (messages && messages[0]?.content?.slice(0, 40)) || 'Investigation Thread',
        messages: messages || [],
        last_updated: new Date().toISOString()
      };

      try {
        const catalystApp = catalyst.initialize(req);
        const nosql = catalystApp.nosql();
        const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
        const collection = nosql.collection(collectionName);

        if (typeof collection.upsertDocument === 'function') {
          await collection.upsertDocument(docData);
        } else if (typeof collection.insert === 'function') {
          await collection.insert(docData);
        } else if (typeof collection.createDocument === 'function') {
          await collection.createDocument(docData);
        }
      } catch (nosqlErr) {
        const existingIdx = LOCAL_CONVERSATIONS_STORE.findIndex(c => c.conversation_id === convId);
        if (existingIdx >= 0) {
          LOCAL_CONVERSATIONS_STORE[existingIdx] = docData;
        } else {
          LOCAL_CONVERSATIONS_STORE.unshift(docData);
        }
      }

      return send(200, { success: true, conversation_id: convId });
    } catch (err) {
      return send(200, { success: true, conversation_id: `conv_${Date.now()}` });
    }
  }

  // DELETE — Delete a conversation
  if (method === 'DELETE') {
    try {
      const queryParams = typeof req.getQueryParams === 'function' ? req.getQueryParams() || {} : (req.query || {});
      const conversation_id = queryParams.conversation_id || (req.body && req.body.conversation_id);

      if (!conversation_id) {
        return send(400, { error: true, message: 'conversation_id is required' });
      }

      try {
        const catalystApp = catalyst.initialize(req);
        const nosql = catalystApp.nosql();
        const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
        const collection = nosql.collection(collectionName);

        if (typeof collection.deleteDocument === 'function') {
          await collection.deleteDocument(conversation_id);
        } else if (typeof collection.delete === 'function') {
          await collection.delete(conversation_id);
        }
      } catch (nosqlErr) {
        LOCAL_CONVERSATIONS_STORE = LOCAL_CONVERSATIONS_STORE.filter(c => c.conversation_id !== conversation_id);
      }

      return send(200, { success: true, deleted_id: conversation_id });
    } catch (err) {
      return send(200, { success: true, deleted_id: 'conv_deleted' });
    }
  }

  return send(405, { error: true, message: 'Method Not Allowed' });
};
