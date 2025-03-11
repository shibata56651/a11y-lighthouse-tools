'use client';

import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";

// Chart.js と react-chartjs-2 のインポート・登録
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// API から返ってくる Lighthouse 結果の型定義（必要に応じて拡張）
interface CategoryScores {
  performance: number | string;
  accessibility: number | string;
  bestPractices: number | string;
  seo: number | string;
}

interface AuditData {
  score: number | null;
  displayValue: string | null;
  title: string;
}

interface DiagnosticsData {
  type: string;
  items: any[];
}

interface LighthouseResult {
  url: string;
  categories: CategoryScores;
  audits: {
    firstContentfulPaint?: AuditData;
    largestContentfulPaint?: AuditData;
    totalBlockingTime?: AuditData;
    cumulativeLayoutShift?: AuditData;
    speedIndex?: AuditData;
    diagnostics?: DiagnosticsData;
  };
}

const Page = () => {
  const [urls, setUrls] = useState<string[]>([""]);
  const [results, setResults] = useState<LighthouseResult[]>([]);

  const handleAddUrl = () => setUrls([...urls, ""]);
  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };
  const handleChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleEvaluate = async () => {
    try {
      console.log("🚀 Sending API Request with URLs:", urls);
      const response = await axios.post("/api", { urls }, {
        headers: { "Content-Type": "application/json" }
      });
      console.log("✅ API Response:", response.data);
      setResults(response.data);
    } catch (error) {
      console.error("❌ API Request Error:", error);
    }
  };

  // カテゴリーごとに円グラフを描画するためのコンポーネント
  const ScorePieChart = ({ label, score }: { label: string; score: number }) => {
    const data = {
      labels: [label, "Remaining"],
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: ["#4caf50", "#e0e0e0"],
        },
      ],
    };

    return (
      <Box width={200} m={1}>
        <Typography variant="subtitle1" align="center">
          {label}: {score}%
        </Typography>
        <Pie data={data} />
      </Box>
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Lighthouse Evaluation Tool
      </Typography>
      <Box mb={2}>
        {urls.map((url, index) => (
          <Box key={index} display="flex" alignItems="center" mb={1}>
            <TextField
              fullWidth
              value={url}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Enter URL"
            />
            <Button onClick={() => handleRemoveUrl(index)} disabled={urls.length === 1}>
              Remove
            </Button>
          </Box>
        ))}
        <Button onClick={handleAddUrl}>Add URL</Button>
      </Box>
      <Button variant="contained" color="primary" onClick={handleEvaluate}>
        Start Evaluation
      </Button>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Results
        </Typography>
        {results.map((result, index) => (
          <Card key={index} variant="outlined" style={{ marginTop: 16 }}>
            <CardContent>
              <Typography variant="h6">{result.url}</Typography>
              <Typography variant="subtitle1">
                Performance: {result.categories.performance}%
              </Typography>
              <Typography variant="subtitle1">
                SEO: {result.categories.seo}%
              </Typography>
              <Typography variant="subtitle1">
                Accessibility: {result.categories.accessibility}%
              </Typography>
              <Typography variant="subtitle1">
                Best Practices: {result.categories.bestPractices}%
              </Typography>

              <Box display="flex" flexWrap="wrap" mt={2}>
                {typeof result.categories.performance === "number" && (
                  <ScorePieChart label="Performance" score={result.categories.performance as number} />
                )}
                {typeof result.categories.seo === "number" && (
                  <ScorePieChart label="SEO" score={result.categories.seo as number} />
                )}
                {typeof result.categories.accessibility === "number" && (
                  <ScorePieChart label="Accessibility" score={result.categories.accessibility as number} />
                )}
                {typeof result.categories.bestPractices === "number" && (
                  <ScorePieChart label="Best Practices" score={result.categories.bestPractices as number} />
                )}
              </Box>

              <Box mt={2}>
                <Typography variant="h6">Audit Details</Typography>
                {result.audits.firstContentfulPaint && (
                  <Typography variant="body2">
                    <strong>{result.audits.firstContentfulPaint.title}</strong>: {result.audits.firstContentfulPaint.displayValue} (Score: {(result.audits.firstContentfulPaint.score || 0) * 100})
                  </Typography>
                )}
                {result.audits.largestContentfulPaint && (
                  <Typography variant="body2">
                    <strong>{result.audits.largestContentfulPaint.title}</strong>: {result.audits.largestContentfulPaint.displayValue} (Score: {(result.audits.largestContentfulPaint.score || 0) * 100})
                  </Typography>
                )}
                {result.audits.totalBlockingTime && (
                  <Typography variant="body2">
                    <strong>{result.audits.totalBlockingTime.title}</strong>: {result.audits.totalBlockingTime.displayValue} (Score: {(result.audits.totalBlockingTime.score || 0) * 100})
                  </Typography>
                )}
                {result.audits.cumulativeLayoutShift && (
                  <Typography variant="body2">
                    <strong>{result.audits.cumulativeLayoutShift.title}</strong>: {result.audits.cumulativeLayoutShift.displayValue} (Score: {(result.audits.cumulativeLayoutShift.score || 0) * 100})
                  </Typography>
                )}
                {result.audits.speedIndex && (
                  <Typography variant="body2">
                    <strong>{result.audits.speedIndex.title}</strong>: {result.audits.speedIndex.displayValue} (Score: {(result.audits.speedIndex.score || 0) * 100})
                  </Typography>
                )}
              </Box>

              {result.audits.diagnostics && (
                <Box mt={2}>
                  <Typography variant="h6">Diagnostics</Typography>
                  <pre style={{ backgroundColor: "#f5f5f5", padding: "8px", overflowX: "auto" }}>
                    {JSON.stringify(result.audits.diagnostics, null, 2)}
                  </pre>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Page;
