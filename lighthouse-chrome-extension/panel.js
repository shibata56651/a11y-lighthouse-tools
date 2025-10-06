// Panel JavaScript - migrated from React component
let urls = [""];
let results = [];

// Initialize panel when shown
function initializePanel() {
    console.log("Panel initialized");
    updateUrlInputs();
    loadPreviousResults();
    
    // Add event listeners to buttons
    const addUrlBtn = document.getElementById('addUrlBtn');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (addUrlBtn) {
        addUrlBtn.addEventListener('click', addUrl);
        console.log('Add URL button listener attached');
    }
    
    if (evaluateBtn) {
        evaluateBtn.addEventListener('click', startEvaluation);
        console.log('Evaluate button listener attached');
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
        console.log('Export button listener attached');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearResults);
        console.log('Clear button listener attached');
    }
}

// Add new URL input
function addUrl() {
    urls.push("");
    updateUrlInputs();
}

// Remove URL input
function removeUrl(index) {
    if (urls.length > 1) {
        urls.splice(index, 1);
        updateUrlInputs();
    }
}

// Handle URL input changes
function handleUrlChange(index, value) {
    urls[index] = value;
}

// Update URL inputs in DOM
function updateUrlInputs() {
    const container = document.getElementById('urlInputs');
    container.innerHTML = '';
    
    urls.forEach((url, index) => {
        const group = document.createElement('div');
        group.className = 'url-input-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'url-input';
        input.placeholder = 'Enter URL';
        input.value = url;
        input.addEventListener('input', (e) => handleUrlChange(index, e.target.value));
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.disabled = urls.length === 1;
        removeBtn.addEventListener('click', () => removeUrl(index));
        
        group.appendChild(input);
        group.appendChild(removeBtn);
        container.appendChild(group);
    });
}

// Start Lighthouse evaluation
async function startEvaluation() {
    const evaluateBtn = document.getElementById('evaluateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Validate URLs
    const validUrls = urls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
        alert('Please enter at least one URL');
        return;
    }
    
    // Show loading state
    evaluateBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    
    try {
        const success = safeChrome(async () => {
            try {
                // Get current tab ID
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                const tabId = tabs[0].id;
                
                // Send message to background script to run Lighthouse
                const response = await new Promise((resolve, reject) => {
                    chrome.runtime.sendMessage({
                        type: 'RUN_LIGHTHOUSE',
                        urls: validUrls,
                        tabId: tabId
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    });
                });
                
                if (response && response.success) {
                    results = response.results;
                    displayResults();
                    saveResults();
                } else {
                    const errorMsg = response ? response.error : 'Unknown error occurred';
                    console.error('Lighthouse evaluation failed:', errorMsg);
                    alert('Evaluation failed: ' + errorMsg);
                }
                
            } catch (error) {
                console.error('Error during evaluation:', error);
                alert('Error during evaluation: ' + error.message);
            }
        });
        
        if (!success) {
            alert('Extension context unavailable. Please refresh this DevTools panel and try again.');
        }
    } finally {
        // Hide loading state
        evaluateBtn.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

// Display results in DOM
function displayResults() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p>No results to display</p>';
        return;
    }
    
    results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = result.error ? 'result-card error' : 'result-card';
        
        const urlDiv = document.createElement('div');
        urlDiv.className = 'result-url';
        urlDiv.textContent = result.url;
        
        // Add timestamp if available
        if (result.timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'result-timestamp';
            timeDiv.textContent = `Audited: ${new Date(result.timestamp).toLocaleString()}`;
            card.appendChild(urlDiv);
            card.appendChild(timeDiv);
        } else {
            card.appendChild(urlDiv);
        }
        
        if (result.error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = `Error: ${result.error}`;
            card.appendChild(errorDiv);
        } else {
            // Scores section
            const scoresDiv = document.createElement('div');
            scoresDiv.className = 'result-scores';
            
            // Performance score
            const perfItem = createScoreItem('Performance', result.performance);
            scoresDiv.appendChild(perfItem);
            
            // SEO score
            const seoItem = createScoreItem('SEO', result.seo);
            scoresDiv.appendChild(seoItem);
            
            // PWA score
            const pwaItem = createScoreItem('PWA', result.pwa);
            scoresDiv.appendChild(pwaItem);
            
            card.appendChild(scoresDiv);
            
            // Core Web Vitals section
            if (result.coreWebVitals) {
                const vitalsToggle = document.createElement('button');
                vitalsToggle.className = 'vitals-toggle';
                vitalsToggle.textContent = 'Core Web Vitals';
                vitalsToggle.addEventListener('click', () => toggleSection(`vitals-${index}`));
                
                const vitalsDiv = document.createElement('div');
                vitalsDiv.className = 'core-web-vitals';
                vitalsDiv.id = `vitals-${index}`;
                vitalsDiv.style.display = 'none';
                
                Object.entries(result.coreWebVitals).forEach(([key, vital]) => {
                    if (vital.value !== null && vital.value !== '測定不可') {
                        const vitalItem = createVitalItem(key.toUpperCase(), vital);
                        vitalsDiv.appendChild(vitalItem);
                    }
                });
                
                card.appendChild(vitalsToggle);
                card.appendChild(vitalsDiv);
            }
            
            // Insights section
            if (result.insights && result.insights.length > 0) {
                const insightsToggle = document.createElement('button');
                insightsToggle.className = 'insights-toggle';
                insightsToggle.textContent = `インサイト (${result.insights.length})`;
                insightsToggle.addEventListener('click', () => toggleSection(`insights-${index}`));
                
                const insightsDiv = document.createElement('div');
                insightsDiv.className = 'insights-section';
                insightsDiv.id = `insights-${index}`;
                insightsDiv.style.display = 'none';
                
                result.insights.forEach(insight => {
                    const insightItem = createInsightItem(insight);
                    insightsDiv.appendChild(insightItem);
                });
                
                card.appendChild(insightsToggle);
                card.appendChild(insightsDiv);
            }
            
            // Diagnostics section
            if (result.diagnostics && result.diagnostics.length > 0) {
                const diagnosticsToggle = document.createElement('button');
                diagnosticsToggle.className = 'diagnostics-toggle';
                diagnosticsToggle.textContent = `診断 (${result.diagnostics.length})`;
                diagnosticsToggle.addEventListener('click', () => toggleSection(`diagnostics-${index}`));
                
                const diagnosticsDiv = document.createElement('div');
                diagnosticsDiv.className = 'diagnostics-section';
                diagnosticsDiv.id = `diagnostics-${index}`;
                diagnosticsDiv.style.display = 'none';
                
                result.diagnostics.forEach(diagnostic => {
                    const diagnosticItem = createDiagnosticItem(diagnostic);
                    diagnosticsDiv.appendChild(diagnosticItem);
                });
                
                card.appendChild(diagnosticsToggle);
                card.appendChild(diagnosticsDiv);
            }
            
            // Metrics section (if available)
            if (result.metrics) {
                const metricsToggle = document.createElement('button');
                metricsToggle.className = 'metrics-toggle';
                metricsToggle.textContent = '技術的メトリクス';
                metricsToggle.addEventListener('click', () => toggleSection(`metrics-${index}`));
                
                const metricsDiv = document.createElement('div');
                metricsDiv.className = 'result-metrics';
                metricsDiv.id = `metrics-${index}`;
                metricsDiv.style.display = 'none';
                
                // Load time
                if (result.metrics.loadTime) {
                    const loadTimeItem = createMetricItem('ロード時間', `${result.metrics.loadTime}ms`);
                    metricsDiv.appendChild(loadTimeItem);
                }
                
                // DOM Content Loaded
                if (result.metrics.domContentLoaded) {
                    const domItem = createMetricItem('DOM読み込み完了時間', `${result.metrics.domContentLoaded}ms`);
                    metricsDiv.appendChild(domItem);
                }
                
                // First Paint
                if (result.metrics.firstPaint) {
                    const fpItem = createMetricItem('ファーストペイント - 描画時間', `${result.metrics.firstPaint}ms`);
                    metricsDiv.appendChild(fpItem);
                }
                
                // First Contentful Paint
                if (result.metrics.firstContentfulPaint) {
                    const fcpItem = createMetricItem('ファーストコンテンツフルペイント - 最初のテキストや画像が表示されるまでの時間', `${result.metrics.firstContentfulPaint}ms`);
                    metricsDiv.appendChild(fcpItem);
                }
                
                // Largest Contentful Paint
                if (result.metrics.largestContentfulPaint) {
                    const lcpItem = createMetricItem('ラージェストコンテンツフルペイント - 最も大きなテキストや画像が表示されるまでの時間', `${result.metrics.largestContentfulPaint}ms`);
                    metricsDiv.appendChild(lcpItem);
                }
                
                // Cumulative Layout Shift
                if (result.metrics.cumulativeLayoutShift !== undefined) {
                    const clsItem = createMetricItem('累積レイアウトシフト - ページ読み込み中の視覚的な安定性', result.metrics.cumulativeLayoutShift);
                    metricsDiv.appendChild(clsItem);
                }
                
                // Total Resources
                if (result.metrics.totalResources) {
                    const resourcesItem = createMetricItem('総リソース数', result.metrics.totalResources);
                    metricsDiv.appendChild(resourcesItem);
                }
                
                // Total Size
                if (result.metrics.totalSize) {
                    const sizeItem = createMetricItem('総サイズ', `${result.metrics.totalSize} KB`);
                    metricsDiv.appendChild(sizeItem);
                }
                
                // CSS Size
                if (result.metrics.cssSize) {
                    const cssItem = createMetricItem('CSSサイズ', `${result.metrics.cssSize} KB`);
                    metricsDiv.appendChild(cssItem);
                }
                
                // JS Size
                if (result.metrics.jsSize) {
                    const jsItem = createMetricItem('JavaScriptサイズ', `${result.metrics.jsSize} KB`);
                    metricsDiv.appendChild(jsItem);
                }
                
                card.appendChild(metricsToggle);
                card.appendChild(metricsDiv);
            }
        }
        
        container.appendChild(card);
    });
}

// Create score item element
function createScoreItem(label, value) {
    const item = document.createElement('div');
    item.className = 'score-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'score-label';
    labelSpan.textContent = label + ':';
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'score-value';
    
    if (typeof value === 'number') {
        valueSpan.textContent = Math.round(value);
        
        // Add color coding based on score
        if (value >= 90) {
            valueSpan.classList.add('good');
        } else if (value >= 50) {
            valueSpan.classList.add('average');
        } else {
            valueSpan.classList.add('poor');
        }
    } else {
        valueSpan.textContent = value;
    }
    
    item.appendChild(labelSpan);
    item.appendChild(valueSpan);
    
    return item;
}

// Save results to Chrome storage
function saveResults() {
    safeChrome(() => {
        chrome.storage.local.set({
            'lighthouseResults': results,
            'lighthouseUrls': urls
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Failed to save results:', chrome.runtime.lastError.message);
            } else {
                console.log('Results saved to storage');
            }
        });
    });
}

// Load previous results from Chrome storage
function loadPreviousResults() {
    safeChrome(() => {
        chrome.storage.local.get(['lighthouseResults', 'lighthouseUrls'], (data) => {
            if (chrome.runtime.lastError) {
                console.error('Failed to load previous results:', chrome.runtime.lastError.message);
                return;
            }
            
            if (data.lighthouseResults) {
                results = data.lighthouseResults;
                displayResults();
            }
            if (data.lighthouseUrls) {
                urls = data.lighthouseUrls;
                updateUrlInputs();
            }
        });
    });
}

// Create metric item element
function createMetricItem(label, value) {
    const item = document.createElement('div');
    item.className = 'metric-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'metric-label';
    labelSpan.textContent = label + ':';
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'metric-value';
    valueSpan.textContent = value;
    
    item.appendChild(labelSpan);
    item.appendChild(valueSpan);
    
    return item;
}

// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggle = section.previousElementSibling;
    
    if (section.style.display === 'none') {
        section.style.display = 'block';
        toggle.classList.add('expanded');
    } else {
        section.style.display = 'none';
        toggle.classList.remove('expanded');
    }
}

// Legacy function for backward compatibility
function toggleMetrics(index) {
    toggleSection(`metrics-${index}`);
}

// Create Core Web Vital item
function createVitalItem(name, vital) {
    const item = document.createElement('div');
    item.className = `vital-item ${vital.rating}`;
    
    const header = document.createElement('div');
    header.className = 'vital-header';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'vital-name';
    nameSpan.textContent = name;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'vital-value';
    valueSpan.textContent = typeof vital.value === 'number' ? `${vital.value}ms` : vital.value;
    
    const ratingSpan = document.createElement('span');
    ratingSpan.className = `vital-rating ${vital.rating}`;
    const ratingText = vital.rating === 'good' ? '良好' : 
                      vital.rating === 'needs-improvement' ? '要改善' : 
                      vital.rating === 'poor' ? '悪い' : '';
    ratingSpan.textContent = ratingText;
    
    header.appendChild(nameSpan);
    header.appendChild(valueSpan);
    header.appendChild(ratingSpan);
    
    const description = document.createElement('div');
    description.className = 'vital-description';
    description.textContent = vital.description;
    
    item.appendChild(header);
    item.appendChild(description);
    
    return item;
}

// Create insight item
function createInsightItem(insight) {
    const item = document.createElement('div');
    item.className = `insight-item ${insight.type}`;
    
    const header = document.createElement('div');
    header.className = 'insight-header';
    
    const metricSpan = document.createElement('span');
    metricSpan.className = 'insight-metric';
    metricSpan.textContent = insight.metric;
    
    const typeSpan = document.createElement('span');
    typeSpan.className = `insight-type ${insight.type}`;
    const typeText = insight.type === 'error' ? 'エラー' : 
                    insight.type === 'warning' ? '警告' : 
                    insight.type === 'info' ? '情報' : insight.type;
    typeSpan.textContent = typeText;
    
    header.appendChild(metricSpan);
    header.appendChild(typeSpan);
    
    const message = document.createElement('div');
    message.className = 'insight-message';
    message.textContent = insight.message;
    
    const suggestion = document.createElement('div');
    suggestion.className = 'insight-suggestion';
    suggestion.textContent = `💡 ${insight.suggestion}`;
    
    item.appendChild(header);
    item.appendChild(message);
    item.appendChild(suggestion);
    
    return item;
}

// Create diagnostic item
function createDiagnosticItem(diagnostic) {
    const item = document.createElement('div');
    item.className = `diagnostic-item ${diagnostic.type}`;
    
    const header = document.createElement('div');
    header.className = 'diagnostic-header';
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'diagnostic-title';
    titleSpan.textContent = diagnostic.title;
    
    const typeSpan = document.createElement('span');
    typeSpan.className = `diagnostic-type ${diagnostic.type}`;
    const typeText = diagnostic.type === 'optimization' ? '最適化' : 
                    diagnostic.type === 'seo' ? 'SEO' : 
                    diagnostic.type === 'accessibility' ? 'アクセシビリティ' : diagnostic.type;
    typeSpan.textContent = typeText;
    
    header.appendChild(titleSpan);
    header.appendChild(typeSpan);
    
    const description = document.createElement('div');
    description.className = 'diagnostic-description';
    description.textContent = diagnostic.description;
    
    const suggestion = document.createElement('div');
    suggestion.className = 'diagnostic-suggestion';
    suggestion.textContent = `🔧 ${diagnostic.suggestion}`;
    
    item.appendChild(header);
    item.appendChild(description);
    item.appendChild(suggestion);
    
    return item;
}

// Export results to JSON
function exportResults() {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lighthouse-results-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Clear all results
function clearResults() {
    results = [];
    displayResults();
    
    safeChrome(() => {
        chrome.storage.local.remove(['lighthouseResults'], () => {
            if (chrome.runtime.lastError) {
                console.error('Failed to clear results from storage:', chrome.runtime.lastError.message);
            } else {
                console.log('Results cleared from storage');
            }
        });
    });
}

// Track if panel is already initialized
let isInitialized = false;

// Safe Chrome API wrapper
function safeChrome(callback) {
    try {
        if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
            console.warn('Chrome extension context not available');
            return false;
        }
        callback();
        return true;
    } catch (error) {
        console.error('Chrome API error:', error);
        return false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel DOM loaded');
    if (!isInitialized) {
        initializePanel();
        isInitialized = true;
    }
});

// Also initialize immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Wait for DOMContentLoaded
} else {
    // DOM is already loaded
    setTimeout(() => {
        if (!isInitialized) {
            initializePanel();
            isInitialized = true;
        }
    }, 100); // Small delay to ensure extension context is ready
}

// Functions are now only used via event listeners, no need for global exposure