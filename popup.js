document.addEventListener('DOMContentLoaded', () => {
  const dictSizeElement = document.getElementById('dictSize');
  const toggleSwitch = document.getElementById('toggleStatus');
  const statusBadge = document.querySelector('.status-badge');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  
  if (!toggleSwitch) {
    console.error('Toggle switch element not found!');
    return;
  }
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    const isEnabled = result.extensionEnabled !== false;
    toggleSwitch.checked = isEnabled;
    updateStatusDisplay(isEnabled);
  });
  toggleSwitch.addEventListener('change', handleToggleChange);
  toggleSwitch.addEventListener('click', function(e) {
    setTimeout(() => {
      handleToggleChange.call(this);
    }, 50);
  });
  
  function handleToggleChange(e) {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ extensionEnabled: isEnabled });
    updateStatusDisplay(isEnabled);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('github.com')) {
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { action: 'setEnabled', enabled: isEnabled },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log('Content script not responding');
            }
          }
        );
      }
    });
  }
  
  // Status display'i güncelle
  function updateStatusDisplay(isEnabled) {
    if (isEnabled) {
      statusBadge.classList.remove('inactive');
      statusDot.classList.remove('inactive');
      statusText.classList.remove('inactive');
      statusText.textContent = 'Aktif';
    } else {
      statusBadge.classList.add('inactive');
      statusDot.classList.add('inactive');
      statusText.classList.add('inactive');
      statusText.textContent = 'Pasif';
    }
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      dictSizeElement.textContent = '3600+';
      return;
    }
    
    const currentTab = tabs[0];
    if (!currentTab.url || !currentTab.url.includes('github.com')) {
      dictSizeElement.textContent = '3600+';
      return;
    }
    
    // Content script'e mesaj gönder
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: 'getDictSize' },
      (response) => {
        if (chrome.runtime.lastError) {
          dictSizeElement.textContent = '3600+';
          return;
        }
        
        if (response && response.dictSize) {
          dictSizeElement.textContent = response.dictSize;
        } else {
          dictSizeElement.textContent = '3600+';
        }
      }
    );
  });
});
