/**
 * First Principles Math Tutoring — booking form backend.
 *
 * This script receives POST requests from the website's booking form and
 * appends each submission as a new row in the linked Google Sheet.
 *
 * Setup: see SETUP_INSTRUCTIONS.md for the full step-by-step walkthrough.
 * No API keys or credentials are needed — Apps Script runs under your own
 * Google account permissions once you deploy it.
 */

const SHEET_NAME = 'Bookings';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      new Date(),                 // Timestamp
      data.childName || '',       // Child name
      data.childAge || '',        // Age
      data.childGrade || '',      // Grade
      data.aboutChild || '',      // About child
      data.goal || '',            // Goal
      data.phone || '',           // Phone
      data.email || '',           // Email
      data.additionalInfo || '',  // Additional information
      'New',                      // Status (admin-editable)
      '',                         // Tutor assigned (admin-editable)
      ''                          // Follow-up date (admin-editable)
    ]);

    return jsonResponse({ result: 'success' });
  } catch (error) {
    return jsonResponse({ result: 'error', error: error.toString() });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Child Name', 'Age', 'Grade', 'About Child', 'Goal',
      'Phone', 'Email', 'Additional Info', 'Status', 'Tutor Assigned', 'Follow-up Date'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
