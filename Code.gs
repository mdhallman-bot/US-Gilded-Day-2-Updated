/**
 * INDUSTRIAL TRANSFORMATION — SHORT LESSON ONLY
 * Start a NEW standalone Apps Script project at script.google.com.
 * Do not paste this code into the earlier lesson's project.
 *
 * 1. Paste this file into Code.gs in the NEW project and save.
 * 2. Run setupShortLesson; authorize it. This creates a NEW private spreadsheet.
 *    Its URL is printed in the execution log. ShortSaves and ShortErrors are
 *    separate from the original lesson. Re-running setup reuses this new sheet.
 * 3. Deploy > New deployment > Web app. Execute as yourself; access Anyone.
 * 4. The HTML is configured with your new /exec URL. No shared secret is needed.
 *    If updating an existing deployment, choose Manage deployments > Edit,
 *    select New version, and deploy to preserve the URL.
 * 6. Open the /exec URL. It must return ok:true, status:"ready", and
 *    lessonId:"u2-day2-industrial-short-v1".
 * 7. Upload index.html to the NEW repository. Test saving and resuming with
 *    a made-up username before assigning it.
 *
 * Browser POST body: JSON sent as text/plain;charset=utf-8, following redirects.
 * Every POST must include lessonId:"u2-day2-industrial-short-v1".
 * Pseudonymous usernames are not student authentication.
 * Do not collect real names or school IDs. Keep the response spreadsheet private.
 * The script never edits or clears earlier lesson data.
 */
const BACKEND = Object.freeze({
  lessonId: 'u2-day2-industrial-short-v1',
  savesTab: 'ShortSaves', errorsTab: 'ShortErrors', maxStateChars: 45000,
  headers: ['Timestamp', 'LessonId', 'StudentId', 'Revision', 'RequestId', 'InteractiveData'],
  errorHeaders: ['Timestamp', 'Action', 'Code']
});

function setupShortLesson() {
  const props = PropertiesService.getScriptProperties();
  // Prevent accidentally installing this code into the earlier lesson project.
  if (props.getProperty('SHEET_ID') || props.getProperty('SHARED_SECRET')) {
    fail_('USE_A_NEW_APPS_SCRIPT_PROJECT');
  }
  if (!props.getProperty('SHORT_SHEET_ID')) {
    const created = SpreadsheetApp.create('Industrial Transformation Short Lesson Responses');
    props.setProperty('SHORT_SHEET_ID', created.getId());
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = openSpreadsheet_();
    ensureTab_(ss, BACKEND.savesTab, BACKEND.headers);
    ensureTab_(ss, BACKEND.errorsTab, BACKEND.errorHeaders);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  console.log('Setup complete. New response spreadsheet: ' + openSpreadsheet_().getUrl());
}

function doGet() {
  // No student data is exposed by GET.
  try {
    const ss = openSpreadsheet_();
    if (!ss.getSheetByName(BACKEND.savesTab) || !ss.getSheetByName(BACKEND.errorsTab)) {
      fail_('NOT_CONFIGURED');
    }
    return json_({ok:true, status:'ready', lessonId:BACKEND.lessonId});
  } catch (err) { return errorResponse_(err); }
}

function doPost(e) {
  let action = '';
  try {
    const body = e && e.postData && e.postData.contents;
    if (!body || body.length > 100000) fail_('INVALID_REQUEST');
    let req;
    try { req = JSON.parse(body); } catch (_) { fail_('INVALID_JSON'); }
    if (!req || typeof req !== 'object' || Array.isArray(req)) fail_('INVALID_REQUEST');
    if (req.lessonId !== BACKEND.lessonId) fail_('WRONG_LESSON');
    action = req.action;
    if (action !== 'save_state' && action !== 'load_state') fail_('INVALID_ACTION');
    const studentId = String(req.studentId || '').trim().toUpperCase();
    if (!/^[A-Z]{2,12}[0-9]{2,12}$/.test(studentId)) fail_('INVALID_STUDENT_ID');
    let serialized;
    if (action === 'save_state') {
      if (!req.interactiveData || typeof req.interactiveData !== 'object' ||
          Array.isArray(req.interactiveData)) fail_('INVALID_STATE');
      serialized = JSON.stringify(req.interactiveData);
      if (serialized.length > BACKEND.maxStateChars) fail_('STATE_TOO_LARGE');
      if (!Number.isSafeInteger(req.baseRevision) || req.baseRevision < 0) fail_('INVALID_REVISION');
      if (typeof req.requestId !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(req.requestId)) {
        fail_('INVALID_REQUEST_ID');
      }
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) fail_('BUSY');
    try {
      const sheet = ensureTab_(openSpreadsheet_(), BACKEND.savesTab, BACKEND.headers);
      const rows = studentRows_(sheet, studentId);
      const latest = rows.length ? rows[rows.length - 1] : null;
      const revision = latest ? Number(latest[3]) : 0;
      if (action === 'load_state') {
        return json_({ok:true, found:!!latest, studentId:studentId,
          lessonId:BACKEND.lessonId, revision:revision,
          savedAt:latest ? new Date(latest[0]).toISOString() : null,
          interactiveData:latest ? JSON.parse(latest[5]) : null});
      }
      // A retried request must never append twice or roll back a later save.
      const previous = rows.find(row => row[4] === req.requestId);
      if (previous) {
        if (previous[5] !== serialized || Number(previous[3]) !== req.baseRevision + 1) {
          fail_('REQUEST_ID_REUSED');
        }
        return json_({ok:true, lessonId:BACKEND.lessonId, duplicate:true, revision:Number(previous[3]),
          latestRevision:revision, studentId:studentId,
          savedAt:new Date(previous[0]).toISOString()});
      }
      if (req.baseRevision !== revision) {
        return json_({ok:false, code:'REVISION_CONFLICT', latestRevision:revision,
          message:'Newer work exists. Keep local work and reload or reconcile before saving.'});
      }
      const timestamp = new Date();
      sheet.appendRow([timestamp, BACKEND.lessonId, studentId, revision + 1,
        req.requestId, serialized]);
      SpreadsheetApp.flush();
      return json_({ok:true, lessonId:BACKEND.lessonId, studentId:studentId, revision:revision + 1,
        savedAt:timestamp.toISOString()});
    } finally { lock.releaseLock(); }
  } catch (err) {
    logError_(action, err);
    return errorResponse_(err);
  }
}

function studentRows_(sheet, studentId) {
  if (sheet.getLastRow() < 2) return [];
  // Search the ID column rather than downloading every student's response.
  const matches = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1)
    .createTextFinder(studentId).matchEntireCell(true).matchCase(true).findAll();
  return matches.sort((a,b) => a.getRow() - b.getRow())
    .map(cell => sheet.getRange(cell.getRow(), 1, 1, 6).getValues()[0])
    .filter(row => row[1] === BACKEND.lessonId);
}

function openSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHORT_SHEET_ID');
  if (!id || !id.trim()) fail_('NOT_CONFIGURED');
  return SpreadsheetApp.openById(id.trim());
}

function ensureTab_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (existing.some((value, i) => value !== headers[i])) fail_('SHEET_HEADERS_MISMATCH');
  }
  return sheet;
}

function fail_(code) { const error = new Error(code); error.appCode = code; throw error; }
function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
function errorResponse_(err) {
  const code = err && err.appCode || 'SERVER_ERROR';
  return json_({ok:false, code:code, message:code === 'SERVER_ERROR'
    ? 'Saving service failed. Keep local work and retry; ask your teacher if this persists.' : code});
}
function logError_(action, err) {
  // Never log student responses, raw requests, or exception messages.
  const code = err && err.appCode || 'SERVER_ERROR';
  console.error(code);
  if (['INVALID_JSON','INVALID_REQUEST','INVALID_ACTION'].includes(code)) return;
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(1000)) return;
    ensureTab_(openSpreadsheet_(), BACKEND.errorsTab, BACKEND.errorHeaders)
      .appendRow([new Date(), ['save_state','load_state'].includes(action) ? action : '', code]);
    SpreadsheetApp.flush();
  } catch (_) { console.error('ERROR_LOG_UNAVAILABLE'); }
  finally { if (lock.hasLock()) lock.releaseLock(); }
}
