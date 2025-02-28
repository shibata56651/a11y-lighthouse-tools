'use client'

import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, Typography, Box, Card, CardContent } from "@mui/material";

const Page = () => {
  const [urls, setUrls] = useState([""]);
  const [results, setResults] = useState([]);

  const handleAddUrl = () => setUrls([...urls, ""]);
  const handleRemoveUrl = (index: number) => setUrls(urls.filter((_, i) => i !== index));
  const handleChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleEvaluate = async () => {
    try {
      const response = await axios.post("/api", { urls }, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("✅ API Response:", response.data); // ✅ APIのレスポンスを確認
      setResults(response.data);
    } catch (error) {
      console.error("❌ API Request Error:", error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Lighthouse Evaluation Tool
      </Typography>
      <Box mb={2}>
        {urls.map((url, index) => (
          <Box display="flex" alignItems="center" mb={1} key={url}>
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
        <Typography variant="h5">Results</Typography>
        {results.map((result: {
					url: string;
					performance: number;
					seo: number;
					pwa: number | string;
				}, index) => (
          <Card key={result.url} variant="outlined" style={{ marginTop: 8 }}>
            <CardContent>
              <Typography variant="h6">{result.url}</Typography>
              <Typography>Performance: {result.performance}</Typography>
              <Typography>SEO: {result.seo}</Typography>
              <Typography>PWA: {result.pwa}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default Page;