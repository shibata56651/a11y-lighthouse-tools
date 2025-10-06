// Audit script to be injected into pages
function performAudit() {
  try {
    // Use modern Performance API instead of deprecated timing
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (!navigation) {
      throw new Error("Navigation timing not available");
    }
    
    // Calculate load times using modern API
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    
    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint') || [];
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    // Calculate performance score (0-100)
    let performanceScore = 100;
    if (loadTime > 3000) performanceScore -= 30;
    if (loadTime > 5000) performanceScore -= 30;
    if (domContentLoaded > 1500) performanceScore -= 20;
    if (firstContentfulPaint && firstContentfulPaint.startTime > 2000) performanceScore -= 20;
    performanceScore = Math.max(0, performanceScore);
    
    // SEO checks
    let seoScore = 100;
    const title = document.querySelector('title');
    const metaDesc = document.querySelector('meta[name="description"]');
    const h1 = document.querySelector('h1');
    const viewport = document.querySelector('meta[name="viewport"]');
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    const htmlLang = document.querySelector('html[lang]');
    const canonical = document.querySelector('link[rel="canonical"]') || document.querySelector('meta[property="og:url"]');
    
    if (!title || title.textContent.length < 10) seoScore -= 20;
    if (!metaDesc) seoScore -= 20;
    if (!h1) seoScore -= 15;
    if (!viewport) seoScore -= 15;
    if (imagesWithoutAlt.length > 0) seoScore -= 10;
    if (!htmlLang) seoScore -= 10;
    if (!canonical) seoScore -= 10;
    seoScore = Math.max(0, seoScore);
    
    // PWA checks
    let pwaScore = 0;
    const manifest = document.querySelector('link[rel="manifest"]');
    const isHttps = window.location.protocol === 'https:';
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    if (manifest) pwaScore += 30;
    if (hasServiceWorker) pwaScore += 40;
    if (isHttps) pwaScore += 30;
    pwaScore = Math.min(100, pwaScore);
    
    // Resource metrics
    const resources = performance.getEntriesByType('resource') || [];
    const totalResources = resources.length;
    const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    
    // Core Web Vitals
    const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0];
    const layoutShifts = performance.getEntriesByType('layout-shift');
    const cumulativeLayoutShift = layoutShifts.reduce((sum, entry) => {
      if (!entry.hadRecentInput) {
        return sum + entry.value;
      }
      return sum;
    }, 0);
    
    // Performance insights and diagnostics
    const insights = [];
    const diagnostics = [];
    
    // FCP Analysis
    const fcpTime = firstContentfulPaint ? firstContentfulPaint.startTime : null;
    if (fcpTime) {
      if (fcpTime > 3000) {
        insights.push({
          type: 'warning',
          metric: 'FCP',
          message: 'ファーストコンテンツフルペイントが遅いです（3秒超）',
          suggestion: '重要なリソースを最適化し、サーバー応答時間を短縮してください'
        });
      } else if (fcpTime > 1800) {
        insights.push({
          type: 'info',
          metric: 'FCP',
          message: 'ファーストコンテンツフルペイントの改善が必要です（1.8秒超）',
          suggestion: 'フォントの読み込みとクリティカルCSSの最適化を検討してください'
        });
      }
    }
    
    // LCP Analysis
    const lcpTime = largestContentfulPaint ? largestContentfulPaint.startTime : null;
    if (lcpTime) {
      if (lcpTime > 4000) {
        insights.push({
          type: 'error',
          metric: 'LCP',
          message: 'ラージェストコンテンツフルペイントが非常に遅いです（4秒超）',
          suggestion: '最大要素の読み込みを最適化し、ファーストビュー外のコンテンツの遅延読み込みを検討してください'
        });
      } else if (lcpTime > 2500) {
        insights.push({
          type: 'warning',
          metric: 'LCP',
          message: 'ラージェストコンテンツフルペイントの改善が必要です（2.5秒超）',
          suggestion: '画像サイズを最適化し、効率的なキャッシュを実装してください'
        });
      }
    }
    
    // CLS Analysis
    if (cumulativeLayoutShift > 0.25) {
      insights.push({
        type: 'error',
        metric: 'CLS',
        message: '累積レイアウトシフトが大きすぎます（0.25超）',
        suggestion: '画像にサイズ属性を追加し、動的コンテンツのためのスペースを予約してください'
      });
    } else if (cumulativeLayoutShift > 0.1) {
      insights.push({
        type: 'warning',
        metric: 'CLS',
        message: '累積レイアウトシフトの改善が必要です（0.1超）',
        suggestion: '広告や動的コンテンツのためのスペースを確保してください'
      });
    }
    
    // Resource diagnostics
    const largeImages = resources.filter(r => 
      r.name.match(/\.(jpg|jpeg|png|webp|gif)$/i) && r.transferSize > 500000
    );
    if (largeImages.length > 0) {
      diagnostics.push({
        type: 'optimization',
        title: '大きな画像が検出されました',
        description: `500KB以上の画像が${largeImages.length}個見つかりました`,
        suggestion: '画像を圧縮し、WebPなどの最新フォーマットを使用してください'
      });
    }
    
    // CSS and JS analysis
    const cssFiles = resources.filter(r => r.name.includes('.css'));
    const jsFiles = resources.filter(r => r.name.includes('.js'));
    const totalCssSize = cssFiles.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalJsSize = jsFiles.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    if (totalCssSize > 1000000) {
      diagnostics.push({
        type: 'optimization',
        title: '大きなCSSバンドル',
        description: `CSS総サイズ: ${Math.round(totalCssSize / 1024)}KB`,
        suggestion: 'CSSを分割し、未使用スタイルを削除して、ファイルを圧縮してください'
      });
    }
    
    if (totalJsSize > 2000000) {
      diagnostics.push({
        type: 'optimization',
        title: '大きなJavaScriptバンドル',
        description: `JavaScript総サイズ: ${Math.round(totalJsSize / 1024)}KB`,
        suggestion: 'コード分割を実装し、未使用のJavaScriptを削除してください'
      });
    }
    
    // Too many requests
    if (totalResources > 100) {
      diagnostics.push({
        type: 'optimization',
        title: 'HTTPリクエスト数が多すぎます',
        description: `${totalResources}個のリクエストが検出されました`,
        suggestion: 'ファイルを結合し、HTTP/2を使用して、リソースバンドリングを実装してください'
      });
    }
    
    // SEO diagnostics
    if (!title || title.textContent.length < 10) {
      diagnostics.push({
        type: 'seo',
        title: 'タイトルが不足または短すぎます',
        description: 'ページタイトルが不足しているか短すぎます',
        suggestion: '説明的なタイトルを追加してください（50-60文字推奨）'
      });
    }
    
    if (!metaDesc) {
      diagnostics.push({
        type: 'seo',
        title: 'メタディスクリプションが不足しています',
        description: 'メタディスクリプションが設定されていません',
        suggestion: '魅力的なメタディスクリプションを追加してください（150-160文字推奨）'
      });
    }
    
    if (imagesWithoutAlt.length > 0) {
      diagnostics.push({
        type: 'accessibility',
        title: 'Alt属性が不足している画像があります',
        description: `alt属性のない画像が${imagesWithoutAlt.length}個あります`,
        suggestion: 'すべての画像に説明的なalt属性を追加してください'
      });
    }
    
    return {
      url: window.location.href,
      performance: Math.round(performanceScore),
      seo: Math.round(seoScore),
      pwa: Math.round(pwaScore),
      metrics: {
        loadTime: Math.round(loadTime || 0),
        domContentLoaded: Math.round(domContentLoaded || 0),
        firstPaint: firstPaint ? Math.round(firstPaint.startTime) : null,
        firstContentfulPaint: fcpTime ? Math.round(fcpTime) : null,
        largestContentfulPaint: lcpTime ? Math.round(lcpTime) : null,
        cumulativeLayoutShift: Math.round(cumulativeLayoutShift * 1000) / 1000,
        totalResources: totalResources,
        totalSize: Math.round(totalSize / 1024), // KB
        cssSize: Math.round(totalCssSize / 1024), // KB
        jsSize: Math.round(totalJsSize / 1024) // KB
      },
      insights: insights,
      diagnostics: diagnostics,
      coreWebVitals: {
        fcp: {
          value: fcpTime ? Math.round(fcpTime) : null,
          rating: fcpTime ? (fcpTime <= 1800 ? 'good' : fcpTime <= 3000 ? 'needs-improvement' : 'poor') : null,
          description: 'FCP: ファーストコンテンツフルペイント - 最初のテキストや画像が表示されるまでの時間'
        },
        lcp: {
          value: lcpTime ? Math.round(lcpTime) : null,
          rating: lcpTime ? (lcpTime <= 2500 ? 'good' : lcpTime <= 4000 ? 'needs-improvement' : 'poor') : null,
          description: 'LCP: ラージェストコンテンツフルペイント - 最も大きなテキストや画像が表示されるまでの時間'
        },
        cls: {
          value: Math.round(cumulativeLayoutShift * 1000) / 1000,
          rating: cumulativeLayoutShift <= 0.1 ? 'good' : cumulativeLayoutShift <= 0.25 ? 'needs-improvement' : 'poor',
          description: 'CLS: 累積レイアウトシフト - ページ読み込み中の視覚的な安定性'
        },
        si: {
          value: domContentLoaded ? Math.round(domContentLoaded) : null,
          rating: domContentLoaded ? (domContentLoaded <= 3400 ? 'good' : domContentLoaded <= 5800 ? 'needs-improvement' : 'poor') : null,
          description: 'SI: スピードインデックス - コンテンツが視覚的に表示される速度'
        },
        tbt: {
          value: '測定不可',
          rating: null,
          description: 'TBT: トータルブロッキングタイム - 長いタスクによってブロックされた総時間（ラボ環境が必要）'
        }
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Audit script error:", error);
    return {
      url: window.location.href,
      error: error.message,
      performance: "Error",
      seo: "Error", 
      pwa: "Error",
      timestamp: new Date().toISOString()
    };
  }
}

// Execute and return result
performAudit();