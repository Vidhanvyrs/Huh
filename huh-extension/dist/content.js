// content.js — injected into every YouTube watch page (ISOLATED world)
// Communicates with page_script.js (MAIN world) via postMessage

console.log('[Huh? Content Script] Loaded on:', window.location.href);

// ============================================================
// BRIDGE: Load page_script.js into the PAGE context via script.src
// ============================================================

const injectPageScript = () => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page_script.js');
    script.onload = () => {
        console.log('[Huh? Content Script] page_script.js injected successfully');
        script.remove();
    };
    script.onerror = (e) => {
        console.error('[Huh? Content Script] Failed to inject page_script.js:', e);
    };
    (document.head || document.documentElement).appendChild(script);
};

// Inject immediately
injectPageScript();

// ============================================================
// Fetch transcript by delegating to page_script.js (MAIN world)
// page_script.js has full cookie access — content script does not
// ============================================================

const fetchTranscriptFromPage = (startTime, endTime, contextWindow = 30) => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            window.removeEventListener('message', handler);
            reject(new Error('Transcript fetch timed out.'));
        }, 8000);

        const handler = (event) => {
            if (event.data?.type !== '__HUH_TRANSCRIPT_RESULT__') return;
            clearTimeout(timeout);
            window.removeEventListener('message', handler);

            if (event.data.success) {
                resolve(event.data.transcriptText);
            } else {
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', handler);
        window.postMessage({
            type: '__HUH_FETCH_TRANSCRIPT__',
            startTime,
            endTime,
            contextWindow
        }, '*');
    });
};

// ============================================================
// Main explain function
// ============================================================

const explainSegment = async (startTime, endTime, level = 'beginner') => {
    console.log('[Huh?] explainSegment called:', { startTime, endTime, level });

    // Delegate fetch to page_script.js which runs in MAIN world with cookies
    const transcript = await fetchTranscriptFromPage(startTime, endTime);
    console.log('[Huh?] Got transcript, length:', transcript.length);

    let response;
    try {
        response = await fetch('http://localhost:3000/api/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript, level }) // NOTE: key is "transcript"
        });
    } catch (networkError) {
        throw new Error('Failed to reach backend. Make sure to run `npm run dev`!');
    }

    if (!response.ok) {
        let errMsg = `Backend error ${response.status}`;
        try {
            const err = await response.json();
            errMsg = err.error || errMsg;
        } catch (_) { }
        throw new Error(errMsg);
    }

    return response.json();
};

// ============================================================
// Message Listener — handles messages from the popup
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Huh? Content Script] Message received:', message.type);

    if (message.type === 'GET_VIDEO_INFO') {
        const video = document.querySelector('video');
        if (video) {
            const info = {
                duration: Math.floor(video.duration) || 0,
                currentTime: Math.floor(video.currentTime) || 0,
            };
            console.log('[Huh?] Video info:', info);
            sendResponse({ success: true, data: info });
        } else {
            console.warn('[Huh?] No video element found');
            sendResponse({ success: false, error: 'No video element found on page.' });
        }
        return false;
    }

    if (message.type === 'EXPLAIN_SEGMENT') {
        explainSegment(message.startTime, message.endTime, message.level)
            .then(data => sendResponse({ success: true, data }))
            .catch(err => {
                console.error('[Huh?] explainSegment error:', err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }
});