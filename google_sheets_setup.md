# 📊 Google Sheets Setup Guide for AuraMinds Leads

You can automatically capture student demo requests in a Google Sheet in under 2 minutes by using **Google Apps Script**.

---

## 🛠️ Step 1: Create a Google Sheet

1. Open your browser and go to [sheets.new](https://sheets.new) (or open your existing Google Sheet).
2. Set up the following headers in the first row:
   * **Column A**: `Timestamp`
   * **Column B**: `Child's Name`
   * **Column C**: `Grade`
   * **Column D**: `WhatsApp Number`
   * **Column E**: `Best Time`

---

## 📝 Step 2: Paste the Apps Script

1. In your Google Sheet menu, click **Extensions** ➔ **Apps Script**.
2. Delete any default code in the editor (`Code.gs`) and paste the following script:

```javascript
function doPost(e) {
  // Set CORS headers so that client-side fetch works smoothly
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter;
    
    // Check if JSON data was sent instead of URL encoded format
    if (!params || Object.keys(params).length === 0) {
      if (e.postData && e.postData.contents) {
        params = JSON.parse(e.postData.contents);
      }
    }
    
    var name = params.childName || "";
    var grade = params.grade || "";
    var whatsapp = params.whatsapp || "";
    var bestTime = params.bestTime || "";
    var timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }); // Format timestamp
    
    sheet.appendRow([timestamp, name, grade, whatsapp, bestTime]);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success",
      "message": "Lead saved successfully!"
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS pre-flight request for cross-origin compliance
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

---

## 🚀 Step 3: Deploy the Script as a Web App

1. In the top-right corner of the Apps Script editor, click the **Deploy** button and select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment details exactly as follows:
   * **Description**: `AuraMinds Lead Capture Web App`
   * **Execute as**: `Me (your-email@gmail.com)`
   * **Who has access**: `Anyone` *(This is required so your landing page form can submit to it without authenticating).*
4. Click **Deploy**.
5. Google will prompt you to **Authorize Access**. Click *Authorize Access*, select your Google Account, click *Advanced* (at the bottom), and then click *Go to Untitled project (unsafe)* or *Allow*.
6. Once deployed, copy the **Web app URL** (it will look like: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Step 4: Link It to your Landing Page

1. Open [index.html](file:///Users/srimanrao/projects/AuraMinds/index.html).
2. Scroll to the bottom script section (search for `GOOGLE_SCRIPT_URL`).
3. Replace the placeholder URL with your copied Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Save the file. All submissions will now flow directly into your Google Sheet in real time!
