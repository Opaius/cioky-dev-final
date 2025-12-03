#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import { optimize } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // Source and destination directories
  sourceDir: path.join(__dirname, "..", "assets"),
  destDir: path.join(__dirname, "..", "public"),

  // Cache file location
  cacheFile: path.join(__dirname, "..", ".image-cache.json"),

  // Image formats to optimize (raster images will be converted to WebP)
  imageExtensions: [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".bmp"],

  // SVG extensions (keep as SVG)
  svgExtensions: [".svg"],

  // Optimization settings
  optimization: {
    // WebP settings (all raster images will be converted to WebP)
    webp: {
      quality: 80,
      lossless: false,
      nearLossless: true,
      alphaQuality: 85,
    },
  },

  // SVGO configuration
  svgoConfig: {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            cleanupNumericValues: false,
            cleanupIds: {
              minify: false,
              remove: false,
            },
            convertPathData: false,
          },
        },
      },
      "sortAttrs",
      "removeViewBox",
      {
        name: "addAttributesToSVGElement",
        params: {
          attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
        },
      },
    ],
  },
};

// Statistics
const stats = {
  totalImages: 0,
  optimized: 0,
  skipped: 0,
  errors: 0,
  totalSavings: 0,
};

// Cache structure
let cache = {};

// Load cache from file
async function loadCache() {
  try {
    const cacheData = await fs.readFile(CONFIG.cacheFile, "utf8");
    cache = JSON.parse(cacheData);
  } catch (error) {
    // Cache file doesn't exist or is invalid
    cache = {};
  }
}

// Save cache to file
async function saveCache() {
  try {
    await fs.writeFile(CONFIG.cacheFile, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Error saving cache:", error.message);
  }
}

// Get file hash (using file size and modification time for simplicity)
async function getFileHash(filePath) {
  try {
    const stat = await fs.stat(filePath);
    // Use size + mtime as a simple hash
    return crypto
      .createHash("md5")
      .update(`${stat.size}-${stat.mtimeMs}`)
      .digest("hex");
  } catch (error) {
    return null;
  }
}

// Check if file needs optimization
async function needsOptimization(filePath, relativePath) {
  const fileHash = await getFileHash(filePath);
  if (!fileHash) return true;

  const cached = cache[relativePath];
  if (!cached) return true;

  return cached.hash !== fileHash;
}

// Update cache entry
async function updateCache(filePath, relativePath) {
  const fileHash = await getFileHash(filePath);
  if (fileHash) {
    cache[relativePath] = {
      hash: fileHash,
      timestamp: new Date().toISOString(),
    };
  }
}

// Get all image files from assets directory
async function getAllImageFiles(dir) {
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

// Ensure destination directory exists
async function ensureDestPath(filePath) {
  const relativePath = path.relative(CONFIG.sourceDir, filePath);
  const destPath = path.join(CONFIG.destDir, relativePath);
  const destDir = path.dirname(destPath);

  await fs.mkdir(destDir, { recursive: true });
  return destPath;
}

// Optimize raster image (convert to WebP, except for og/ folder)
async function optimizeRasterImage(filePath, destPath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;

    // Check if file is in og/ folder
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const isOgImage = relativePath.startsWith("og/");

    let optimizedBuffer;
    let optimizedSize;
    let finalDestPath = destPath;

    if (isOgImage) {
      // Keep PNG format for og/ folder images
      const image = sharp(filePath);
      optimizedBuffer = await image
        .png({
          quality: 85,
          compressionLevel: 9,
          palette: true,
        })
        .toBuffer();
      optimizedSize = optimizedBuffer.length;
    } else {
      // Convert other raster images to WebP
      finalDestPath = destPath.replace(/\.[^/.]+$/, ".webp");
      const image = sharp(filePath);
      optimizedBuffer = await image.webp(CONFIG.optimization.webp).toBuffer();
      optimizedSize = optimizedBuffer.length;
    }

    await fs.writeFile(finalDestPath, optimizedBuffer);

    const savings = originalSize - optimizedSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings,
      percent,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Optimize SVG
async function optimizeSvg(filePath, destPath) {
  try {
    const originalContent = await fs.readFile(filePath, "utf8");
    const originalSize = Buffer.byteLength(originalContent, "utf8");

    const result = optimize(originalContent, CONFIG.svgoConfig);
    const optimizedContent = result.data;
    const optimizedSize = Buffer.byteLength(optimizedContent, "utf8");

    await fs.writeFile(destPath, optimizedContent);

    const savings = originalSize - optimizedSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);

    return {
      success: true,
      originalSize,
      optimizedSize,
      savings,
      percent,
      destPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Main function
async function main() {
  console.log("🔍 Scanning for images in assets directory...\n");

  try {
    // Check if assets directory exists
    try {
      await fs.access(CONFIG.sourceDir);
    } catch {
      console.error(`Assets directory not found: ${CONFIG.sourceDir}`);
      console.error("Please create an assets folder with your images.");
      process.exit(1);
    }

    // Load cache
    await loadCache();

    // Get all image files
    const imageFiles = await getAllImageFiles(CONFIG.sourceDir);
    stats.totalImages = imageFiles.length;

    if (stats.totalImages === 0) {
      console.log("✅ No images found in assets directory.");
      return;
    }

    console.log(`📁 Found ${stats.totalImages} image files.\n`);

    // Process each image
    for (const filePath of imageFiles) {
      const relativePath = path.relative(CONFIG.sourceDir, filePath);
      const ext = path.extname(filePath).toLowerCase();

      // For raster images, check cache with appropriate extension
      const isOgImage = relativePath.startsWith("og/");
      const cacheKey = CONFIG.svgExtensions.includes(ext)
        ? relativePath
        : isOgImage
          ? relativePath // Keep original extension for og/ images
          : relativePath.replace(/\.[^/.]+$/, ".webp");

      const destPath = await ensureDestPath(filePath);

      process.stdout.write(`Processing ${relativePath}... `);

      // Check if optimization is needed
      if (!(await needsOptimization(filePath, cacheKey))) {
        console.log("⏭️  Skipped (already optimized)");
        stats.skipped++;
        continue;
      }

      let result;

      if (CONFIG.svgExtensions.includes(ext)) {
        result = await optimizeSvg(filePath, destPath);
      } else {
        result = await optimizeRasterImage(filePath, destPath);
      }

      if (!result.success) {
        console.log(`❌ Error: ${result.error}`);
        stats.errors++;
      } else {
        // Update cache
        await updateCache(filePath, cacheKey);

        if (result.savings > 0) {
          console.log(
            `✅ Optimized! ${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)} (${result.percent}% saved)`,
          );
          stats.optimized++;
          stats.totalSavings += result.savings;
        } else {
          console.log(`✅ Copied (no optimization needed)`);
          stats.optimized++;
        }
      }
    }

    // Save cache
    await saveCache();

    // Print summary
    console.log("\n📊 Optimization Summary:");
    console.log("=".repeat(50));
    console.log(`Total images: ${stats.totalImages}`);
    console.log(`Optimized: ${stats.optimized}`);
    console.log(`Skipped (cached): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);

    if (stats.totalSavings > 0) {
      console.log(
        `\n💾 Total space saved: ${formatFileSize(stats.totalSavings)}`,
      );
    }

    console.log(`\n📁 Optimized images saved to: ${CONFIG.destDir}`);
    console.log("✅ Image optimization complete!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the script
main();
