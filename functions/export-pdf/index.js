try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  const send = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  };

  const method = req.getMethod();

  // OPTIONS — CORS preflight → 204
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (method !== 'POST') {
    return send(405, { error: true, message: 'Method Not Allowed' });
  }

  let body;
  try {
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    body = JSON.parse(raw || '{}');
  } catch (e) {
    return send(400, { error: true, message: 'Invalid JSON body' });
  }

  const { conversation_id, title, officer_name, badge_number } = body;

  if (!conversation_id) {
    return send(400, { error: true, message: 'conversation_id is required' });
  }

  try {
    const catalystApp = catalyst.initialize(req);
    const nosql = catalystApp.nosql();
    const collectionName = process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations';
    const collection = nosql.collection(collectionName);
    
    const doc = await collection.getDocument(conversation_id);
    if (!doc || !doc.messages) {
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ error: true, message: 'Conversation not found' }));
      return;
    }

    // Helper to clean response content in case it contains raw JSON format
    const cleanDrishtiContent = (content) => {
      if (typeof content !== 'string') return String(content || '');
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const cleanedJsonStr = trimmed.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedJsonStr);
          if (parsed && parsed.response_text) {
            return parsed.response_text;
          }
        } catch (e) {}
      }
      return content;
    };

    // Build messages HTML list
    const messagesHtml = doc.messages.map(msg => {
      const isUser = msg.role === 'user' || msg.role === 'officer';
      const roleLabel = isUser ? 'OFFICER' : 'DRISHTI';
      const cssClass = isUser ? 'user' : 'assistant';
      const rawContent = msg.content || '';
      const cleanContent = isUser ? rawContent : cleanDrishtiContent(rawContent);

      return `
        <div class="message-block ${cssClass}">
          <div class="role-label">${roleLabel}</div>
          <div class="message-text">${cleanContent}</div>
        </div>
      `;
    }).join('\n');

    // Build the full HTML string with inline styling suitable for PDF conversion
    const reportTitle = title || 'DRISHTI Intelligence Report';
    const officer = officer_name || 'KSP Officer';
    const badge = badge_number || 'N/A';
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: Georgia, 'Times New Roman', Times, serif;
    color: #1e293b;
    line-height: 1.5;
    margin: 40px;
  }
  .header-bar {
    background-color: #0f172a;
    color: #ffffff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 30px;
  }
  .logo {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .title {
    font-size: 22px;
    margin-bottom: 12px;
    border-bottom: 1px solid #334155;
    padding-bottom: 5px;
    font-weight: normal;
  }
  .metadata {
    font-family: monospace;
    font-size: 11px;
    color: #cbd5e1;
    display: table;
    width: 100%;
  }
  .metadata-row {
    display: table-row;
  }
  .metadata-cell {
    display: table-cell;
    padding: 2px 10px 2px 0;
  }
  .message-block {
    margin-bottom: 20px;
    padding: 12px 15px;
    border-left: 4px solid #475569;
    background-color: #f8fafc;
    border-radius: 0 4px 4px 0;
  }
  .message-block.user {
    border-left-color: #1e3a8a;
    background-color: #f0fdf4;
  }
  .message-block.assistant {
    border-left-color: #0f172a;
    background-color: #f8fafc;
  }
  .role-label {
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .user .role-label {
    color: #1e3a8a;
  }
  .assistant .role-label {
    color: #0f172a;
  }
  .message-text {
    font-size: 14px;
    white-space: pre-wrap;
  }
  .footer {
    margin-top: 40px;
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    font-size: 10px;
    color: #64748b;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="header-bar">
    <div class="logo">🔵 KARNATAKA STATE POLICE</div>
    <div class="title">${reportTitle}</div>
    <div class="metadata">
      <div class="metadata-row">
        <div class="metadata-cell"><strong>OFFICER:</strong> ${officer}</div>
        <div class="metadata-cell"><strong>BADGE NO:</strong> ${badge}</div>
      </div>
      <div class="metadata-row">
        <div class="metadata-cell"><strong>GENERATED:</strong> ${dateStr}</div>
        <div class="metadata-cell"><strong>CONVERSATION ID:</strong> ${conversation_id}</div>
      </div>
    </div>
  </div>

  <div class="content">
    ${messagesHtml}
  </div>

  <div class="footer">
    CONFIDENTIAL — Generated by DRISHTI Intelligence System | Karnataka State Police
  </div>
</body>
</html>
    `.trim();

    let pdfBuffer;
    let useFallback = false;
    let fallbackNote = '';

    // Convert HTML to PDF using Catalyst SmartBrowz
    try {
      if (typeof catalystApp.smartbrowz === 'function') {
        const smartbrowz = catalystApp.smartbrowz();
        if (typeof smartbrowz.convertToPdf === 'function') {
          pdfBuffer = await smartbrowz.convertToPdf(htmlContent, {
            pdf_options: {
              display_header_footer: false,
              margin: { bottom: '20', left: '15', right: '15', top: '20' },
              landscape: false,
              format: 'A4'
            },
            output_options: {
              output_type: 'pdf'
            }
          });
        } else {
          useFallback = true;
          fallbackNote = 'SmartBrowz convertToPdf is not a function on the SDK instance.';
        }
      } else {
        useFallback = true;
        fallbackNote = 'SmartBrowz service is not available on the Catalyst app instance.';
      }
    } catch (sbErr) {
      console.warn('SmartBrowz generation failed, falling back to HTML:', sbErr.message);
      useFallback = true;
      fallbackNote = `SmartBrowz PDF conversion failed: ${sbErr.message}`;
    }

    if (useFallback) {
      const content_base64 = Buffer.from(htmlContent).toString('base64');
      const filename = `DRISHTI_Report_${Date.now()}.html`;
      return send(200, {
        success: true,
        filename,
        content_base64,
        content_type: 'text/html',
        note: fallbackNote
      });
    } else {
      const content_base64 = pdfBuffer.toString('base64');
      const filename = `DRISHTI_Report_${Date.now()}.pdf`;
      return send(200, {
        success: true,
        filename,
        content_base64,
        content_type: 'application/pdf'
      });
    }

  } catch (err) {
    console.error('Error generating report:', err);
    return send(500, { error: true, message: err.message || 'Internal Server Error' });
  }
};
