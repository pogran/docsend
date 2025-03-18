import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import fs from 'fs'
import { defaultViewport, sleep } from './helpers';
import path from 'path';

dotenv.config();

const start = async () => {
  const docUrl = 'https://docsend.com/view/aebf6cy35v5rfdfz'
  const company = docUrl.split('/').pop() || ''

  const downloadPath = path.resolve(__dirname, '..', 'downloads', company);
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
  }

  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setUserAgent(
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36`
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": `en-US,en;q=0.9`,
    "Referer": `https://docsend.com/`,
    "Upgrade-Insecure-Requests": `1`,
    "sec-ch-ua-platform": `Windows`,
    "sec-ch-ua-platform-version": `10`,
  });

  await page.setViewport(defaultViewport);

  const client = await page.target().createCDPSession();
  try {
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath
    });
    console.log(`Downloads will be saved to: ${downloadPath}`);
  } catch (error) {
    console.error('Failed to set download behavior:', error);
    await page.close()
    await browser.close()
  }

  await page.goto(docUrl, { waitUntil: 'networkidle0' });

  const authForm = await page.$('.js-email-sniffing-auth-form');
  if (authForm) {
    await page.waitForSelector('#link_auth_form_email');
    await page.type('#link_auth_form_email', 'test@gmail.com');

    await page.click('.js-email-sniffing-auth-form button');

    await page.waitForNavigation();
  }

  // Download pdf
  await page.waitForSelector('.toolbar-button.js-document-download')
  await page.click('.toolbar-button.js-document-download');
  // wait 10 seconds while pdf is downloading
  await sleep(10000)

  // await downloadSlides(page, downloadPath)

  await page.close()
  await browser.close()
}

start()

