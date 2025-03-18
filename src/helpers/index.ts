import { LaunchOptions, Viewport } from "puppeteer";

export const devLaunchOptions: LaunchOptions = {
  headless: false,
  slowMo: 50,
  defaultViewport: null
}

// Set big width because left/rigth control buttons stay on slide and display on puppeteer screen
export const ViewportForSlides: Viewport = {
  width: 1900,
  height: 800
}

export const defaultViewport: Viewport = {
  width: 1200,
  height: 720,
}

export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

