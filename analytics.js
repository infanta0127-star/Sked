(function() {
    let eventQueue = [];
    let sessionId = null;

    function getSessionId() {
        if (!sessionId) {
            sessionId = sessionStorage.getItem('sked_analytics_session');
            if (!sessionId) {
                sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
                    ? crypto.randomUUID() 
                    : 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
                sessionStorage.setItem('sked_analytics_session', sessionId);
            }
        }
        return sessionId;
    }

    async function flushQueue() {
        const sb = window.supabaseClient;
        if (!sb || eventQueue.length === 0) return;

        const queueToProcess = [...eventQueue];
        eventQueue = [];

        try {
            let userId = null;
            try {
                const { data: { session } } = await sb.auth.getSession();
                userId = session?.user?.id || null;
            } catch (authErr) {
                // Ignore auth failures for anonymous tracking
            }

            const payloads = queueToProcess.map(ev => ({
                user_id: userId,
                session_id: getSessionId(),
                event_category: ev.category,
                event_name: ev.name,
                event_data: ev.data,
                created_at: ev.timestamp
            }));

            const { error } = await sb.from('analytics_events').insert(payloads);
            if (error) {
                console.error('[Analytics] Failed to upload events, returning to queue:', error);
                eventQueue = [...queueToProcess, ...eventQueue];
            }
        } catch (err) {
            console.error('[Analytics] Error uploading events:', err);
            eventQueue = [...queueToProcess, ...eventQueue];
        }
    }

    // Public tracking function exposed on window
    window.trackEvent = function(category, name, data = {}) {
        const isLocal = typeof window !== 'undefined' && window.location && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '0.0.0.0' ||
            window.location.protocol === 'file:'
        );

        let eventData = (typeof data === 'object' && data !== null) ? { ...data } : { detail: data };
        if (isLocal) {
            eventData.is_local = true;
        }

        const ev = {
            category,
            name,
            data: eventData,
            timestamp: new Date().toISOString()
        };
        
        eventQueue.push(ev);
        
        if (window.supabaseClient) {
            flushQueue();
        }
    };

    // Periodically check if Supabase is initialized to flush initial page load queue
    const initInterval = setInterval(() => {
        if (window.supabaseClient) {
            clearInterval(initInterval);
            flushQueue();
        }
    }, 500);
})();
