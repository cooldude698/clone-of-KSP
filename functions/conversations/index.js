try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

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

  const method = req.getMethod();

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
      const queryParams = req.getQueryParams() || {};
      const limit = parseInt(queryParams.limit || '50', 10) || 50;

      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
      const collection = nosql.collection(collectionName);

      let docs = [];
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
      } else {
        docs = [];
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
      console.error('Error fetching conversations:', err);
      return send(500, { error: true, message: err.message || 'Internal Server Error' });
    }
  }

  // POST — Create or Update a conversation
  if (method === 'POST') {
    try {
      let body = req.body;
      if (!body || Object.keys(body).length === 0) {
        const raw = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });
        body = JSON.parse(raw || '{}');
      }

      const { conversation_id, messages, subject } = body;
      const convId = conversation_id || `conv_${Date.now()}`;

      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
      const collection = nosql.collection(collectionName);

      const docData = {
        document_id: convId,
        conversation_id: convId,
        subject: subject || '',
        messages: messages || [],
        last_updated: new Date().toISOString()
      };

      if (typeof collection.upsertDocument === 'function') {
        await collection.upsertDocument(docData);
      } else if (typeof collection.insert === 'function') {
        await collection.insert(docData);
      } else if (typeof collection.createDocument === 'function') {
        await collection.createDocument(docData);
      }

      return send(200, { success: true, conversation_id: convId });
    } catch (err) {
      console.error('Error saving conversation:', err);
      return send(500, { error: true, message: err.message || 'Internal Server Error' });
    }
  }

  // DELETE — Delete a conversation
  if (method === 'DELETE') {
    try {
      const queryParams = req.getQueryParams() || {};
      const conversation_id = queryParams.conversation_id || (req.body && req.body.conversation_id);

      if (!conversation_id) {
        return send(400, { error: true, message: 'conversation_id is required' });
      }

      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
      const collection = nosql.collection(collectionName);

      if (typeof collection.deleteDocument === 'function') {
        await collection.deleteDocument(conversation_id);
      } else if (typeof collection.delete === 'function') {
        await collection.delete(conversation_id);
      } else if (typeof collection.removeDocument === 'function') {
        await collection.removeDocument(conversation_id);
      } else if (typeof collection.remove === 'function') {
        await collection.remove(conversation_id);
      }

      return send(200, { success: true, deleted_id: conversation_id });
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return send(500, { error: true, message: err.message || 'Internal Server Error' });
    }
  }

  return send(405, { error: true, message: 'Method Not Allowed' });
};
