export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { launch } from "chrome-launcher";
import { RunnerResult } from "lighthouse";

async function runLighthouse(url: string) {
  try {
    console.log(`🚀 Running Lighthouse for: ${url}`);

    if (!url || typeof url !== "string") {
      console.error("❌ Invalid URL received:", JSON.stringify(url));
      throw new Error(`Invalid URL received: ${JSON.stringify(url)}`);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      console.error("❌ URL parsing failed:", error);
      throw new Error(`Failed to parse URL: ${url}`);
    }

    console.log("🔍 Parsed URL:", parsedUrl.href);

    const lighthouse = await import("lighthouse").then((mod) => mod.default);
    const chrome = await launch({ port: 9222, chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0"],
      chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });

    if (!chrome || !chrome.port) {
      console.error("❌ Chrome failed to launch");
      throw new Error("Chrome did not start correctly");
    }

    console.log("🚀 Chrome launched on port:", chrome.port);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // const options = { logLevel: "info" as "info", output: "json" as "json", port: Number(chrome.port) };
    const options = { logLevel: "info" as "info", output: "json" as "json", port: 9222 };

    console.log("🔍 Lighthouse options:", JSON.stringify(options, null, 2));

    let runnerResult: RunnerResult | undefined;

    try {
      runnerResult = await lighthouse(parsedUrl.href, options);
    } catch (error) {
      console.error("❌ Lighthouse execution failed:", error instanceof Error ? error.stack : error);
      throw new Error(`Lighthouse execution error: ${error instanceof Error ? error.message : error}`);
    }

    if (!runnerResult || !runnerResult.lhr || !runnerResult.lhr.categories) {
      console.error("❌ No valid Lighthouse result for:", parsedUrl.href);
      throw new Error("Lighthouse did not return a valid result");
    }

    console.log("✅ Lighthouse result received for:", parsedUrl.href);

    const categories = runnerResult.lhr.categories;

    const results = {
      url: parsedUrl.href,
      performance: categories.performance.score ? categories.performance.score * 100 : "N/A",
      seo: categories.seo.score ? categories.seo.score * 100 : "N/A",
      pwa: categories.pwa ? categories.pwa.score && categories.pwa.score * 100 : "N/A",
    };

    await chrome.kill();

    return results;

  } catch (error) {
    const chrome = await launch({ port: 9222, chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0"],
      chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const options = { logLevel: "info" as "info", output: "json" as "json", port: 9222 };

    console.error("❌ Lighthouse execution failed:", error instanceof Error ? error.stack : error);

    // return { url, error: `Lighthouse failed: ${error.message}` };

    return { url, error: `Lighthouse failed: ${error instanceof Error ? error.message : error}`, chromePort: `🚀 Chrome launched on port: ${chrome.port}`, options: `🔍 Lighthouse options: ${JSON.stringify(options, null, 2)}` };
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🌍 API HIT: /api");  // ✅ APIが呼ばれているか確認
    const body = await req.json();
    console.log("🔍 Request Body:", body);  // ✅ 受け取ったデータを確認

    if (!body.urls || !Array.isArray(body.urls)) {
      console.error("❌ Invalid request body", body);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const results = await Promise.all(body.urls.map((url: string) => {
      return runLighthouse(url);
    }));

    console.log("✅ Lighthouse Results:", results);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
