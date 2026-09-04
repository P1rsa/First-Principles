# Connecting the booking form to Google Sheets

The website is fully functional on its own — the form validates and shows
success/error states without any backend. But right now, submitted bookings
go nowhere. Follow these steps once to have them land in a Google Sheet.

This takes about 10 minutes and needs no coding beyond pasting one file.

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet.
2. Name it something like **"First Principles — Bookings"**.
3. You don't need to add any headers yourself — the script creates a
   `Bookings` tab with headers automatically the first time it runs.

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in the editor.
3. Open `apps-script.gs` (included alongside this file) and paste its
   entire contents into the Apps Script editor.
4. Click the disk icon (or Ctrl/Cmd+S) to save. Give the project a name,
   e.g. "Booking Form Backend".

## 3. Deploy it as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure it as follows:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google will ask you to authorize the script — this is expected, since
   it needs permission to write to your own Sheet. Click through the
   consent screens (you may see an "unverified app" warning since this is
   your own personal script; click **Advanced → Go to [project name]
   (unsafe)** to proceed — this is safe because you wrote the code).
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec`

Keep this URL handy — it's not a secret credential (it can't read your
Sheet, only append rows through the code you just deployed), but you don't
need to share it publicly either.

## 4. Connect it to the website

1. Open `script.js`.
2. Find this line near the top:
   ```js
   const BOOKING_ENDPOINT = 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_URL';
   ```
3. Replace the placeholder with the Web app URL you copied:
   ```js
   const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec';
   ```
4. Save the file and re-upload it wherever the site is hosted.

That's it — test it by submitting the booking form yourself once. A new
row should appear in the **Bookings** tab within a few seconds.

## Updating the script later

If you ever edit `apps-script.gs` again (e.g. to add a field), you need to
create a **new deployment version** for the changes to take effect:

1. **Deploy → Manage deployments**.
2. Click the pencil (edit) icon on the existing deployment.
3. Under "Version," choose **New version**, then **Deploy**.

The Web app URL stays the same, so you won't need to update `script.js`
again.

## Why this approach is secure

- No API keys, service account credentials, or passwords are ever placed
  in the website's code.
- The Apps Script runs entirely under your own Google account, and only
  the specific `doPost` function you wrote is exposed — there's no way for
  someone hitting that URL to read existing rows, delete data, or access
  anything else in your Google account.
- If you ever want to shut it off, go back to **Deploy → Manage
  deployments** and archive the deployment.
