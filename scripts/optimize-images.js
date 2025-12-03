#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import { optimize } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
  sourceDir: path.join(__dirname, "..", "assets"),
  destDir: path.join(__dirname, "..", "public"),
  cacheFile: path.join(__dirname, "..", ".image-cache.json"),

  // Concurrency: How many images to process at once.
  // Higher = faster but uses more RAM. 4-8 is usually safe.
  concurrency: 4,

  imageExtensions: [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".bmp", ".webp"],
  svgExtensions: [".svg"],

  optimization: {
    // WebP: The standard for modern web images
    webp: {
      quality: 80,
      alphaQuality: 85,
      lossless: false,
      nearLossless: true,
      smartSubsample: true, // Reduces chroma subsampling artifacts
      effort: 6, // 0-6 (6 is slowest but best compression)
    },
    // PNG: Used specifically for the 'og/' folder to maintain compatibility
    png: {
      quality: 80,
      compressionLevel: 9, // Max compression
      palette: true, // Quantize colors (huge savings for illustrations)
      effort: 10, // 1-10 (10 is slowest but best compression)
    },
  },

  svgoConfig: {
    multipass: true, // Run plugins multiple times
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: { floatPrecision: 2 }, // Reduce precision
            removeViewBox: false, // Usually safer to keep this true for scaling
            removeUnknownsAndDefaults: true,
            convertPathData: true,
          },
        },
      },
      "sortAttrs",
      {
        name: "addAttributesToSVGElement",
        params: {
          attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
        },
      },
    ],
  },
};

// ==========================================
// STATE & UTILS
// ==========================================
const stats = {
  totalImages: 0,
  processed: 0, // Track processed to show progress
  optimized: 0,
  skipped: 0,
  errors: 0,
  totalSavings: 0,
};

let cache = {};

// Generate a hash of the current CONFIG object.
// This ensures we re-run optimization if you change quality settings.
const CONFIG_HASH = crypto
  .createHash("md5")
  .update(
    JSON.stringify(CONFIG.optimization) + JSON.stringify(CONFIG.svgoConfig),
  )
  .digest("hex");

async function loadCache() {
  try {
    const cacheData = await fs.readFile(CONFIG.cacheFile, "utf8");
    cache = JSON.parse(cacheData);
  } catch (error) {
    cache = {};
  }
}

async function saveCache() {
  try {
    await fs.writeFile(CONFIG.cacheFile, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Error saving cache:", error.message);
  }
}

async function getFileHash(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return crypto
      .createHash("md5")
      .update(`${stat.size}-${stat.mtimeMs}-${CONFIG_HASH}`)
      .digest("hex");
  } catch (error) {
    return null;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ==========================================
// OPTIMIZATION ENGINES
// ==========================================

async function optimizeRasterImage(filePath, destPath) {
  try {
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const isOgImage = relativePath.startsWith("og/"); // Check if it's an OpenGraph image

    // Determine output format and settings
    let finalDestPath = destPath;
    let pipeline = sharp(filePath);
    let optimizedBuffer;

    if (isOgImage) {
      // OG images must often be PNG/JPG, WebP support is spotty on some platforms
      optimizedBuffer = await pipeline.png(CONFIG.optimization.png).toBuffer();
    } else {
      // Convert everything else to WebP
      finalDestPath = destPath.replace(/\.[^/.]+$/, ".webp");
      optimizedBuffer = await pipeline
        .webp(CONFIG.optimization.webp)
        .toBuffer();
    }

    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;
    const optimizedSize = optimizedBuffer.length;

    await fs.writeFile(finalDestPath, optimizedBuffer);

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings: originalSize - optimizedSize,
      destPath: finalDestPath,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function optimizeSvg(filePath, destPath) {
  try {
    const originalContent = await fs.readFile(filePath, "utf8");
    const originalSize = Buffer.byteLength(originalContent, "utf8");

    const result = optimize(originalContent, CONFIG.svgoConfig);

    if (result.error) throw new Error(result.error);

    const optimizedContent = result.data;
    const optimizedSize = Buffer.byteLength(optimizedContent, "utf8");

    await fs.writeFile(destPath, optimizedContent);

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings: originalSize - optimizedSize,
      destPath,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// CORE LOGIC
// ==========================================

async function processImage(filePath) {
  const relativePath = path.relative(CONFIG.sourceDir, filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Logic to determine cache key (mimicking output filename logic)
  const isOgImage = relativePath.startsWith("og/");
  const cacheKey =
    CONFIG.svgExtensions.includes(ext) || isOgImage
      ? relativePath
      : relativePath.replace(/\.[^/.]+$/, ".webp");

  const destPath = path.join(CONFIG.destDir, relativePath);
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  // 1. Check Cache
  const currentHash = await getFileHash(filePath);
  if (cache[cacheKey] && cache[cacheKey].hash === currentHash) {
    // Verify file actually exists at destination
    try {
      // Correctly verify the DESTINATION file exists
      const expectedDest =
        CONFIG.svgExtensions.includes(ext) || isOgImage
          ? destPath
          : destPath.replace(/\.[^/.]+$/, ".webp");
      await fs.access(expectedDest);

      stats.skipped++;
      // console.log(`⏭️  Skipped: ${relativePath}`); // Optional: Comment out for cleaner log
      return;
    } catch (e) {
      // File missing from dest, proceed to optimize
    }
  }

  // 2. Optimize
  const start = Date.now();
  let result;

  if (CONFIG.svgExtensions.includes(ext)) {
    result = await optimizeSvg(filePath, destPath);
  } else {
    result = await optimizeRasterImage(filePath, destPath);
  }

  const duration = Date.now() - start;

  // 3. Handle Result
  if (!result.success) {
    console.error(`❌ Error processing ${relativePath}: ${result.error}`);
    stats.errors++;
  } else {
    // Update Cache
    cache[cacheKey] = {
      hash: currentHash,
      timestamp: new Date().toISOString(),
    };

    stats.optimized++;
    stats.totalSavings += result.savings;

    const percent =
      result.originalSize > 0
        ? ((result.savings / result.originalSize) * 100).toFixed(1)
        : 0;

    const color = result.savings > 0 ? "\x1b[32m" : "\x1b[33m"; // Green or Yellow
    const reset = "\x1b[0m";

    console.log(
      `${color}✔ ${relativePath}${reset} ` +
        `(${formatFileSize(result.originalSize)} -> ${formatFileSize(result.optimizedSize)}) ` +
        `[${percent}% saved] in ${duration}ms`,
    );
  }
}

async function getAllFiles(dir) {
  const files = [];
  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (
          CONFIG.imageExtensions.includes(ext) ||
          CONFIG.svgExtensions.includes(ext)
        ) {
          files.push(fullPath);
        }
      }
    }
  }
  await walk(dir);
  return files;
}

// Simple concurrency limiter
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);

    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log("🔍 Scanning assets...");

  try {
    await fs.access(CONFIG.sourceDir);
  } catch {
    console.error(`❌ Source directory not found: ${CONFIG.sourceDir}`);
    process.exit(1);
  }

  await loadCache();
  const allFiles = await getAllFiles(CONFIG.sourceDir);
  stats.totalImages = allFiles.length;

  console.log(
    `📁 Found ${stats.totalImages} images. Processing with concurrency: ${CONFIG.concurrency}...`,
  );
  console.log("=".repeat(60));

  // Run with concurrency limit
  await asyncPool(CONFIG.concurrency, allFiles, processImage);

  await saveCache();

  console.log("\n" + "=".repeat(60));
  console.log("📊 OPTIMIZATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Images : ${stats.totalImages}`);
  console.log(`Optimized    : ${stats.optimized}`);
  console.log(`Cached       : ${stats.skipped}`);
  console.log(`Errors       : ${stats.errors}`);
  console.log(`Space Saved  : ${formatFileSize(stats.totalSavings)}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
