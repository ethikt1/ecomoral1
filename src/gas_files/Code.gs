/**
 * EcoMoral Lab - Google Apps Script Server Side Logic
 * App Name: EcoMoral Lab (환경 도덕성 학습 및 진단 랩)
 * Target: Middle & High School Students
 */

/**
 * Serves the web app HTML or API GET endpoint
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

/**
 * Handles Web App HTTP POST API requests from external apps (React web app)
 */
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

/**
 * Helper to include HTML files in templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Gets Script Properties helper
 */
function getScriptProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * Sanitizes user input string against CSV/Formula Injection
 */
function sanitizeInput_(input) {
  if (typeof input !== 'string') return input;
  var str = input.trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str; // Prefix single quote to disable execution
  }
  return str;
}

/**
 * SHA-256 Hash helper for teacher password verification
 */
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

/**
 * Verifies Teacher Password using SHA-256 hash stored in Script Properties
 */
function verifyTeacherPassword(password) {
  try {
    if (!password) return { success: false, message: '비밀번호를 입력해주세요.' };
    
    var storedHash = getScriptProp_('TEACHER_PASSWORD_HASH');
    var inputHash = hashString_(password);
    
    // Default password fallback if not set: ecomoral123!
    if (!storedHash) {
      var defaultHash = hashString_('ecomoral123!');
      if (inputHash === defaultHash) {
        return { success: true, isDefault: true };
      }
    } else if (inputHash === storedHash) {
      return { success: true };
    }
    
    return { success: false, message: '교사 비밀번호가 일치하지 않습니다.' };
  } catch (err) {
    return { success: false, message: '비밀번호 인증 오류: ' + err.message };
  }
}

/**
 * Sets new teacher password
 */
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

/**
 * Gets Spreadsheet object based on data source type ('ACTUAL' vs 'SYNTHETIC')
 */
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
  } catch (e) {
    // Ignore error
  }
  
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

/**
 * Alias for setupDatabase
 */
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

/**
 * Recalculates 4 components scores from raw answer dictionary
 */
function calculateScores_(answers) {
  var getAvg = function(qIds) {
    var sum = 0, count = 0;
    for (var i = 0; i < qIds.length; i++) {
      var val = Number(answers[qIds[i]] || 0);
      if (val > 0) {
        sum += val;
        count++;
      }
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

/**
 * Recommends lowest component activity
 */
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

/**
 * Gets student current progress by code and scenario
 */
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

/**
 * Saves Pre-Assessment survey responses
 */
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
    
    // 1. Update / Insert students sheet
    var stSheet = ss.getSheetByName('students');
    var stData = stSheet.getDataRange().getValues();
    var stFoundIndex = -1;
    for (var i = 1; i < stData.length; i++) {
      if (stData[i][0] === subId) {
        stFoundIndex = i + 1;
        break;
      }
    }
    if (stFoundIndex > 0) {
      stSheet.getRange(stFoundIndex, 7).setValue('IN_PROGRESS');
    } else {
      stSheet.appendRow([subId, code, scenarioId, nowStr, '', true, 'IN_PROGRESS', attempt]);
    }

    // 2. Update / Insert pre_assessment sheet
    var preSheet = ss.getSheetByName('pre_assessment');
    var preData = preSheet.getDataRange().getValues();
    var preFoundIndex = -1;
    for (var j = 1; j < preData.length; j++) {
      if (preData[j][0] === subId) {
        preFoundIndex = j + 1;
        break;
      }
    }
    var preRow = [subId, code, scores.sensitivity, scores.judgment, scores.motivation, scores.action, JSON.stringify(answers), nowStr];
    if (preFoundIndex > 0) {
      preSheet.getRange(preFoundIndex, 1, 1, preRow.length).setValues([preRow]);
    } else {
      preSheet.appendRow(preRow);
    }

    // 3. Update / Insert combined_export
    var combSheet = ss.getSheetByName('combined_export');
    var combData = combSheet.getDataRange().getValues();
    var combFoundIndex = -1;
    for (var k = 1; k < combData.length; k++) {
      if (combData[k][0] === subId) {
        combFoundIndex = k + 1;
        break;
      }
    }
    
    if (combFoundIndex < 0) {
      // New row
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
    return {
      success: true,
      scores: scores,
      recommendedActivity: recommended
    };
  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    return { success: false, message: '사전 설문 저장 오류: ' + err.message };
  }
}

/**
 * Saves Learning Activity & Action Plan
 */
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
      if (actData[i][0] === subId) {
        foundIndex = i + 1;
        break;
      }
    }
    
    var row = [subId, recommended, selected, q1, q2, ifPlan, thenPlan, nowStr];
    if (foundIndex > 0) {
      actSheet.getRange(foundIndex, 1, 1, row.length).setValues([row]);
    } else {
      actSheet.appendRow(row);
    }

    // Update combined export
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

/**
 * Saves Post-Assessment & Completes Session
 */
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

    // Save post_assessment
    var postSheet = ss.getSheetByName('post_assessment');
    var postData = postSheet.getDataRange().getValues();
    var postFound = -1;
    for (var i = 1; i < postData.length; i++) {
      if (postData[i][0] === subId) {
        postFound = i + 1;
        break;
      }
    }
    var postRow = [subId, code, postScores.sensitivity, postScores.judgment, postScores.motivation, postScores.action, JSON.stringify(answers), nowStr];
    if (postFound > 0) {
      postSheet.getRange(postFound, 1, 1, postRow.length).setValues([postRow]);
    } else {
      postSheet.appendRow(postRow);
    }

    // Update students completion status
    var stSheet = ss.getSheetByName('students');
    var stData = stSheet.getDataRange().getValues();
    for (var j = 1; j < stData.length; j++) {
      if (stData[j][0] === subId) {
        stSheet.getRange(j + 1, 5).setValue(nowStr);
        stSheet.getRange(j + 1, 7).setValue('COMPLETED');
        break;
      }
    }

    // Update combined export gains
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
        combSheet.getRange(k + 1, 23).setValue(nowStr); // completed_at
        combSheet.getRange(k + 1, 25).setValue('ACTUAL'); // Enforce ACTUAL data_source
        break;
      }
    }

    lock.releaseLock();
    return {
      success: true,
      postScores: postScores,
      preScores: preScores
    };
  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    return { success: false, message: '사후 설문 저장 오류: ' + err.message };
  }
}

/**
 * Gets Teacher Dashboard analytics and records
 */
function getTeacherDashboard(source, filters) {
  try {
    var ss = getSpreadsheet_(source || 'ACTUAL');
    var sheetName = (source === 'SYNTHETIC') ? 'synthetic_data' : 'combined_export';
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return {
        success: true,
        data: {
          dataSource: source,
          totalSubmissions: 0,
          completedCount: 0,
          completionRate: 0,
          preAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          postAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          averageGains: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          recommendedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          selectedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          matchRate: 0,
          records: []
        }
      };
    }

    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return {
        success: true,
        data: {
          dataSource: source,
          totalSubmissions: 0,
          completedCount: 0,
          completionRate: 0,
          preAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          postAverages: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          averageGains: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          recommendedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          selectedDistribution: { sensitivity: 0, judgment: 0, motivation: 0, action: 0 },
          matchRate: 0,
          records: []
        }
      };
    }

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

      // Filters
      if (filters) {
        if (filters.scenarioId && rec.scenario_id !== filters.scenarioId) continue;
        if (filters.completedOnly && !rec.completed_at) continue;
        if (filters.searchQuery) {
          var q = filters.searchQuery.toLowerCase();
          if (!rec.student_code.toLowerCase().includes(q) && !rec.submission_id.toLowerCase().includes(q)) {
            continue;
          }
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

      if (rec.recommended_activity && recDist[rec.recommended_activity] !== undefined) {
        recDist[rec.recommended_activity]++;
      }
      if (rec.selected_activity && selDist[rec.selected_activity] !== undefined) {
        selDist[rec.selected_activity]++;
      }
      if (rec.recommended_activity && rec.recommended_activity === rec.selected_activity) {
        matchCount++;
      }
    }

    var total = records.length;
    var calcAvg = function(sum, count) {
      return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    };

    var preAvg = {
      sensitivity: calcAvg(preSum.sensitivity, total),
      judgment: calcAvg(preSum.judgment, total),
      motivation: calcAvg(preSum.motivation, total),
      action: calcAvg(preSum.action, total)
    };

    var postAvg = {
      sensitivity: calcAvg(postSum.sensitivity, completedCount),
      judgment: calcAvg(postSum.judgment, completedCount),
      motivation: calcAvg(postSum.motivation, completedCount),
      action: calcAvg(postSum.action, completedCount)
    };

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

/**
 * Generates Synthetic Student Data (SYN001 ~ SYN060)
 * ONLY allowed for SYNTHETIC DB
 */
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
      
      // Generate pre scores between 1.5 and 4.2
      var preSens = Math.round((2.0 + Math.random() * 2.2) * 10) / 10;
      var preJudg = Math.round((1.8 + Math.random() * 2.5) * 10) / 10;
      var preMoti = Math.round((1.5 + Math.random() * 2.3) * 10) / 10;
      var preAct = Math.round((1.5 + Math.random() * 2.0) * 10) / 10;

      // Recommended is lowest
      var lowestVal = Math.min(preSens, preJudg, preMoti, preAct);
      var recAct = 'sensitivity';
      if (lowestVal === preJudg) recAct = 'judgment';
      else if (lowestVal === preMoti) recAct = 'motivation';
      else if (lowestVal === preAct) recAct = 'action';

      // 75% choose recommended, 25% pick another
      var selAct = recAct;
      if (Math.random() < 0.25) {
        var otherActs = activities.filter(function(a) { return a !== recAct; });
        selAct = otherActs[Math.floor(Math.random() * otherActs.length)];
      }

      // Post score gains (0.3 ~ 1.5 improvement, selected activity gets higher boost)
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

      var ref1 = '가상 데이터 탐색 질문 1 응답: ' + selAct + ' 활동을 통한 성찰 내용';
      var ref2 = '가상 데이터 탐색 질문 2 응답: 깨달은 환경 가치와 실천 의지';
      var ifP = '학교 축제 부스에서 일회용 컵을 제공받을 때';
      var thenP = '미리 준비한 개인 텀블러에 음료를 받고 친구에게도 권유하겠다';

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

    return {
      success: true,
      message: numStudents + '명의 가상 학생 데이터가 성공적으로 생성을 완료했습니다.'
    };
  } catch (err) {
    return { success: false, message: '가상 데이터 생성 실패: ' + err.message };
  }
}

/**
 * Exports data to CSV format
 */
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
        '\"' + r.reflection_answer_1.replace(/\"/g, '\"\"') + '\"',
        '\"' + r.reflection_answer_2.replace(/\"/g, '\"\"') + '\"',
        '\"' + r.if_plan.replace(/\"/g, '\"\"') + '\"',
        '\"' + r.then_plan.replace(/\"/g, '\"\"') + '\"',
        r.sensitivity_post, r.judgment_post, r.motivation_post, r.action_post,
        r.sensitivity_gain, r.judgment_gain, r.motivation_gain, r.action_gain,
        r.started_at, r.completed_at, r.attempt_number, r.data_source
      ];
      csvRows.push(rowVals.join(','));
    }

    return {
      success: true,
      filename: 'EcoMoral_' + source + '_Export_' + Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMdd_HHmm') + '.csv',
      content: csvRows.join('\n')
    };
  } catch (err) {
    return { success: false, message: 'CSV 내보내기 실패: ' + err.message };
  }
}
