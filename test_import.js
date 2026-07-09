const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: '/Users/naivedhyajain/.gemini/antigravity-ide/brain/e8b325c5-6296-449a-b88b-ab384b6e74c8/',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  const artifactDir = '/Users/naivedhyajain/.gemini/antigravity-ide/brain/e8b325c5-6296-449a-b88b-ab384b6e74c8';

  try {
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('Clicking "Start Importing Now"...');
    await page.click('text="Start Importing Now"');
    
    console.log('Clicking "Import Leads via CSV"...');
    await page.waitForSelector('text="Import Leads via CSV"', { state: 'visible' });
    await page.click('text="Import Leads via CSV"');

    console.log('Uploading test_150_rows.csv...');
    const fileInput = await page.waitForSelector('input[type="file"]', { state: 'attached' });
    await fileInput.setInputFiles('/Users/naivedhyajain/CSV_Importe/test_150_rows.csv');
    
    console.log('Taking screenshot of Preview step...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, 'step1_preview.png') });

    console.log('Clicking "Analyse with AI"...');
    await page.click('text="Analyse with AI"');

    console.log('Waiting for AI mapping to complete...');
    await page.waitForSelector('text="Start AI Import"', { state: 'visible', timeout: 30000 });
    await page.screenshot({ path: path.join(artifactDir, 'step2_mapping.png') });

    console.log('Clicking "Start AI Import"...');
    await page.click('text="Start AI Import"');

    console.log('Waiting for Import to Complete...');
    await page.waitForSelector('text="View in Leads"', { state: 'visible', timeout: 60000 });
    await page.screenshot({ path: path.join(artifactDir, 'step3_summary.png') });

    console.log('Clicking "View in Leads"...');
    await page.click('text="View in Leads"');
    
    console.log('Taking screenshot of Leads Table...');
    await page.waitForTimeout(2000); // let virtualized table render
    await page.screenshot({ path: path.join(artifactDir, 'step4_leads_table.png') });

    console.log('Testing completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await context.close();
    await browser.close();
    
    // Rename the video file to a known name
    const files = fs.readdirSync(artifactDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      fs.renameSync(
        path.join(artifactDir, videoFile), 
        path.join(artifactDir, 'ui_test_recording.webm')
      );
      console.log('Video saved as ui_test_recording.webm');
    }
  }
})();
