const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

async function runLighthouse(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = { logLevel: "info", output: "json", port: chrome.port };
  const runnerResult = await lighthouse(url, options);

  const categories = runnerResult.lhr.categories;
  await chrome.kill();

  return {
    url,
    performance: categories.performance.score * 100,
    seo: categories.seo.score * 100,
    pwa: categories.pwa ? categories.pwa.score * 100 : "N/A",
  };
}

export default async function handler(req: { method: string; body: { urls: any; }; }, res: any) {
  if (req.method === "POST") {
    const { urls } = req.body;

    try {
      const results = await Promise.all(urls.map((url: string) => runLighthouse(url)));
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
