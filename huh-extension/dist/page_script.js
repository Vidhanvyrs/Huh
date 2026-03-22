// page_script.js — runs in the PAGE context (not isolated world)
// This file is loaded via script.src to bypass YouTube's CSP
(function () {
    // ── helpers ──────────────────────────────────────────────────────────────

    const decodeEntities = (str) =>
        str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
            .replace(/\n| /g, ' ').replace(/\s+/g, ' ').trim();

    const parseJson3 = (data, paddedStart, paddedEnd) => {
        return (data.events || [])
            .filter(e => e.segs && e.tStartMs != null)
            .filter(e => {
                const end = e.tStartMs + (e.dDurationMs || 2000);
                return end >= paddedStart * 1000 && e.tStartMs <= paddedEnd * 1000;
            })
            .flatMap(e => e.segs.map(s => s.utf8 || ''))
            .join(' ').replace(/\s+/g, ' ').trim();
    };

    const parseXml = (xml, paddedStart, paddedEnd) => {
        const results = [];
        const re = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>(.*?)<\/text>/gi;
        let m;
        while ((m = re.exec(xml)) !== null) {
            const start = parseFloat(m[1]);
            const dur = m[2] ? parseFloat(m[2]) : 2.0;
            if (start + dur >= paddedStart && start <= paddedEnd) {
                const text = decodeEntities(m[3].replace(/<[^>]+>/g, ''));
                if (text) results.push(text);
            }
        }
        return results.join(' ').trim();
    };

    const getBestTrack = (tracks) =>
        tracks.find(t => t.languageCode === 'en' && !t.kind) ||
        tracks.find(t => t.languageCode === 'en') ||
        tracks[0];

    // ── transcript fetcher (runs in PAGE context — full cookie access) ────────

    const fetchTranscriptText = async (tracks, startTime, endTime, contextWindow = 30) => {
        const track = getBestTrack(tracks);
        if (!track?.baseUrl) throw new Error('No valid caption track found.');

        const paddedStart = Math.max(0, startTime - contextWindow);
        const paddedEnd = endTime + contextWindow;

        // Try json3 first (richer, more reliable), fall back to raw XML
        const attempts = [
            { url: track.baseUrl + '&fmt=json3', fmt: 'json3' },
            { url: track.baseUrl, fmt: 'xml' },
        ];

        for (const { url, fmt } of attempts) {
            try {
                const res = await fetch(url, {
                    credentials: 'include',          // sends YouTube session cookies
                    headers: { 'Accept': '*/*' },
                });

                if (!res.ok) {
                    console.warn(`[Huh?] ${fmt} fetch returned ${res.status}`);
                    continue;
                }

                const body = await res.text();
                if (!body?.trim()) {
                    console.warn(`[Huh?] ${fmt} response was empty`);
                    continue;
                }

                console.log(`[Huh?] Got ${fmt} response, length=${body.length}`);

                let text = '';
                if (fmt === 'json3') {
                    try {
                        text = parseJson3(JSON.parse(body), paddedStart, paddedEnd);
                    } catch (e) {
                        console.warn('[Huh?] json3 parse failed, will try xml:', e.message);
                        continue;
                    }
                } else {
                    text = parseXml(body, paddedStart, paddedEnd);
                }

                if (text) return text;
                console.warn(`[Huh?] ${fmt} parsed but no text in time range`);

            } catch (e) {
                console.warn(`[Huh?] ${fmt} attempt threw:`, e.message);
            }
        }

        throw new Error('Could not fetch transcript for this video segment. This video might have restricted captions.');
    };

    // ── caption track discovery (unchanged) ──────────────────────────────────

    const getCaptionTracks = () => {
        let tracks = null;

        try {
            tracks = window.ytInitialPlayerResponse
                ?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null;
            if (tracks) console.log('[Huh?] ✔ captions via ytInitialPlayerResponse:', tracks.length);
        } catch (e) { console.warn('[Huh?] ytInitialPlayerResponse failed:', e.message); }

        if (!tracks) {
            try {
                const player = document.querySelector('#movie_player');
                if (typeof player?.getPlayerResponse === 'function') {
                    tracks = player.getPlayerResponse()
                        ?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null;
                    if (tracks) console.log('[Huh?] ✔ captions via movie_player:', tracks.length);
                }
            } catch (e) { console.warn('[Huh?] movie_player failed:', e.message); }
        }

        if (!tracks) {
            try {
                for (const script of document.querySelectorAll('script')) {
                    const m = script.textContent?.match(/"captionTracks":(\[.*?\])/);
                    if (m) {
                        tracks = JSON.parse(m[1]);
                        console.log('[Huh?] ✔ captions via script tag:', tracks.length);
                        break;
                    }
                }
            } catch (e) { console.warn('[Huh?] script tag parse failed:', e.message); }
        }

        if (!tracks) console.warn('[Huh?] ✘ No captions found');
        return tracks;
    };

    const sendCaptionData = () => {
        window.postMessage({
            type: '__HUH_CAPTION_DATA__',
            tracks: getCaptionTracks()
        }, '*');
    };

    // ── message handler ───────────────────────────────────────────────────────

    window.addEventListener('message', async (event) => {
        if (event.source !== window) return;

        if (event.data?.type === '__HUH_REQUEST_CAPTIONS__') {
            sendCaptionData();
        }

        // NEW: content script asks us to fetch + parse transcript directly
        if (event.data?.type === '__HUH_FETCH_TRANSCRIPT__') {
            const { startTime, endTime, contextWindow } = event.data;
            const tracks = getCaptionTracks();

            if (!tracks?.length) {
                window.postMessage({
                    type: '__HUH_TRANSCRIPT_RESULT__',
                    success: false,
                    error: 'No caption tracks found for this video.'
                }, '*');
                return;
            }

            try {
                const transcriptText = await fetchTranscriptText(
                    tracks, startTime, endTime, contextWindow ?? 30
                );
                window.postMessage({
                    type: '__HUH_TRANSCRIPT_RESULT__',
                    success: true,
                    transcriptText
                }, '*');
            } catch (e) {
                window.postMessage({
                    type: '__HUH_TRANSCRIPT_RESULT__',
                    success: false,
                    error: e.message
                }, '*');
            }
        }
    });

    // Run immediately + on SPA navigation
    sendCaptionData();
    document.addEventListener('yt-navigate-finish', sendCaptionData);
})();