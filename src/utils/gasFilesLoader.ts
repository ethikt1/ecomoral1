/**
 * Provides raw source strings for GAS files
 */

export const CODE_GS = `/**
 * EcoMoral Lab - Google Apps Script Server Side Logic
 * App Name: EcoMoral Lab (환경 도덕성 학습 및 진단 랩)
 * Target: Middle & High School Students
 */

function doGet(e) {
  try {
    var action = e && e.parameter ? e.parameter.action : null;
    if (action === 'health') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'EcoMoral API is healthy and connected!' }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'getTeacherDashboard') {
      var source = e.parameter.source || 'ACTUAL';
      var res = getTeacherDashboard(source);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    try {
      var template = HtmlService.createTemplateFromFile('Index');
      return template.evaluate()
        .setTitle('EcoMoral Lab - 반응형 환경 도덕성 학습 랩')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (templateErr) {
      var htmlContent = '<html><head><meta charset="UTF-8"><title>EcoMoral API Status</title></head>' +
        '<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 40px 20px; background: #FDFCF8; color: #2C3E2D;">' +
        '<div style="max-width: 540px; margin: 0 auto; padding: 32px; background: white; border: 1px solid #D1DBCF; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">' +
        '<h2 style="margin-top:0; color: #2C3E2D; text-align: center;">🌿 EcoMoral Lab 구글 시트 DB API</h2>' +
        '<div style="background: #E8F0E6; color: #2C3E2D; padding: 12px 16px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 20px;">' +
        '✅ Google Apps Script API가 정상 작동 중입니다!' +
        '</div>' +
        '<p style="font-size: 14px; line-height: 1.6; color: #344E41;">' +
        '이 배포 URL은 백엔드 데이터베이스 연동 API 주소입니다. 이 주소를 복사하여 <strong>EcoMoral 웹 애플리케이션의 [구글 시트 연동 설정]</strong>에 붙여넣어 주세요.' +
        '</p>' +
        '<hr style="border: none; border-top: 1px solid #E0E7DE; margin: 20px 0;" />' +
        '<h4 style="margin: 0 0 10px 0; color: #2C3E2D;">📌 사용 방법:</h4>' +
        '<ol style="font-size: 13px; line-height: 1.8; color: #344E41; padding-left: 20px;">' +
        '<li>브라우저 주소창의 <strong>배포 URL</strong>(<code>https://script.google.com/macros/s/.../exec</code>)을 전체 복사합니다.</li>' +
        '<li>학생 및 교사가 접속할 <strong>EcoMoral 웹 애플리케이션</strong>으로 돌아갑니다.</li>' +
        '<li>상단 메뉴 중 <strong>[구글 시트 연동 상태]</strong> 클릭 ➔ URL 입력창에 붙여넣고 <strong>[저장하기]</strong>를 클릭하세요.</li>' +
        '</ol>' +
        '</div>' +
        '</body></html>';
      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle('EcoMoral Lab API Status')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var action = '';
    var payload = {};

    if (e && e.parameter && e.parameter.action) {
      action = e.parameter.action;
      if (e.parameter.payload) {
        try {
          payload = JSON.parse(e.parameter.payload);
        } catch (parseErr) {
          payload = e.parameter.payload;
        }
      }
    } else if (e && e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        action = body.action || '';
        payload = body.payload || {};
      } catch (jsonErr) {
        action = e.parameter ? e.parameter.action : '';
      }
    }

    var result = { success: false, message: 'Unknown action: ' + action };

    if (action === 'health') {
      result = { success: true, message: 'API connection healthy' };
    } else if (action === 'savePreAssessment') {
      result = savePreAssessment(payload);
    } else if (action === 'saveLearningActivity') {
      result = saveLearningActivity(payload);
    } else if (action === 'savePostAssessment') {
      result = savePostAssessment(payload);
    } else if (action === 'getStudentProgress') {
      result = getStudentProgress(payload.studentCode, payload.scenarioId);
    } else if (action === 'getTeacherDashboard') {
      result = getTeacherDashboard(payload.source, payload.filters);
    } else if (action === 'setupDatabase') {
      result = setupDatabase();
    } else if (action === 'generateSyntheticData') {
      result = generateSyntheticData(payload.count, payload.mode);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'POST processing error: ' + err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getScriptProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function sanitizeInput_(input) {
  if (typeof input !== 'string') return input;
  var str = input.trim();
  if (/^[=+\\-@\\t\\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function hashString_(str) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    txtHash += byteHex;
  }
  return txtHash;
}

function verifyTeacherPassword(password) {
  try {
    if (!password) return { success: false, message: '비밀번호를 입력해주세요.' };
    var storedHash = getScriptProp_('TEACHER_PASSWORD_HASH');
    var inputHash = hashString_(password);
    if (!storedHash) {
      var defaultHash = hashString_('ecomoral123!');
      if (inputHash === defaultHash) return { success: true, isDefault: true };
    } else if (inputHash === storedHash) {
      return { success: true };
    }
    return { success: false, message: '교사 비밀번호가 일치하지 않습니다.' };
  } catch (err) {
    return { success: false, message: '비밀번호 인증 오류: ' + err.message };
  }
}

function setTeacherPassword(currentPassword, newPassword) {
  var verify = verifyTeacherPassword(currentPassword);
  if (!verify.success) return verify;
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: '새 비밀번호는 6자리 이상이어야 합니다.' };
  }
  var newHash = hashString_(newPassword);
  PropertiesService.getScriptProperties().setProperty('TEACHER_PASSWORD_HASH', newHash);
  return { success: true, message: '교사 비밀번호가 성공적으로 변경되었습니다.' };
}

function getSpreadsheet_(type) {
  var propKey = (type === 'SYNTHETIC') ? 'SYNTHETIC_SPREADSHEET_ID' : 'ACTUAL_SPREADSHEET_ID';
  var ssId = getScriptProp_(propKey);
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // Fall through to active spreadsheet if ID fails
    }
  }
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs) return activeSs;
  } catch (e) {}
  throw new Error('스프레드시트를 열 수 없습니다. [확장 프로그램] -> [Apps Script]로 접속한 시트인지 확인하세요.');
}

/**
 * 🚀 구글 시트 원클릭 자동 생성 및 초기화 함수
 * Apps Script 상단 드롭다운 메뉴에서 'setupDatabase'를 선택하고 [▶ 실행] 버튼을 클릭하세요.
 */
function setupDatabase() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var ssId = getScriptProp_('ACTUAL_SPREADSHEET_ID');
      if (ssId) {
        ss = SpreadsheetApp.openById(ssId);
      } else {
        throw new Error('구글 시트의 [확장 프로그램] -> [Apps Script]에서 실행해주시거나 Script Properties를 설정해주세요.');
      }
    }
    setupActualSheets_(ss);
    setupSyntheticSheet_(ss);
    Logger.log('✅ 모든 DB 시트 초기화 성공!');
    return { success: true, message: '모든 DB 시트(students, pre_assessment, learning_activity, post_assessment, combined_export, synthetic_data)가 정상 생성되었습니다!' };
  } catch (err) {
    Logger.log('❌ 초기화 실패: ' + err.message);
    throw err;
  }
}

function initializeDatabases() {
  return setupDatabase();
}

function setupActualSheets_(ss) {
  var sheetsDef = {
    'students': ['submission_id', 'student_code', 'scenario_id', 'started_at', 'completed_at', 'consent_checked', 'status', 'attempt_number'],
    'pre_assessment': ['submission_id', 'student_code', 'sensitivity_pre', 'judgment_pre', 'motivation_pre', 'action_pre', 'pre_answers_json', 'submitted_at'],
    'learning_activity': ['submission_id', 'recommended_activity', 'selected_activity', 'reflection_answer_1', 'reflection_answer_2', 'if_plan', 'then_plan', 'submitted_at'],
    'post_assessment': ['submission_id', 'student_code', 'sensitivity_post', 'judgment_post', 'motivation_post', 'action_post', 'post_answers_json', 'submitted_at'],
    'combined_export': [
      'submission_id', 'student_code', 'scenario_id',
      'sensitivity_pre', 'judgment_pre', 'motivation_pre', 'action_pre',
      'recommended_activity', 'selected_activity', 'reflection_answer_1', 'reflection_answer_2', 'if_plan', 'then_plan',
      'sensitivity_post', 'judgment_post', 'motivation_post', 'action_post',
      'sensitivity_gain', 'judgment_gain', 'motivation_gain', 'action_gain',
      'started_at', 'completed_at', 'attempt_number', 'data_source'
    ]
  };
  for (var sheetName in sheetsDef) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(sheetsDef[sheetName]);
      sheet.getRange(1, 1, 1, sheetsDef[sheetName].length).setFontWeight('bold').setBackground('#E8F5E9');
    }
  }
}

function setupSyntheticSheet_(ss) {
  var sheetName = 'synthetic_data';
  var headers = [
    'submission_id', 'student_code', 'scenario_id',
    'sensitivity_pre', 'judgment_pre', 'motivation_pre', 'action_pre',
    'recommended_activity', 'selected_activity', 'reflection_answer_1', 'reflection_answer_2', 'if_plan', 'then_plan',
    'sensitivity_post', 'judgment_post', 'motivation_post', 'action_post',
    'sensitivity_gain', 'judgment_gain', 'motivation_gain', 'action_gain',
    'started_at', 'completed_at', 'attempt_number', 'data_source'
  ];
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#EDE7F6');
  }
}

function calculateScores_(answers) {
  var getAvg = function(qIds) {
    var sum = 0, count = 0;
    for (var i = 0; i < qIds.length; i++) {
      var val = Number(answers[qIds[i]] || 0);
      if (val > 0) { sum += val; count++; }
    }
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  };
  return {
    sensitivity: getAvg([1, 2, 3]),
    judgment: getAvg([4, 5, 6]),
    motivation: getAvg([7, 8, 9]),
    action: getAvg([10, 11, 12])
  };
}

function getRecommendedActivity_(scores) {
  var keys = ['sensitivity', 'judgment', 'motivation', 'action'];
  var lowestKey = keys[0];
  var lowestScore = scores[lowestKey];
  for (var i = 1; i < keys.length; i++) {
    if (scores[keys[i]] < lowestScore) {
      lowestScore = scores[keys[i]];
      lowestKey = keys[i];
    }
  }
  return lowestKey;
}

function getStudentProgress(studentCode, scenarioId) {
  try {
    var cleanCode = sanitizeInput_(studentCode).toUpperCase();
    if (!cleanCode || cleanCode.length < 4 || cleanCode.length > 12) {
      return { success: false, message: '올바른 4~12자리 익명 학습코드를 입력해주세요.' };
    }
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var ss = getSpreadsheet_('ACTUAL');
    setupActualSheets_(ss);
    var studentsSheet = ss.getSheetByName('students');
    var data = studentsSheet.getDataRange().getValues();
    var existingRecord = null;
    var maxAttempt = 0;
    for (var i = 1; i < data.length; i++) {
      var rowCode = String(data[i][1]).toUpperCase();
      var rowScenario = String(data[i][2]);
      if (rowCode === cleanCode && rowScenario === scenarioId) {
        var rowAttempt = Number(data[i][7] || 1);
        if (rowAttempt > maxAttempt) maxAttempt = rowAttempt;
        if (data[i][6] === 'IN_PROGRESS') {
          existingRecord = {
            submission_id: data[i][0],
            student_code: data[i][1],
            scenario_id: data[i][2],
            started_at: data[i][3],
            status: data[i][6],
            attempt_number: rowAttempt
          };
        }
      }
    }
    lock.releaseLock();
    if (existingRecord) {
      return { success: true, isNew: false, student: existingRecord };
    } else {
      var newSubId = 'SUB_' + cleanCode + '_' + Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMddHHmmss');
      var newAttempt = maxAttempt + 1;
      return {
        success: true,
        isNew: true,
        student: {
          submission_id: newSubId,
          student_code: cleanCode,
          scenario_id: scenarioId,
          started_at: Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss'),
          status: 'IN_PROGRESS',
          attempt_number: newAttempt
        }
      };
    }
  } catch (err) {
    return { success: false, message: '진도 조회 실패: ' + err.message };
  }
}

function savePreAssessment(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var subId = sanitizeInput_(payload.submission_id);
    var code = sanitizeInput_(payload.student_code).toUpperCase();
    var scenarioId = sanitizeInput_(payload.scenario_id);
    var answers = payload.answers || {};
    var attempt = Number(payload.attempt_number || 1);
    var scores = calculateScores_(answers);
    var recommended = getRecommendedActivity_(scores);
    var nowStr = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');
    var ss = getSpreadsheet_('ACTUAL');
    setupActualSheets_(ss);

    var stSheet = ss.getSheetByName('students');
    var stData = stSheet.getDataRange().getValues();
    var stFoundIndex = -1;
    for (var i = 1; i < stData.length; i++) {
      if (stData[i][0] === subId) { stFoundIndex = i + 1; break; }
    }
    if (stFoundIndex > 0) {
      stSheet.getRange(stFoundIndex, 7).setValue('IN_PROGRESS');
    } else {
      stSheet.appendRow([subId, code, scenarioId, nowStr, '', true, 'IN_PROGRESS', attempt]);
    }

    var preSheet = ss.getSheetByName('pre_assessment');
    var preData = preSheet.getDataRange().getValues();
    var preFoundIndex = -1;
    for (var j = 1; j < preData.length; j++) {
      if (preData[j][0] === subId) { preFoundIndex = j + 1; break; }
    }
    var preRow = [subId, code, scores.sensitivity, scores.judgment, scores.motivation, scores.action, JSON.stringify(answers), nowStr];
    if (preFoundIndex > 0) {
      preSheet.getRange(preFoundIndex, 1, 1, preRow.length).setValues([preRow]);
    } else {
      preSheet.appendRow(preRow);
    }

    var combSheet = ss.getSheetByName('combined_export');
    var combData = combSheet.getDataRange().getValues();
    var combFoundIndex = -1;
    for (var k = 1; k < combData.length; k++) {
      if (combData[k][0] === subId) { combFoundIndex = k + 1; break; }
    }
    if (combFoundIndex < 0) {
      var newCombRow = [
        subId, code, scenarioId,
        scores.sensitivity, scores.judgment, scores.motivation, scores.action,
        recommended, '', '', '', '', '',
        '', '', '', '',
        '', '', '', '',
        nowStr, '', attempt, 'ACTUAL'
      ];
      combSheet.appendRow(newCombRow);
    } else {
      combSheet.getRange(combFoundIndex, 4, 1, 4).setValues([[scores.sensitivity, scores.judgment, scores.motivation, scores.action]]);
      combSheet.getRange(combFoundIndex, 8).setValue(recommended);
    }

    lock.releaseLock();
    return { success: true, scores: scores, recommendedActivity: recommended };
  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    return { success: false, message: '사전 설문 저장 오류: ' + err.message };
  }
}

function saveLearningActivity(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var subId = sanitizeInput_(payload.submission_id);
    var recommended = sanitizeInput_(payload.recommended_activity);
    var selected = sanitizeInput_(payload.selected_activity);
    var q1 = sanitizeInput_(payload.reflection_answer_1);
    var q2 = sanitizeInput_(payload.reflection_answer_2);
    var ifPlan = sanitizeInput_(payload.if_plan);
    var thenPlan = sanitizeInput_(payload.then_plan);
    var nowStr = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');
    var ss = getSpreadsheet_('ACTUAL');
    setupActualSheets_(ss);

    var actSheet = ss.getSheetByName('learning_activity');
    var actData = actSheet.getDataRange().getValues();
    var foundIndex = -1;
    for (var i = 1; i < actData.length; i++) {
      if (actData[i][0] === subId) { foundIndex = i + 1; break; }
    }
    var row = [subId, recommended, selected, q1, q2, ifPlan, thenPlan, nowStr];
    if (foundIndex > 0) {
      actSheet.getRange(foundIndex, 1, 1, row.length).setValues([row]);
    } else {
      actSheet.appendRow(row);
    }

    var combSheet = ss.getSheetByName('combined_export');
    var combData = combSheet.getDataRange().getValues();
    for (var k = 1; k < combData.length; k++) {
      if (combData[k][0] === subId) {
        combSheet.getRange(k + 1, 8, 1, 6).setValues([[recommended, selected, q1, q2, ifPlan, thenPlan]]);
        break;
      }
    }

    lock.releaseLock();
    return { success: true };
  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    return { success: false, message: '학습 활동 저장 오류: ' + err.message };
  }
}

function savePostAssessment(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var subId = sanitizeInput_(payload.submission_id);
    var code = sanitizeInput_(payload.student_code).toUpperCase();
    var answers = payload.answers || {};
    var postScores = calculateScores_(answers);
    var nowStr = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');
    var ss = getSpreadsheet_('ACTUAL');
    setupActualSheets_(ss);

    var postSheet = ss.getSheetByName('post_assessment');
    var postData = postSheet.getDataRange().getValues();
    var postFound = -1;
    for (var i = 1; i < postData.length; i++) {
      if (postData[i][0] === subId) { postFound = i + 1; break; }
    }
    var postRow = [subId, code, postScores.sensitivity, postScores.judgment, postScores.motivation, postScores.action, JSON.stringify(answers), nowStr];
    if (postFound > 0) {
      postSheet.getRange(postFound, 1, 1, postRow.length).setValues([postRow]);
    } else {
      postSheet.appendRow(postRow);
    }

    var stSheet = ss.getSheetByName('students');
    var stData = stSheet.getDataRange().getValues();
    for (var j = 1; j < stData.length; j++) {
      if (stData[j][0] === subId) {
        stSheet.getRange(j + 1, 5).setValue(nowStr);
        stSheet.getRange(j + 1, 7).setValue('COMPLETED');
        break;
      }
    }

    var combSheet = ss.getSheetByName('combined_export');
    var combData = combSheet.getDataRange().getValues();
    var preScores = { sensitivity: 0, judgment: 0, motivation: 0, action: 0 };
    for (var k = 1; k < combData.length; k++) {
      if (combData[k][0] === subId) {
        preScores.sensitivity = Number(combData[k][3] || 0);
        preScores.judgment = Number(combData[k][4] || 0);
        preScores.motivation = Number(combData[k][5] || 0);
        preScores.action = Number(combData[k][6] || 0);

        var gains = {
          sensitivity: Math.round((postScores.sensitivity - preScores.sensitivity) * 10) / 10,
          judgment: Math.round((postScores.judgment - preScores.judgment) * 10) / 10,
          motivation: Math.round((postScores.motivation - preScores.motivation) * 10) / 10,
          action: Math.round((postScores.action - preScores.action) * 10) / 10
        };

        combSheet.getRange(k + 1, 14, 1, 8).setValues([[
          postScores.sensitivity, postScores.judgment, postScores.motivation, postScores.action,
          gains.sensitivity, gains.judgment, gains.motivation, gains.action
        ]]);
        combSheet.getRange(k + 1, 23).setValue(nowStr);
        combSheet.getRange(k + 1, 25).setValue('ACTUAL');
        break;
      }
    }

    lock.releaseLock();
    return { success: true, postScores: postScores, preScores: preScores };
  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    return { success: false, message: '사후 설문 저장 오류: ' + err.message };
  }
}

function getTeacherDashboard(source, filters) {
  try {
    var ss = getSpreadsheet_(source || 'ACTUAL');
    var sheetName = (source === 'SYNTHETIC') ? 'synthetic_data' : 'combined_export';
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: true, data: { dataSource: source, totalSubmissions: 0, completedCount: 0, completionRate: 0, preAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, postAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, averageGains: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, recommendedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, selectedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, matchRate: 0, records: [] } };

    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return { success: true, data: { dataSource: source, totalSubmissions: 0, completedCount: 0, completionRate: 0, preAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, postAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, averageGains: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, recommendedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, selectedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }, matchRate: 0, records: [] } };

    var records = [];
    var preSum = { sensitivity: 0, judgment: 0, motivation: 0, action: 0 };
    var postSum = { sensitivity: 0, judgment: 0, motivation: 0, action: 0 };
    var recDist = { sensitivity: 0, judgment: 0, motivation: 0, action: 0 };
    var selDist = { sensitivity: 0, judgment: 0, motivation: 0, action: 0 };
    var completedCount = 0;
    var matchCount = 0;

    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0]) continue;
      var rec = {
        submission_id: String(row[0]),
        student_code: String(row[1]),
        scenario_id: String(row[2]),
        sensitivity_pre: Number(row[3] || 0),
        judgment_pre: Number(row[4] || 0),
        motivation_pre: Number(row[5] || 0),
        action_pre: Number(row[6] || 0),
        recommended_activity: String(row[7] || ''),
        selected_activity: String(row[8] || ''),
        reflection_answer_1: String(row[9] || ''),
        reflection_answer_2: String(row[10] || ''),
        if_plan: String(row[11] || ''),
        then_plan: String(row[12] || ''),
        sensitivity_post: Number(row[13] || 0),
        judgment_post: Number(row[14] || 0),
        motivation_post: Number(row[15] || 0),
        action_post: Number(row[16] || 0),
        sensitivity_gain: Number(row[17] || 0),
        judgment_gain: Number(row[18] || 0),
        motivation_gain: Number(row[19] || 0),
        action_gain: Number(row[20] || 0),
        started_at: String(row[21] || ''),
        completed_at: String(row[22] || ''),
        attempt_number: Number(row[23] || 1),
        data_source: source
      };
      if (filters) {
        if (filters.scenarioId && rec.scenario_id !== filters.scenarioId) continue;
        if (filters.completedOnly && !rec.completed_at) continue;
        if (filters.searchQuery) {
          var q = filters.searchQuery.toLowerCase();
          if (!rec.student_code.toLowerCase().includes(q) && !rec.submission_id.toLowerCase().includes(q)) continue;
        }
      }
      records.push(rec);
      preSum.sensitivity += rec.sensitivity_pre;
      preSum.judgment += rec.judgment_pre;
      preSum.motivation += rec.motivation_pre;
      preSum.action += rec.action_pre;

      if (rec.completed_at) {
        completedCount++;
        postSum.sensitivity += rec.sensitivity_post;
        postSum.judgment += rec.judgment_post;
        postSum.motivation += rec.motivation_post;
        postSum.action += rec.action_post;
      }
      if (rec.recommended_activity && recDist[rec.recommended_activity] !== undefined) recDist[rec.recommended_activity]++;
      if (rec.selected_activity && selDist[rec.selected_activity] !== undefined) selDist[rec.selected_activity]++;
      if (rec.recommended_activity && rec.recommended_activity === rec.selected_activity) matchCount++;
    }

    var total = records.length;
    var calcAvg = function(sum, count) { return count > 0 ? Math.round((sum / count) * 10) / 10 : 0; };
    var preAvg = { sensitivity: calcAvg(preSum.sensitivity, total), judgment: calcAvg(preSum.judgment, total), motivation: calcAvg(preSum.motivation, total), action: calcAvg(preSum.action, total) };
    var postAvg = { sensitivity: calcAvg(postSum.sensitivity, completedCount), judgment: calcAvg(postSum.judgment, completedCount), motivation: calcAvg(postSum.motivation, completedCount), action: calcAvg(postSum.action, completedCount) };
    var gainAvg = {
      sensitivity: Math.round((postAvg.sensitivity - preAvg.sensitivity) * 10) / 10,
      judgment: Math.round((postAvg.judgment - preAvg.judgment) * 10) / 10,
      motivation: Math.round((postAvg.motivation - preAvg.motivation) * 10) / 10,
      action: Math.round((postAvg.action - preAvg.action) * 10) / 10
    };

    return {
      success: true,
      data: {
        dataSource: source,
        totalSubmissions: total,
        completedCount: completedCount,
        completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        preAverages: preAvg,
        postAverages: postAvg,
        averageGains: gainAvg,
        recommendedDistribution: recDist,
        selectedDistribution: selDist,
        matchRate: total > 0 ? Math.round((matchCount / total) * 100) : 0,
        records: records
      }
    };
  } catch (err) {
    return { success: false, message: '대시보드 불러오기 실패: ' + err.message };
  }
}

function generateSyntheticData(count, mode) {
  try {
    var ss = getSpreadsheet_('SYNTHETIC');
    setupSyntheticSheet_(ss);
    var sheet = ss.getSheetByName('synthetic_data');
    if (mode === 'OVERWRITE') {
      sheet.clearContents();
      setupSyntheticSheet_(ss);
    }
    var numStudents = count || 60;
    var activities = ['sensitivity', 'judgment', 'motivation', 'action'];
    var scenarioId = 'SCENARIO_FESTIVAL_01';
    var newRows = [];
    var now = new Date();

    for (var i = 1; i <= numStudents; i++) {
      var codeNum = (i < 10 ? '00' : i < 100 ? '0' : '') + i;
      var code = 'SYN' + codeNum;
      var subId = 'SUB_SYN_' + code + '_' + Utilities.formatDate(now, 'GMT+9', 'yyyyMMddHHmmss');
      var preSens = Math.round((2.0 + Math.random() * 2.2) * 10) / 10;
      var preJudg = Math.round((1.8 + Math.random() * 2.5) * 10) / 10;
      var preMoti = Math.round((1.5 + Math.random() * 2.3) * 10) / 10;
      var preAct = Math.round((1.5 + Math.random() * 2.0) * 10) / 10;

      var lowestVal = Math.min(preSens, preJudg, preMoti, preAct);
      var recAct = 'sensitivity';
      if (lowestVal === preJudg) recAct = 'judgment';
      else if (lowestVal === preMoti) recAct = 'motivation';
      else if (lowestVal === preAct) recAct = 'action';

      var selAct = recAct;
      if (Math.random() < 0.25) {
        var otherActs = activities.filter(function(a) { return a !== recAct; });
        selAct = otherActs[Math.floor(Math.random() * otherActs.length)];
      }

      var boostSens = (selAct === 'sensitivity' ? 0.8 : 0.4) + Math.random() * 0.5;
      var boostJudg = (selAct === 'judgment' ? 0.8 : 0.4) + Math.random() * 0.5;
      var boostMoti = (selAct === 'motivation' ? 0.8 : 0.4) + Math.random() * 0.5;
      var boostAct = (selAct === 'action' ? 0.8 : 0.4) + Math.random() * 0.5;

      var postSens = Math.min(5.0, Math.round((preSens + boostSens) * 10) / 10);
      var postJudg = Math.min(5.0, Math.round((preJudg + boostJudg) * 10) / 10);
      var postMoti = Math.min(5.0, Math.round((preMoti + boostMoti) * 10) / 10);
      var postAct = Math.min(5.0, Math.round((preAct + boostAct) * 10) / 10);

      var gainSens = Math.round((postSens - preSens) * 10) / 10;
      var gainJudg = Math.round((postJudg - preJudg) * 10) / 10;
      var gainMoti = Math.round((postMoti - preMoti) * 10) / 10;
      var gainAct = Math.round((postAct - preAct) * 10) / 10;

      var startStr = Utilities.formatDate(new Date(now.getTime() - (i * 300000)), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');
      var compStr = Utilities.formatDate(new Date(now.getTime() - (i * 300000) + 900000), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');

      var ref1 = '가상 탐색 Q1: ' + selAct + ' 관련 고찰';
      var ref2 = '가상 탐색 Q2: 가치 깨달음 및 성찰';
      var ifP = '축제 부스 일회용품 사용 유혹 상황';
      var thenP = '텀블러 지참 및 다회용기 반납 실천';

      newRows.push([
        subId, code, scenarioId,
        preSens, preJudg, preMoti, preAct,
        recAct, selAct, ref1, ref2, ifP, thenP,
        postSens, postJudg, postMoti, postAct,
        gainSens, gainJudg, gainMoti, gainAct,
        startStr, compStr, 1, 'SYNTHETIC'
      ]);
    }

    if (newRows.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, newRows.length, newRows[0].length).setValues(newRows);
    }

    return { success: true, message: numStudents + '명의 가상 학생 데이터가 생성을 완료했습니다.' };
  } catch (err) {
    return { success: false, message: '가상 데이터 생성 실패: ' + err.message };
  }
}

function exportCsv(source, filters) {
  try {
    var dash = getTeacherDashboard(source, filters);
    if (!dash.success) throw new Error(dash.message);
    var records = dash.data.records;
    var headers = [
      'submission_id', 'student_code', 'scenario_id',
      'sensitivity_pre', 'judgment_pre', 'motivation_pre', 'action_pre',
      'recommended_activity', 'selected_activity',
      'reflection_answer_1', 'reflection_answer_2', 'if_plan', 'then_plan',
      'sensitivity_post', 'judgment_post', 'motivation_post', 'action_post',
      'sensitivity_gain', 'judgment_gain', 'motivation_gain', 'action_gain',
      'started_at', 'completed_at', 'attempt_number', 'data_source'
    ];
    var csvRows = [headers.join(',')];
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var rowVals = [
        r.submission_id, r.student_code, r.scenario_id,
        r.sensitivity_pre, r.judgment_pre, r.motivation_pre, r.action_pre,
        r.recommended_activity, r.selected_activity,
        '"' + r.reflection_answer_1.replace(/"/g, '""') + '"',
        '"' + r.reflection_answer_2.replace(/"/g, '""') + '"',
        '"' + r.if_plan.replace(/"/g, '""') + '"',
        '"' + r.then_plan.replace(/"/g, '""') + '"',
        r.sensitivity_post, r.judgment_post, r.motivation_post, r.action_post,
        r.sensitivity_gain, r.judgment_gain, r.motivation_gain, r.action_gain,
        r.started_at, r.completed_at, r.attempt_number, r.data_source
      ];
      csvRows.push(rowVals.join(','));
    }
    return {
      success: true,
      filename: 'EcoMoral_' + source + '_Export_' + Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMdd_HHmm') + '.csv',
      content: csvRows.join('\\n')
    };
  } catch (err) {
    return { success: false, message: 'CSV 내보내기 실패: ' + err.message };
  }
}
`;

export const INDEX_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoMoral Lab - 반응형 환경 도덕성 학습 랩</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Custom Stylesheet Partial -->
  <?!= include('Stylesheet'); ?>
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-800">

  <!-- Root Application Container -->
  <div id="app-root" class="min-h-screen">
    <div class="flex items-center justify-center min-h-screen text-slate-400 text-sm">
      EcoMoral Lab 로딩 중...
    </div>
  </div>

  <!-- Client Script Partial -->
  <?!= include('JavaScript'); ?>

</body>
</html>
`;

export const STYLESHEET_HTML = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800&display=swap');

  :root {
    --primary: #059669;
    --primary-dark: #047857;
    --primary-light: #d1fae5;
    --secondary: #0284c7;
    --accent: #f59e0b;
    --bg-main: #f8fafc;
    --card-bg: #ffffff;
    --text-main: #0f172a;
    --text-muted: #64748b;
  }

  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .transition-all-200 {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
  }

  .bar-fill {
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .app-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
  }

  .badge-recommended {
    background-color: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .badge-selected {
    background-color: #d1fae5;
    color: #047857;
    border: 1px solid #a7f3d0;
  }
</style>
`;

export const JAVASCRIPT_HTML = `<script>
/**
 * EcoMoral Lab Front-end Client Logic (GAS JavaScript.html)
 */

let appState = {
  view: 'ROLE_SELECT',
  student: {
    studentCode: '',
    scenarioId: 'SCENARIO_FESTIVAL_01',
    scenarioTitle: '학교 축제 일회용품 vs 다회용기 사용 딜레마',
    step: 1,
    submissionId: '',
    attemptNumber: 1,
    consentChecked: false,
    preAnswers: {},
    preScores: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
    recommendedActivity: 'sensitivity',
    selectedActivity: 'sensitivity',
    reflectionAnswer1: '',
    reflectionAnswer2: '',
    ifPlan: '',
    thenPlan: '',
    postAnswers: {},
    postScores: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 }
  },
  teacher: {
    authenticated: false,
    dataSource: 'ACTUAL',
    dashboardData: null,
    loading: false
  }
};

const ASSESSMENT_QUESTIONS = [
  { id: 1, comp: 'sensitivity', label: '도덕적 민감성', text: '학교 축제에서 다량의 일회용품 쓰레기가 발생할 때 이것이 주변 환경과 생태계에 미칠 위험을 쉽게 감지할 수 있다.' },
  { id: 2, comp: 'sensitivity', label: '도덕적 민감성', text: '나의 편리를 위한 선택이 청소 노동자, 주변 동물, 미래 세대에게 미칠 부정적 영향을 주의 깊게 살펴본다.' },
  { id: 3, comp: 'sensitivity', label: '도덕적 민감성', text: '환경 오염 문제가 단순한 개인 취향이 아니라 우리 공동체가 해결해야 할 도덕적 이슈임을 인지한다.' },
  { id: 4, comp: 'judgment', label: '도덕적 판단', text: '축제 부스 운영 시 비용 절감이나 편의성보다 환경 보전과 생태적 책임을 우선하는 것이 도덕적으로 타당하다고 본다.' },
  { id: 5, comp: 'judgment', label: '도덕적 판단', text: '다회용기 반납 및 세척의 번거로움을 감수하는 것이 쓰레기를 남기는 것보다 정의로운 선택임을 합리적으로 판단할 수 있다.' },
  { id: 6, comp: 'judgment', label: '도덕적 판단', text: '단기적 이익(편리함, 저렴함)과 장기적 가치(지속가능성) 사이에서 무엇이 올바른 방향인지 객관적 기준으로 구분한다.' },
  { id: 7, comp: 'motivation', label: '도덕적 동기화', text: '주변 다수의 친구들이 일회용품을 편하게 쓰더라도, 나 스스로 환경 가치를 최우선으로 두고 실천하려는 내적 의지가 있다.' },
  { id: 8, comp: 'motivation', label: '도덕적 동기화', text: '환경 보호를 실천하는 과정에서 약간의 불편함이나 유혹이 생겨도 도덕적 자부심을 지키고자 노력한다.' },
  { id: 9, comp: 'motivation', label: '도덕적 동기화', text: '나의 작은 환경 행동이 학교와 사회의 도덕적 수준을 높이는 데 기여한다는 강한 책임감과 보람을 느낀다.' },
  { id: 10, comp: 'action', label: '도덕적 행동', text: '학교나 일상생활에서 텀블러, 다회용 용기, 장바구니 등을 실제로 적극 지참하여 사용한다.' },
  { id: 11, comp: 'action', label: '도덕적 행동', text: '사용한 용기를 깨끗이 씻어 지정된 장소에 반납하거나 분리배출 수칙을 끝까지 철저히 이행한다.' },
  { id: 12, comp: 'action', label: '도덕적 행동', text: '축제나 모임 중 친구들이 일회용품을 남용할 때 다회용기 사용을 친절하게 제안하고 함께 실천하도록 이끈다.' }
];

function initApp() {
  if (typeof loadLocalSession === 'function') loadLocalSession();
  if (typeof renderApp === 'function') renderApp();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}


function callServer(funcName, ...args) {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[funcName](...args);
    } else {
      console.warn('google.script.run simulator mode for:', funcName);
      setTimeout(() => resolve({ success: true }), 300);
    }
  });
}

function renderApp() {
  const container = document.getElementById('app-root');
  if (!container) return;
  // Dynamic rendering logic...
}
</script>
`;

export const APPSSCRIPT_JSON = `{
  "timeZone": "Asia/Seoul",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}
`;
