/**
 * stratus-upload — Catalyst AdvancedIO Function (Cap #8: Catalyst Stratus)
 *
 * POST { file_base64: string, filename: string, content_type: string, category: string }
 * → { success, url, object_id, category }
 *
 * Stores FIR documents, mugshots, and evidence files in Catalyst Stratus
 * (object/blob storage — S3-style).
 */

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') return send(405, { error: true, message: 'Method Not Allowed' });

  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let d = ''; req.on('data', c => { d += c; }); req.on('end', () => resolve(d)); req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch { return send(400, { error: true, message: 'Invalid JSON body' }); }
  }

  const { file_base64, filename, content_type = 'application/octet-stream', category = 'general' } = body;

  if (!file_base64 || !filename) {
    return send(400, { error: true, message: 'file_base64 and filename are required' });
  }

  try {
    const catalystApp = catalyst.initialize(req);
    const fileStore = catalystApp.fileStore();

    const fileBuffer = Buffer.from(file_base64, 'base64');
    const folderName = `drishti_${category}`; // e.g. drishti_mugshot, drishti_fir_doc, drishti_evidence

    // Get or create folder
    let folder;
    try {
      const folders = await fileStore.getFolderDetails();
      folder = folders.find(f => f.folder_name === folderName);
      if (!folder) {
        folder = await fileStore.createFolder(folderName);
      }
    } catch (folderErr) {
      console.warn('[stratus-upload] Could not get/create folder:', folderErr.message);
      folder = { folder_id: process.env.STRATUS_DEFAULT_FOLDER_ID || '1' };
    }

    const uploadedFile = await fileStore.uploadFile({
      code: folder.folder_id,
      name: filename,
      content: fileBuffer,
      contentType: content_type,
    });

    const object_id = uploadedFile?.file_id || uploadedFile?.id || filename;
    const url = uploadedFile?.file_url || uploadedFile?.download_url || '';

    return send(200, {
      success: true,
      object_id,
      url,
      category,
      filename,
      size_bytes: fileBuffer.length,
      source: 'catalyst_stratus',
    });
  } catch (err) {
    console.error('[stratus-upload] Error:', err.message);
    return send(500, { error: true, message: err.message });
  }
};
