export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { launch, LaunchedChrome, Launcher } from "chrome-launcher";

async function runLighthouse(url: string) {
  let chrome: LaunchedChrome | null = null;
  let chromePath = "/usr/bin/chromium";

  try {
    console.log(`🚀 Running Lighthouse for: ${url}`);

    if (!url || typeof url !== "string" || url.trim() === "") {
      throw new Error(`Invalid URL received: ${JSON.stringify(url)}`);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      throw new Error(`Failed to parse URL: ${url}`);
    }

    console.log("🔍 Parsed URL:", parsedUrl.href);
    console.log("✅ Environment CHROME_PATH:", process.env.CHROME_PATH);

    const lighthouse = await import("lighthouse").then(mod => mod.default);

    // Chromium の起動（固定ポート9222で起動）
    chrome = await launch({
      chromePath,
      port: 9222, // launch() のオプションで固定ポートを指定
      ignoreDefaultFlags: true,
      chromeFlags: [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    console.log("✅ Chrome Debugging Port (from launcher):", chrome.port);
    if (!chrome?.port) {
      throw new Error("❌ Chrome did not start correctly");
    }

    // Chrome DevTools が完全に起動するまでポーリングで待機
    await waitForChrome(chrome.port);

    // Lighthouse のオプション：実際のポート（chrome.port は9222に固定されるはず）
    const options = {
      logLevel: "info" as const,
      output: "json" as const,
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
    };

    console.log("✅ Lighthouse Options:", JSON.stringify(options, null, 2));

    const config = { extends: "lighthouse:default" };
    console.log("✅ Running Lighthouse with:", parsedUrl.href);

    const runnerResult = await lighthouse(parsedUrl.href, options, config);

    if (!runnerResult?.lhr?.categories) {
      throw new Error(`❌ Lighthouse did not return a valid result for ${parsedUrl.href}`);
    }

    console.log("✅ Lighthouse result received for:", parsedUrl.href);

    // カテゴリごとの集計スコア（百分率）を算出
    const categories = {
      performance: runnerResult.lhr.categories.performance.score ? runnerResult.lhr.categories.performance.score * 100 : "N/A",
      accessibility: runnerResult.lhr.categories.accessibility.score ? runnerResult.lhr.categories.accessibility.score * 100 : "N/A",
      bestPractices: runnerResult.lhr.categories["best-practices"].score ? runnerResult.lhr.categories["best-practices"].score * 100 : "N/A",
      seo: runnerResult.lhr.categories.seo.score ? runnerResult.lhr.categories.seo.score * 100 : "N/A",
    };

    // パフォーマンス指標（個別監査）の抽出例
    const audits = {
      firstContentfulPaint: {
        score: runnerResult.lhr.audits["first-contentful-paint"]?.score,
        displayValue: runnerResult.lhr.audits["first-contentful-paint"]?.displayValue,
        title: "First Contentful Paint (FCP):",
      },
      largestContentfulPaint: {
        score: runnerResult.lhr.audits["largest-contentful-paint"]?.score,
        displayValue: runnerResult.lhr.audits["largest-contentful-paint"]?.displayValue,
        title: "Largest Contentful Paint (LCP):",
      },
      totalBlockingTime: {
        score: runnerResult.lhr.audits["total-blocking-time"]?.score,
        displayValue: runnerResult.lhr.audits["total-blocking-time"]?.displayValue,
        title: "Total Blocking Time (TBT):",
      },
      cumulativeLayoutShift: {
        score: runnerResult.lhr.audits["cumulative-layout-shift"]?.score,
        displayValue: runnerResult.lhr.audits["cumulative-layout-shift"]?.displayValue,
        title: "Cumulative Layout Shift (CLS):",
      },
      speedIndex: {
        score: runnerResult.lhr.audits["speed-index"]?.score,
        displayValue: runnerResult.lhr.audits["speed-index"]?.displayValue,
        title: "Speed Index (SI):",
      },
    };

    // API のレスポンスとして返すデータを構築
    return {
      url: parsedUrl.href,
      categories,
      audits,
    };
  } catch (error) {
    console.error("❌ Lighthouse execution failed:", error);
  } finally {
    if (chrome) {
      await chrome.kill();
      console.log("🛑 Chrome instance closed");
    }
  }
}

const waitForChrome = async (port: number, timeout = 15000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        console.log("✅ Chrome DevTools is ready on port", port);
        return;
      }
    } catch (e) {
      // 応答が得られなかった場合は何もしない
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Chrome DevTools did not become ready within ${timeout}ms on port ${port}`);
};

export async function POST(req: NextRequest) {
  try {
    console.log("🌍 API HIT: /api");
    const body = await req.json();
    console.log("🔍 Request Body:", body);

    if (!body || !body.urls || !Array.isArray(body.urls)) {
      return NextResponse.json({ error: "Invalid request body: expected { urls: string[] }" }, { status: 400 });
    }

    const validUrls = body.urls.filter((url: string) => typeof url === "string" && url.trim() !== "");
    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No valid URLs provided" }, { status: 400 });
    }

    const results = await Promise.all(validUrls.map((url: string) => runLighthouse(url)));
    console.log("✅ Lighthouse Results:", results);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      { status: 500 }
    );
  }
}
