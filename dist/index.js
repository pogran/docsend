"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const start = async () => {
    const docUrl = 'https://docsend.com/view/aebf6cy35v5rfdfz';
    const company = docUrl.split('/').pop();
    const downloadPath = `./downloads/${company}`;
    if (!fs_1.default.existsSync(downloadPath)) {
        fs_1.default.mkdirSync(downloadPath);
    }
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36`);
    await page.setExtraHTTPHeaders({
        "Accept-Language": `en-US,en;q=0.9`,
        "Referer": `https://docsend.com/`,
        "Upgrade-Insecure-Requests": `1`,
        "sec-ch-ua-platform": `Windows`,
        "sec-ch-ua-platform-version": `10`,
    });
    await page.setViewport({
        width: 1900,
        height: 800,
    });
    await page.goto(docUrl, { waitUntil: 'networkidle0' });
    const authForm = await page.$('.js-email-sniffing-auth-form');
    if (authForm) {
        await page.waitForSelector('#link_auth_form_email');
        await page.type('#link_auth_form_email', 'test@gmail.com');
        await page.click('.js-email-sniffing-auth-form button');
        await page.waitForNavigation();
    }
    const countPages = await getCountPages(page);
    if (!countPages)
        throw new Error('Pages not found');
    await downloadSlide({ page, countPages, currentPage: 1, downloadPath });
    await page.waitForSelector('.item.active');
    const imgElement = await page.waitForSelector('.item.active img.page-view');
    if (imgElement)
        await imgElement.screenshot({ path: 'screenshot-image.png' });
    await page.close();
    await browser.close();
};
start();
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getCountPages(page) {
    let pages = 0;
    const pagesBlock = await page.waitForSelector('.toolbar-page-indicator.space-inset-s');
    if (pagesBlock) {
        pages = +((await pagesBlock.evaluate(node => node.textContent?.split('/').pop()?.trim())) || '0');
    }
    return pages;
}
async function downloadSlide(params) {
    const { page, countPages, currentPage, downloadPath } = params;
    console.log(`parsing slide ${currentPage}`);
    await page.waitForSelector('.item.active');
    const imgElement = await page.waitForSelector('.item.active img.page-view');
    if (imgElement)
        await imgElement.screenshot({ path: `${downloadPath}/${params.currentPage}.png` });
    if (params.currentPage + 1 > countPages)
        return;
    await page.click('.right.carousel-control');
    await sleep(1000);
    return downloadSlide({ ...params, currentPage: currentPage + 1 });
}
