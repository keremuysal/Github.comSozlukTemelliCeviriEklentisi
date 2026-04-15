let githubDictionary = {};

async function loadDictionary() {
  try {
    const response = await fetch(chrome.runtime.getURL('dictionary.json'));
    if (!response.ok) throw new Error(`Failed to load dictionary: ${response.status}`);
    const data = await response.json();
    Object.assign(githubDictionary, data);
    initializeRegexPatterns();
  } catch (error) {
    console.error('Dictionary loading failed:', error);
    initializeRegexPatterns();
  }
}

loadDictionary();

const SKIP_TAGS = new Set([
  "CODE", "PRE", "SAMP", "TT", "KBD",
  "SCRIPT", "STYLE", "TEXTAREA", "INPUT",
  "NOSCRIPT", "IFRAME", "SVG", "MATH"
]);

const PROCESSED_ATTR = "data-gtr-done";
let extensionEnabled = true;


function initializeRegexPatterns() {
  const sortedEntries = Object.entries(githubDictionary).sort(
    ([a], [b]) => b.length - a.length
  );

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const combinedPattern = "(^|\\s|[^\\p{L}\\p{N}])(" + 
    sortedEntries
    .map(([key]) => escapeRegExp(key))
    .join("|") + 
  ")(?=\\s|[^\\p{L}\\p{N}]|$)";

  masterRegex = new RegExp(combinedPattern, "giu");
  dictMap = new Map(sortedEntries.map(([key, value]) => [key.toLowerCase(), value]));

  window.masterRegex = masterRegex;
  window.dictMap = dictMap;

  console.log("✅ Dictionary patterns initialized with", sortedEntries.length, "entries");

  if (extensionEnabled && document.body) {
    translateSubtree(document.body);
  }
}

let masterRegex = null;
let dictMap = null;
const nodeSourceText = new WeakMap();
const nodeLastTranslatedText = new WeakMap();

function isInsideSkippedTag(node) {
  let el = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.nodeName)) return true;
    el = el.parentElement;
  }
  return false;
}

function translateTextNode(node) {
  if (!extensionEnabled || !dictMap || !masterRegex) return;
  const currentValue = node.nodeValue;
  if (!currentValue || !currentValue.trim()) return;

  const lastTranslated = nodeLastTranslatedText.get(node);
  if (lastTranslated !== undefined && currentValue === lastTranslated) return;

  let sourceValue = nodeSourceText.get(node);
  if (sourceValue === undefined || currentValue !== lastTranslated) {
    sourceValue = currentValue;
    nodeSourceText.set(node, sourceValue);
  }

  masterRegex.lastIndex = 0;
  const result = sourceValue.replace(masterRegex, (match, prefix, word) => {
    const translated = dictMap.get(word.toLowerCase());
    return translated ? prefix + translated : match;
  });

  nodeLastTranslatedText.set(node, result);

  if (result !== currentValue) {
    node.nodeValue = result;
  }
}

function translateSubtree(root) {
  if (root.nodeType === Node.ELEMENT_NODE && root !== document.body && root.hasAttribute(PROCESSED_ATTR)) return;
  
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (isInsideSkippedTag(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  const nodes = [];
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  for (const textNode of nodes) {
    translateTextNode(textNode);
  }
  
  if (root.nodeType === Node.ELEMENT_NODE) root.setAttribute(PROCESSED_ATTR, "1");
}

let debounceTimer = null;
const pendingNodes = new Set();

function scheduleTranslation(nodes) {
  nodes.forEach((n) => pendingNodes.add(n));
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    for (const node of pendingNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!isInsideSkippedTag(node)) translateTextNode(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        translateSubtree(node);
      }
    }
    pendingNodes.clear();
  }, 100);
}

const observer = new MutationObserver((mutations) => {
  const newNodes = [];
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => newNodes.push(node));
    } else if (mutation.type === "characterData") {
      newNodes.push(mutation.target);
    }
  }
  if (newNodes.length > 0) scheduleTranslation(newNodes);
});

function init() {
  console.log("🔧 Extension init()", { extensionEnabled });
  if (!extensionEnabled) {
    console.log("❌ Extension disabled - observer only");
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    return;
  }
  console.log("✅ Extension enabled - starting translation");
  translateSubtree(document.body);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function initializeExtension() {
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    const shouldBeEnabled = result.extensionEnabled !== false;
    console.log("🚀 initializeExtension:", { shouldBeEnabled, stored: result });
    extensionEnabled = shouldBeEnabled;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init());
    } else {
      init();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}

console.log("📡 Content script loaded - dictionary based translation ready");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDictSize') {
    const dictSize = Object.keys(githubDictionary).length;
    sendResponse({ dictSize: dictSize + '+' });
    return true;
  }
  
  if (message.action === 'setEnabled') {
    extensionEnabled = message.enabled;
    if (extensionEnabled) {
      translateSubtree(document.body);
    }
    sendResponse({ success: true });
    return true;
  }
});

