// background.js — runs in the extension background

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FETCH_TRANSCRIPT') {
        const fetchUrl = message.url;
        
        console.log('[Huh? Background] Fetching transcript from:', fetchUrl);

        fetch(fetchUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`YouTube API returned ${res.status}`);
                }
                return res.text();
            })
            .then(text => {
                if (!text || text.trim() === '') {
                    throw new Error('Received empty text from YouTube');
                }
                sendResponse({ success: true, text });
            })
            .catch(err => {
                console.error('[Huh? Background] Fetch error:', err);
                sendResponse({ success: false, error: err.message });
            });
            
        return true; // Keep channel open for async response
    }
});
