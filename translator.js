// translator.js

// Configuration object for available languages
const availableLanguages = {
    en: { name: 'English', nativeName: 'English' },
    te: { name: 'Telugu', nativeName: 'తెలుగు' }
    // Add more languages as needed
  };
  
  // Initialize translation system
  document.addEventListener('DOMContentLoaded', function() {
    // Add language switcher styles
    const style = document.createElement('style');
    style.textContent = `
      .language-switcher {
        position: relative;
        display: inline-block;
      }
  
      .language-switcher select {
        appearance: none;
        background: #1977cc;
        border: none;
        padding: 8px 35px 8px 15px;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: calc(100% - 8px) center;
      }
  
      .language-switcher select:hover {
        background-color: #166ab5;
      }
  
      .language-switcher select option {
        background: white;
        color: black;
      }
    `;
    document.head.appendChild(style);
  
    // Create and insert language switcher
    createLanguageSwitcher();
  
    // Initialize with saved or default language
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    document.getElementById('languageSelect').value = savedLang;
    if (savedLang !== 'en') {
      translatePage(savedLang);
    }
  });
  
  // Create language switcher dropdown
  function createLanguageSwitcher() {
    const languageSwitcher = document.createElement('div');
    languageSwitcher.className = 'language-switcher';
    
    const select = document.createElement('select');
    select.id = 'languageSelect';
    
    Object.entries(availableLanguages).forEach(([code, lang]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = lang.nativeName;
      select.appendChild(option);
    });
  
    select.addEventListener('change', async function() {
      const targetLang = this.value;
      localStorage.setItem('selectedLanguage', targetLang);
      if (targetLang !== 'en') {
        await translatePage(targetLang);
      } else {
        location.reload(); // Reload to get original English content
      }
    });
  
    languageSwitcher.appendChild(select);
  
    // Insert before the gravience button
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
      ctaBtn.parentNode.insertBefore(languageSwitcher, ctaBtn.nextSibling);
    }
  }
  
  // Function to translate the page
  async function translatePage(targetLang) {
    try {
      // Show loading indicator
      showLoadingOverlay();
  
      // Get all text nodes
      const textNodes = getTextNodes(document.body);
      
      for (const node of textNodes) {
        const text = node.textContent.trim();
        if (text && text.length > 1) { // Ignore empty or single-character texts
          try {
            const translatedText = await translateText(text, targetLang);
            if (translatedText) {
              node.textContent = translatedText;
            }
          } catch (error) {
            console.error('Translation error:', error);
          }
        }
      }
  
      // Update HTML lang attribute
      document.documentElement.lang = targetLang;
    } catch (error) {
      console.error('Page translation error:', error);
      alert('Translation failed. Please try again later.');
    } finally {
      // Hide loading indicator
      hideLoadingOverlay();
    }
  }
  
  // Function to get all text nodes
  function getTextNodes(element) {
    const textNodes = [];
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Ignore script and style contents
          if (node.parentElement.tagName === 'SCRIPT' || 
              node.parentElement.tagName === 'STYLE') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
  
    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }
  
  // Function to translate text using LibreTranslate
  async function translateText(text, targetLang) {
    // MyMemory Translation API (free, no authentication required)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text if translation fails
    }
}

// Add rate limiting to avoid hitting API limits
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Usage example:
const debouncedTranslate = debounce(async (text, targetLang) => {
    const result = await translateText(text, targetLang);
    return result;
}, 300);
  
  // Loading overlay functions
  function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'translationOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    const spinner = document.createElement('div');
    spinner.textContent = 'Translating...';
    spinner.style.cssText = `
      color: white;
      font-size: 20px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
    `;
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
  }
  
  function hideLoadingOverlay() {
    const overlay = document.getElementById('translationOverlay');
    if (overlay) {
      overlay.remove();
    }
  }