import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { translatedPathnames } from "./pathnames";
import { m } from "@/paraglide/messages";

const OUTPUT_DIR = path.join("../", "public", "og");
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateOgImages() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    // These args help prevent crashes in Docker/CI environments
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Standard OG Size
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
  });

  for (const route of translatedPathnames) {
    for (const [locale, localizedPath] of route.localized) {
      const headingText = m.og_title({}, { locale });
      const gradientText = m.og_gradient({}, { locale });
      const ctaText = m.og_button({}, { locale });

      const html = getHtmlTemplate({
        heading: headingText,
        gradient: gradientText,
        cta: ctaText,
      });

      // 2. Load the HTML quickly (don't wait for network idle)
      await page.setContent(html, {
        waitUntil: "load",
        timeout: 60000,
      });

      // 3. THE FIX: Explicitly wait for Google Fonts to finish loading
      // This is much faster and more reliable than networkidle0
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const filename = `${locale}-${route.pattern.replace(/\//g, "_") || "home"}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      await page.screenshot({ path: filepath, type: "png" });
      console.log(`Generated OG: ${filepath}`);
    }
  }

  await browser.close();
}

function getHtmlTemplate({
  heading,
  gradient,
  cta,
}: {
  heading: string;
  gradient: string;
  cta: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Serif:ital,opsz,wght@0,8..144,100..900;1,8..144,100..900&family=Space+Grotesk:wght@300..700&display=swap');

          body { margin: 0; padding: 0; box-sizing: border-box; }

          /* Container - Fixed 1200x630 */
          .container {
            width: 1200px;
            height: 630px;
            background-color: #13132d;
            position: relative;
            overflow: hidden;
            font-family: 'Roboto Serif', sans-serif;
          }

          /* Logo Header */
          .logo-header {
            position: absolute;
            background-color: #2a2d7c;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 40px;
            top: 41px;
            padding: 10px;
            border-radius: 20px;
            box-sizing: border-box;
          }

          .logo-text {
            margin: 0;
            font-family: 'Roboto Serif', sans-serif;
            font-weight: 900;
            color: #c8c2ff;
            font-size: 64.6px;
            white-space: nowrap;
          }

          /* Background Shapes */
          .shapes-container {
            position: absolute;
            left: 210px;
            top: -241px;
            width: 1204px;
            height: 1276px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 0;
          }

          .shapes-rotated { transform: rotate(310deg); }

          .shapes-grid {
            display: flex;
            flex-direction: column;
            gap: 18px;
            width: 1172px;
          }

          .shapes-row {
            display: flex;
            gap: 18px;
            height: 285px;
            width: 100%;
          }

          .shape { border-radius: 20px; }
          .shape-flex { flex: 1; }

          .shape-light-purple { background-color: #c8c2ff; }
          .shape-dark-blue { background-color: #26265a; width: 183px; }
          .shape-medium-blue { background-color: #2a2d7c; }
          .shape-purple { background-color: #551a63; }
          .shape-cyan { background-color: #44d9e6; }
          .shape-small-light-purple { background-color: #c8c2ff; width: 234px; }

          /* Main Heading */
          .main-heading-container {
            position: absolute;
            left: 36px;
            top: 244px;
            transform: translateY(-50%);
            width: 688px;
            z-index: 10;
          }

          .main-heading {
            margin: 0;
            font-family: 'Roboto Serif', sans-serif;
            font-weight: 700;
            color: #c8c2ff;
            font-size: 48px;
            line-height: 1.2;
          }

          /* Gradient Text */
          .gradient-text-container {
            position: absolute;
            left: 36px;
            top: 341px;
            transform: translateY(-50%);
            width: 600px;
            z-index: 10;
          }

          .gradient-text {
            margin: 0;
            font-family: 'Roboto Serif', sans-serif;
            font-weight: 700;
            font-size: 70px;
            line-height: 1.1;
            background: linear-gradient(to right, #44d9e6, #551a63, #c8c2ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* CTA Button */
          .cta-button {
            position: absolute;
            background-color: #551a63;
            display: flex;
            align-items: center;
            justify-content: center;
            left: 40px;
            top: 494px;
            width: 657px;
            height: 72px;
            padding: 0;
            border-radius: 12px;
            z-index: 10;
          }

          .cta-text {
            margin: 0;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 300;
            font-size: 40px;
            color: white;
            white-space: nowrap;
            text-shadow: rgba(0, 0, 0, 0.25) 0px 4px 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-header">
            <p class="logo-text">cioky.dev</p>
          </div>
          <div class="shapes-container">
            <div class="shapes-rotated">
              <div class="shapes-grid">
                <div class="shapes-row">
                  <div class="shape shape-flex shape-light-purple"></div>
                  <div class="shape shape-dark-blue"></div>
                  <div class="shape shape-flex shape-medium-blue"></div>
                </div>
                <div class="shapes-row">
                  <div class="shape shape-flex shape-purple"></div>
                  <div class="shape shape-flex shape-cyan"></div>
                  <div class="shape shape-small-light-purple"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="main-heading-container">
            <p class="main-heading">${heading}</p>
          </div>
          <div class="gradient-text-container">
            <p class="gradient-text">${gradient}</p>
          </div>
          <div class="cta-button">
            <p class="cta-text">${cta}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

generateOgImages().catch(console.error);
