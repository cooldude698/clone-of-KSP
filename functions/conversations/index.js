try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  const send = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  };

  const method = req.getMethod();

  // OPTIONS — CORS preflight → 204
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // GET — List all conversations
  if (method === 'GET') {
    try {
      const queryParams = req.getQueryParams() || {};
      const limit = parseInt(queryParams.limit || '20', 10) || 20;

      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
      const collection = nosql.collection(collectionName);

      // Robust fallback query mechanisms to support different platform/SDK versions
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
          preview = (lastMsg.content || '').substring(0, 80);
        }
        return {
          conversation_id: doc.document_id || doc.id || doc._id || '',
          last_updated: doc.last_updated || '',
          preview: preview,
          message_count: doc.messages ? doc.messages.length : 0
        };
      });

      return send(200, { conversations, total });
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return send(500, { error: true, message: err.message || 'Internal Server Error' });
    }
  }

  // DELETE — Delete a conversation
  if (method === 'DELETE') {
    try {
      const queryParams = req.getQueryParams() || {};
      const conversation_id = queryParams.conversation_id;

      if (!conversation_id) {
        return send(400, { error: true, message: 'conversation_id is required' });
      }

      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
      const collection = nosql.collection(collectionName);

      // Robust fallback delete mechanisms to support different platform/SDK versions
      if (typeof collection.deleteDocument === 'function') {
        await collection.deleteDocument(conversation_id);
      } else if (typeof collection.delete === 'function') {
        await collection.delete(conversation_id);
      } else if (typeof collection.removeDocument === 'function') {
        await collection.removeDocument(conversation_id);
      } else if (typeof collection.remove === 'function') {
        await collection.remove(conversation_id);
      } else {
        throw new Error('No delete method found on collection');
      }

      return send(200, { success: true, deleted_id: conversation_id });
    } catch (err) {
      console.error('Error deleting conversation:', err);
      return send(500, { error: true, message: err.message || 'Internal Server Error' });
    }
  }

  // All other methods → 405
  return send(405, { error: true, message: 'Method Not Allowed' });
};
