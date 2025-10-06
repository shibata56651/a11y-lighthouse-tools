// DevTools script to create custom panel
chrome.devtools.panels.create(
  "Lighthouse Audit",
  "icon.png",
  "panel.html",
  function(panel) {
    console.log("Lighthouse DevTools panel created");
    
    // Panel shown/hidden events
    panel.onShown.addListener(function(panelWindow) {
      console.log("Panel shown");
      // Initialize panel when shown
      panelWindow.initializePanel();
    });
    
    panel.onHidden.addListener(function() {
      console.log("Panel hidden");
    });
  }
);