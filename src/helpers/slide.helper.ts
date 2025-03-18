import { Page } from "puppeteer";
import { sleep } from ".";

export const downloadSlides = async (page: Page, downloadPath: string) => {
  const countPages = await getCountPages(page)
  if (!countPages)
    throw new Error('Pages not found')

  await downloadSlide({ page, countPages, currentPage: 1, downloadPath })
}


async function getCountPages(page: Page) {
  let pages = 0
  const pagesBlock = await page.waitForSelector('.toolbar-page-indicator.space-inset-s')
  if (pagesBlock) {
    pages = +((await pagesBlock.evaluate(node => node.textContent?.split('/').pop()?.trim())) || '0')
  }

  return pages
}


async function downloadSlide(params: { page: Page, countPages: number, currentPage: number, downloadPath: string }) {
  const { page, countPages, currentPage, downloadPath } = params

  console.log(`parsing slide ${currentPage}`)

  await page.waitForSelector('.item.active')
  const imgElement = await page.waitForSelector('.item.active img.page-view');
  if (imgElement) await imgElement.screenshot({ path: `${downloadPath}/${params.currentPage}.png` });

  if (params.currentPage + 1 > countPages) return

  await page.click('.right.carousel-control');
  await sleep(1000)

  return downloadSlide({ ...params, currentPage: currentPage + 1 })
}