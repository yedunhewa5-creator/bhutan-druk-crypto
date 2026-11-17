/** Owner-only Google Apps Script backend. Deploy access as "Only myself". */
const TAB_KYC = 'KYC';
const TAB_SUPPORT = 'Support';
const TAB_AUDIT = 'Audit';
const TAB_ADS = 'P2P Ads';
const TAB_SECURITY = 'Security Events';
const TAB_ORDERS = 'Trade Requests';

function doGet(e) {
  if (e && e.parameter && e.parameter.view === 'support') {
    return HtmlService.createHtmlOutputFromFile('PublicSupport').setTitle('BHUTAN DRUK CRYPTO Support');
  }
  if (e && e.parameter && e.parameter.view === 'app') {
    return HtmlService.createHtmlOutputFromFile('Index').setTitle('BHUTAN DRUK CRYPTO');
  }
  requireOwner_();
  return HtmlService.createHtmlOutputFromFile('OwnerPanel').setTitle('BHUTAN DRUK CRYPTO Owner Console');
}

/** Run once from the Apps Script editor as the account that owns the panel. */
function setupBackend() {
  const owner = Session.getEffectiveUser().getEmail();
  const active = Session.getActiveUser().getEmail();
  if (!owner || !active || active.toLowerCase() !== owner.toLowerCase()) throw new Error('Run setupBackend from the Apps Script editor while signed in as the owner account.');
  const props = PropertiesService.getScriptProperties();
  const savedOwner = props.getProperty('OWNER_EMAIL');
  if (savedOwner && savedOwner.toLowerCase() !== owner.toLowerCase()) throw new Error('This backend is already assigned to a different owner account.');
  props.setProperty('OWNER_EMAIL', owner.toLowerCase());
  let id = props.getProperty('DATA_SHEET_ID');
  if (!id) {
    const book = SpreadsheetApp.create('Bhutan Druk Crypto Private Records');
    id = book.getId();
    props.setProperty('DATA_SHEET_ID', id);
  }
  const book = SpreadsheetApp.openById(id);
  ensureTab_(book, TAB_KYC, ['id', 'createdAt', 'name', 'email', 'status', 'reviewNote']);
  ensureSupportTab_(book);
  ensureTab_(book, TAB_AUDIT, ['createdAt', 'actor', 'action', 'recordId', 'details']);
  ensureTab_(book, TAB_ADS, ['id', 'createdAt', 'updatedAt', 'country', 'countryCode', 'fiat', 'side', 'price', 'availableUsdt', 'minimumFiat', 'maximumFiat', 'paymentMethods', 'verifiedBalanceUsdt', 'verificationReference', 'status']);
  ensureTab_(book, TAB_SECURITY, ['createdAt', 'event', 'actor', 'details']);
  ensureTab_(book, TAB_ORDERS, ['id', 'createdAt', 'adId', 'side', 'fiat', 'price', 'amountUsdt', 'amountFiat', 'name', 'email', 'whatsapp', 'status', 'provider', 'ownerNote']);
  ensureSecurityReportTrigger_();
  return { owner: owner, dataSheet: book.getUrl() };
}

function getPublicSupportUrl() {
  requireOwner_();
  return PropertiesService.getScriptProperties().getProperty('PUBLIC_SUPPORT_URL') || '';
}

function getPanelData() {
  requireOwner_();
  const book = dataBook_();
  return {
    owner: Session.getActiveUser().getEmail(),
    kyc: rowsAsObjects_(book.getSheetByName(TAB_KYC)),
    support: rowsAsObjects_(book.getSheetByName(TAB_SUPPORT)),
    ads: rowsAsObjects_(book.getSheetByName(TAB_ADS)),
    orders: rowsAsObjects_(ordersSheet_()),
    security: rowsAsObjects_(book.getSheetByName(TAB_SECURITY)).slice(-100).reverse(),
    lastSecurityReportAt: PropertiesService.getScriptProperties().getProperty('LAST_SECURITY_REPORT_AT') || ''
  };
}

function getBotTokenStatus() {
  requireOwner_();
  const props = PropertiesService.getScriptProperties();
  return { configured: Boolean(props.getProperty('BOT_TOKEN')), chatConfigured: Boolean(props.getProperty('BOT_CHAT_ID')) };
}

function saveBotSettings(token, chatId) {
  const owner = requireOwner_();
  const props = PropertiesService.getScriptProperties();
  const tokenValue = String(token || '').trim();
  const chatValue = String(chatId || '').trim();
  if (tokenValue && !/^\d{5,15}:[A-Za-z0-9_-]{20,}$/.test(tokenValue)) {
    securityEvent_('INVALID_BOT_TOKEN_INPUT', owner, 'Rejected Telegram token format; token value not recorded.');
    throw new Error('Enter the complete bot token from BotFather.');
  }
  if (chatValue && !/^-?\d{1,20}$/.test(chatValue)) throw new Error('Enter the numeric Telegram chat ID for the owner.');
  if (tokenValue) props.setProperty('BOT_TOKEN', tokenValue);
  if (chatValue) props.setProperty('BOT_CHAT_ID', chatValue);
  if (!props.getProperty('BOT_TOKEN')) throw new Error('Enter your bot token before saving settings.');
  if (!props.getProperty('BOT_CHAT_ID')) throw new Error('Enter the owner Telegram chat ID before saving settings.');
  audit_(owner, 'TELEGRAM_SETTINGS_UPDATED', 'telegram', 'Token and owner chat destination saved privately');
  return { configured: true, chatConfigured: true };
}

function saveBotToken(token) {
  requireOwner_();
  return saveBotSettings(token, PropertiesService.getScriptProperties().getProperty('BOT_CHAT_ID') || '');
}

function testBotNotification() {
  requireOwner_();
  if (!sendBotMessage_('Bhutan Druk Crypto: Telegram bot connection test succeeded.')) throw new Error('Telegram test failed. Check the bot token, numeric chat ID, and Apps Script external request permission.');
  audit_(Session.getActiveUser().getEmail(), 'TELEGRAM_TEST_SENT', 'telegram', 'Owner test message delivered');
  return { ok: true };
}

function clearBotToken() {
  const owner = requireOwner_();
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('BOT_TOKEN');
  props.deleteProperty('BOT_CHAT_ID');
  audit_(owner, 'TELEGRAM_SETTINGS_CLEARED', 'telegram', 'Bot token and chat ID removed');
  return { configured: false, chatConfigured: false };
}

function sendBotMessage_(message) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('BOT_CHAT_ID');
  if (!token || !chatId) return false;
  try {
    const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ chat_id: chatId, text: String(message || '').slice(0, 3500), disable_web_page_preview: true })
    });
    const result = JSON.parse(response.getContentText() || '{}');
    return response.getResponseCode() === 200 && result.ok === true;
  } catch (error) {
    console.error('Telegram notification failed; credentials were not logged.');
    return false;
  }
}

function notifyBot_(message) {
  const sent = sendBotMessage_(message);
  if (!sent) console.warn('Telegram message was not sent; bot settings may be missing or unavailable.');
  return sent;
}
function submitKycRequest(request) {
  const owner = requireOwner_();
  const name = clean_(request && request.name, 100);
  const email = clean_(request && request.email, 200);
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid name and email.');
  const id = Utilities.getUuid();
  const sheet = dataBook_().getSheetByName(TAB_KYC);
  sheet.appendRow([id, new Date(), sheetSafe_(name), sheetSafe_(email), 'Pending', '']);
  audit_(owner, 'KYC_SUBMITTED', id, 'Status set to Pending');
  try { notifyOwner_('New KYC review request', 'A KYC request is waiting for review.\nApplicant: ' + name + '\nCase: ' + id + '\nOpen your private owner panel to review it.'); } catch (error) { console.error('KYC owner email alert failed.'); }
  notifyBot_('BHUTAN DRUK CRYPTO: A KYC review record was created. Case: ' + id + '. Open the private owner panel.');
  return { id: id, status: 'Pending' };
}

function reviewKyc(id, status, note) {
  const owner = requireOwner_();
  if (!['Approved', 'Rejected', 'More information'].includes(status)) throw new Error('Invalid review status.');
  const sheet = dataBook_().getSheetByName(TAB_KYC);
  const row = findRow_(sheet, id);
  if (!row) throw new Error('KYC record not found.');
  sheet.getRange(row, 5, 1, 2).setValues([[status, sheetSafe_(clean_(note, 1000))]]);
  audit_(owner, 'KYC_' + status.toUpperCase().replace(/\s+/g, '_'), id, 'Review saved');
  const values = sheet.getRange(row, 1, 1, 6).getValues()[0];
  if (values[3]) MailApp.sendEmail(String(values[3]), 'Your verification status was updated', 'Your verification status is now: ' + status + '. Contact support if you need help.');
  return { id: id, status: status };
}

function submitSupportRequest(request) {
  request = request || {};
  if (clean_(request.website, 200)) { securityEvent_('SUPPORT_HONEYPOT', 'PUBLIC', 'Honeypot field was filled.'); throw new Error('Could not submit support request.'); }
  const name = clean_(request.name, 100);
  const email = clean_(request.email, 200);
  const whatsapp = clean_(request.whatsapp, 40);
  const subject = clean_(request.subject, 200);
  const message = clean_(request.message, 3000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !whatsapp || !/^\+?[0-9 ()-]{7,24}$/.test(whatsapp) || !subject || !message) { securityEvent_('SUPPORT_INVALID_INPUT', 'PUBLIC', 'Support request validation failed.'); throw new Error('Enter your name, valid email, WhatsApp number, subject, and complaint.'); }
  const cache = CacheService.getScriptCache();
  const throttleKey = 'support:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email.toLowerCase())).slice(0, 32);
  const id = Utilities.getUuid();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (cache.get(throttleKey)) { securityEvent_('SUPPORT_RATE_LIMIT', 'PUBLIC', 'Repeated support submission blocked.'); throw new Error('A request from this email was just submitted. Please wait a few minutes before trying again.'); }
    dataBook_().getSheetByName(TAB_SUPPORT).appendRow([id, new Date(), sheetSafe_(name), sheetSafe_(email), sheetSafe_(whatsapp), sheetSafe_(subject), sheetSafe_(message), 'Open']);
    audit_('PUBLIC_SUPPORT_FORM', 'SUPPORT_RECEIVED', id, 'Status set to Open');
    cache.put(throttleKey, '1', 180);
  } finally {
    lock.releaseLock();
  }
  let ownerNotified = true;
  try {
    notifyOwner_('New support request', subject + '\nFrom: ' + name + ' (' + email + ')\nWhatsApp: ' + whatsapp + '\nCase: ' + id + '\n\n' + message);
  } catch (error) {
    ownerNotified = false;
    console.error('Support ticket saved; owner email notification failed: ' + error.message);
  }
  notifyBot_('BHUTAN DRUK CRYPTO: New support request received. Reference: ' + id + '. Open the private owner panel to review it.');
  try {
    MailApp.sendEmail(email, 'We received your support request', 'Your support request was received. Reference: ' + id + '. Our support team will contact you using the details you provided.');
  } catch (error) {
    console.error('Support ticket saved; customer acknowledgement failed: ' + error.message);
  }
  return { id: id, status: 'Open', ownerNotified: ownerNotified };
}

function updateSupportStatus(id, status) {
  const owner = requireOwner_();
  if (!['Open', 'In progress', 'Resolved'].includes(status)) throw new Error('Invalid support status.');
  const sheet = dataBook_().getSheetByName(TAB_SUPPORT);
  const row = findRow_(sheet, id);
  if (!row) throw new Error('Support record not found.');
  sheet.getRange(row, 8).setValue(status);
  audit_(owner, 'SUPPORT_' + status.toUpperCase().replace(/\s+/g, '_'), id, 'Status saved');
  const customer = sheet.getRange(row, 1, 1, 8).getValues()[0];
  MailApp.sendEmail(String(customer[3]), 'Your support request was updated', 'Your support request status is now: ' + status + '. Reply to your support email if you need more help.');
  return { id: id, status: status };
}


/** Owner-managed P2P ad records. Balance verification is an owner attestation, not an automated ledger check. */
function saveP2PAd(input) {
  const owner = requireOwner_();
  input = input || {};
  const id = clean_(input.id, 80) || Utilities.getUuid();
  const country = clean_(input.country, 100);
  const countryCode = clean_(input.countryCode, 2).toUpperCase();
  const fiat = clean_(input.fiat, 3).toUpperCase();
  const side = clean_(input.side, 4).toUpperCase();
  const price = positiveNumber_(input.price, 'Price');
  const available = positiveNumber_(input.availableUsdt, 'Available USDT');
  const minimum = positiveNumber_(input.minimumFiat, 'Minimum order');
  const maximum = positiveNumber_(input.maximumFiat, 'Maximum order');
  const methods = clean_(input.paymentMethods, 300);
  const verified = positiveNumber_(input.verifiedBalanceUsdt, 'Owner-verified balance');
  const reference = clean_(input.verificationReference, 160);
  const status = clean_(input.status, 10);
  if (!country || !/^[A-Z]{2}$/.test(countryCode) || !/^[A-Z]{3}$/.test(fiat)) { securityEvent_('P2P_AD_VALIDATION_FAILED', owner, 'Country or currency code validation failed.'); throw new Error('Enter a country, ISO country code, and 3-letter fiat code.'); }
  if (!['BUY', 'SELL'].includes(side) || !['Draft', 'Active', 'Paused'].includes(status)) { securityEvent_('P2P_AD_VALIDATION_FAILED', owner, 'Side or status validation failed.'); throw new Error('Choose a valid ad side and status.'); }
  if (maximum < minimum || available > verified) { securityEvent_('P2P_AD_VALIDATION_FAILED', owner, 'Ad limits or verified balance validation failed.'); throw new Error('Order maximum must be at least its minimum, and ad quantity cannot exceed verified available balance.'); }
  if (status === 'Active' && (verified < 1000 || !reference)) { securityEvent_('P2P_AD_ACTIVATION_BLOCKED', owner, 'The minimum verified-balance rule or reference was not satisfied.'); throw new Error('To activate an ad, record at least 1,000 USDT owner-verified available balance and its verification reference.'); }
  if (!methods) { securityEvent_('P2P_AD_VALIDATION_FAILED', owner, 'Payment method was empty.'); throw new Error('Enter the payment methods actually supported for this ad.'); }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = dataBook_().getSheetByName(TAB_ADS);
    const row = findRow_(sheet, id);
    const created = row ? sheet.getRange(row, 2).getValue() : new Date();
    const record = [id, created, new Date(), sheetSafe_(country), countryCode, fiat, side, price, available, minimum, maximum, sheetSafe_(methods), verified, sheetSafe_(reference), status];
    if (row) sheet.getRange(row, 1, 1, record.length).setValues([record]);
    else sheet.appendRow(record);
    audit_(owner, row ? 'P2P_AD_UPDATED' : 'P2P_AD_CREATED', id, 'Status: ' + status + '; fiat: ' + fiat);
  } finally {
    lock.releaseLock();
  }
  return { id: id, status: status };
}

function deleteP2PAd(id) {
  const owner = requireOwner_();
  const sheet = dataBook_().getSheetByName(TAB_ADS);
  const row = findRow_(sheet, clean_(id, 80));
  if (!row) throw new Error('P2P ad not found.');
  sheet.deleteRow(row);
  audit_(owner, 'P2P_AD_DELETED', id, 'Owner deleted ad');
  return { id: id, deleted: true };
}

/** Public endpoint returns only active listing fields; never returns owner verification references. */
function getPublicP2PAds(fiat) {
  const code = clean_(fiat, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return [];
  const sheet = dataBook_().getSheetByName(TAB_ADS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return rowsAsObjects_(sheet).filter(ad => ad.status === 'Active' && ad.fiat === code).map(ad => ({
    id: ad.id, country: ad.country, countryCode: ad.countryCode, fiat: ad.fiat, side: ad.side,
    price: ad.price, availableUsdt: ad.availableUsdt, minimumFiat: ad.minimumFiat,
    maximumFiat: ad.maximumFiat, paymentMethods: ad.paymentMethods
  }));
}

/** Customer submits a genuine request against an owner-published ad. This is a broker inquiry, not payment or escrow execution. */
function submitTradeRequest(request) {
  request = request || {};
  if (clean_(request.website, 200)) { securityEvent_('TRADE_HONEYPOT', 'PUBLIC', 'Trade request honeypot was filled.'); throw new Error('Could not submit the request.'); }
  const adId = clean_(request.adId, 80);
  const name = clean_(request.name, 100);
  const email = clean_(request.email, 200).toLowerCase();
  const whatsapp = clean_(request.whatsapp, 40);
  const amountUsdt = positiveNumber_(request.amountUsdt, 'USDT amount');
  if (!adId || !name || !/^\S+@\S+\.\S+$/.test(email) || !/^\+?[0-9 ()-]{7,24}$/.test(whatsapp) || request.consent !== true) {
    securityEvent_('TRADE_REQUEST_INVALID', 'PUBLIC', 'Trade request validation failed.');
    throw new Error('Enter your contact details and accept that the team may contact you about this request.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let order;
  try {
    const ads = rowsAsObjects_(dataBook_().getSheetByName(TAB_ADS));
    const ad = ads.find(row => String(row.id) === adId && row.status === 'Active');
    if (!ad) throw new Error('This offer is no longer active. Refresh the market and choose another offer.');
    const amountFiat = amountUsdt * Number(ad.price);
    if (!Number.isFinite(amountFiat) || amountUsdt > Number(ad.availableUsdt) || amountFiat < Number(ad.minimumFiat) || amountFiat > Number(ad.maximumFiat)) {
      throw new Error('The requested amount is outside this offer’s current limits. Check the offer and try again.');
    }
    const id = Utilities.getUuid();
    order = { id: id, ad: ad, amountUsdt: amountUsdt, amountFiat: amountFiat, name: name, email: email, whatsapp: whatsapp };
    ordersSheet_().appendRow([
      id, new Date(), adId, ad.side, ad.fiat, Number(ad.price), amountUsdt, amountFiat,
      sheetSafe_(name), sheetSafe_(email), sheetSafe_(whatsapp), 'Request received', '', ''
    ]);
    audit_('PUBLIC_TRADE_REQUEST', 'TRADE_REQUEST_RECEIVED', id, 'Ad ' + adId + '; ' + amountUsdt + ' USDT');
  } finally {
    lock.releaseLock();
  }
  try { notifyOwner_('New P2P trade request', 'A customer requested a broker-assisted trade.\nRequest: ' + order.id + '\nAd: ' + order.ad.id + '\nSide: ' + order.ad.side + '\nAmount: ' + order.amountUsdt + ' USDT / ' + order.amountFiat + ' ' + order.ad.fiat + '\nCustomer: ' + order.name + ' (' + order.email + ')\nWhatsApp: ' + order.whatsapp + '\nAssign a provider and contact the customer from the private owner console.'); } catch (error) { console.error('Trade request saved; owner email notification failed.'); }
  notifyBot_('BHUTAN DRUK CRYPTO: New broker-assisted P2P request ' + order.id + '. Review it in the private owner panel.');
  try { MailApp.sendEmail(order.email, 'We received your P2P request', 'Your request ' + order.id + ' was received. The Bhutan Druk Crypto team will contact you to confirm provider availability and payment details. No payment or escrow has been initiated.'); } catch (error) { console.error('Trade request saved; customer acknowledgement failed.'); }
  return { id: order.id, status: 'Request received' };
}

function updateTradeRequest(id, status, provider, ownerNote) {
  const owner = requireOwner_();
  const allowed = ['Request received', 'Provider assigned', 'Customer contacted', 'Closed by owner', 'Cancelled', 'Rejected'];
  if (!allowed.includes(status)) throw new Error('Invalid trade request status.');
  provider = clean_(provider, 120);
  ownerNote = clean_(ownerNote, 800);
  if (status === 'Provider assigned' && !provider) throw new Error('Enter the real provider or team handling this request.');
  const sheet = ordersSheet_();
  const row = findRow_(sheet, clean_(id, 80));
  if (!row) throw new Error('Trade request not found.');
  sheet.getRange(row, 12, 1, 3).setValues([[status, sheetSafe_(provider), sheetSafe_(ownerNote)]]);
  const values = sheet.getRange(row, 1, 1, 14).getValues()[0];
  audit_(owner, 'TRADE_REQUEST_' + status.toUpperCase().replace(/\s+/g, '_'), id, 'Provider: ' + provider + '; note updated');
  MailApp.sendEmail(String(values[9]), 'P2P request status updated', 'Your P2P request ' + id + ' is now: ' + status + (provider ? '\nProvider/team: ' + provider : '') + (ownerNote ? '\nUpdate: ' + ownerNote : '') + '\n\nA status update does not confirm payment, escrow, or settlement. Follow only the payment instructions confirmed by our team.');
  return { id: id, status: status };
}
function positiveNumber_(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new Error(label + ' must be greater than zero.');
  return number;
}

/** Returns recent application security events to the authenticated owner panel. */
function getSecurityEvents() {
  requireOwner_();
  const sheet = dataBook_().getSheetByName(TAB_SECURITY);
  return { events: rowsAsObjects_(sheet).slice(-100).reverse(), lastReportAt: PropertiesService.getScriptProperties().getProperty('LAST_SECURITY_REPORT_AT') || '' };
}

function ensureSecurityReportTrigger_() {
  ScriptApp.getProjectTriggers().filter(trigger => trigger.getHandlerFunction() === 'securityHourlyReport_').forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('securityHourlyReport_').timeBased().everyHours(1).create();
}

/** Scheduled by Apps Script hourly. Reports application-level signals only. */
function securityHourlyReport_() {
  const props = PropertiesService.getScriptProperties();
  const owner = props.getProperty('OWNER_EMAIL');
  const sheetId = props.getProperty('DATA_SHEET_ID');
  if (!owner || !sheetId) return;
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(TAB_SECURITY);
  if (!sheet) return;
  const lastSent = props.getProperty('LAST_SECURITY_REPORT_AT');
  const cutoff = lastSent ? new Date(lastSent) : new Date(Date.now() - 60 * 60 * 1000);
  const events = rowsAsObjects_(sheet).filter(row => new Date(row.createdAt) > cutoff);
  const grouped = {};
  events.forEach(row => { grouped[row.event] = (grouped[row.event] || 0) + 1; });
  const summary = Object.keys(grouped).length ? Object.keys(grouped).sort().map(name => name + ': ' + grouped[name]).join('\n') : 'No application security events were recorded during this reporting period.';
  let emailSent = false;
  try {
    MailApp.sendEmail(owner, '[BHUTAN DRUK CRYPTO] Hourly security activity report',
      'Reporting period ending: ' + new Date().toISOString() + '\nEvents recorded: ' + events.length + '\n\n' + summary +
      '\n\nOpen the private owner panel and review Security events for details.\n\nScope: this report covers application-level events recorded by this Apps Script backend. It cannot detect all network attacks, hosting-provider incidents, or activity outside this application.');
    emailSent = true;
  } catch (error) {
    console.error('Hourly security email failed.');
  }
  const telegramSent = notifyBot_('[BHUTAN DRUK CRYPTO] Hourly security report: ' + events.length + ' application event(s). ' + summary);
  if (emailSent || telegramSent) props.setProperty('LAST_SECURITY_REPORT_AT', new Date().toISOString());
}

function securityEvent_(event, actor, details) {
  try {
    const safeEvent = clean_(event, 80);
    const safeActor = clean_(actor, 200) || 'UNAVAILABLE';
    const cache = CacheService.getScriptCache();
    const key = 'sec-event:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, safeEvent + ':' + safeActor.toLowerCase())).slice(0, 40);
    if (cache.get(key)) return;
    const id = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_ID');
    if (!id) { console.warn('Security event before backend setup: ' + safeEvent); return; }
    const sheet = SpreadsheetApp.openById(id).getSheetByName(TAB_SECURITY);
    if (!sheet) return;
    sheet.appendRow([new Date(), safeEvent, sheetSafe_(safeActor), sheetSafe_(clean_(details, 500))]);
    cache.put(key, '1', 60);
    if (safeEvent === 'OWNER_ACCESS_DENIED') notifyBot_('[BHUTAN DRUK CRYPTO] Owner-only access denial was recorded. Review Security events in the private panel.');
  } catch (error) {
    console.error('Security event logging failed: ' + error.message);
  }
}
function ensureSupportTab_(book) {
  let sheet = book.getSheetByName(TAB_SUPPORT);
  if (!sheet) sheet = book.insertSheet(TAB_SUPPORT);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'createdAt', 'name', 'email', 'whatsapp', 'subject', 'message', 'status']);
  } else {
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (headers[4] !== 'whatsapp') {
      sheet.insertColumnBefore(5);
      sheet.getRange(1, 5).setValue('whatsapp');
    }
  }
  sheet.setFrozenRows(1);
}

function ensureTab_(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}
function rowsAsObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const keys = values.shift();
  return values.filter(row => row[0]).map(row => Object.fromEntries(keys.map((key, i) => [key, row[i] instanceof Date ? row[i].toISOString() : row[i]])));
}
function findRow_(sheet, id) {
  const found = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return found ? found.getRow() : 0;
}
function ordersSheet_() {
  const book = dataBook_();
  let sheet = book.getSheetByName(TAB_ORDERS);
  if (!sheet) {
    sheet = book.insertSheet(TAB_ORDERS);
    sheet.appendRow(['id', 'createdAt', 'adId', 'side', 'fiat', 'price', 'amountUsdt', 'amountFiat', 'name', 'email', 'whatsapp', 'status', 'provider', 'ownerNote']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function dataBook_() {
  const id = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_ID');
  if (!id) throw new Error('Run setupBackend first.');
  return SpreadsheetApp.openById(id);
}
function requireOwner_() {
  const expected = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  const active = Session.getActiveUser().getEmail();
  if (!expected || !active || active.toLowerCase() !== expected.toLowerCase()) { securityEvent_('OWNER_ACCESS_DENIED', active || 'UNAVAILABLE', 'Owner-only access check failed.'); throw new Error('Owner-only access. Sign in with the Google account that owns this panel.'); }
  return active;
}
function audit_(actor, action, id, details) {
  dataBook_().getSheetByName(TAB_AUDIT).appendRow([new Date(), sheetSafe_(actor), sheetSafe_(action), sheetSafe_(id), sheetSafe_(details)]);
}
function notifyOwner_(subject, body) {
  const props = PropertiesService.getScriptProperties();
  const owner = props.getProperty('OWNER_EMAIL');
  const panelUrl = props.getProperty('OWNER_PANEL_URL');
  const linkText = panelUrl ? '\n\nOpen your owner-only panel: ' + panelUrl : '\n\nSign in to your owner-only panel to review this case.';
  MailApp.sendEmail(owner, '[BHUTAN DRUK CRYPTO] ' + subject, body + linkText);
}
function clean_(value, max) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, ' ').trim().slice(0, max);
}




function sheetSafe_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}