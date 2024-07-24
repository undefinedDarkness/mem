const triggerMap: Map<string, Set<() => void>> = new Map();

declare global {
    interface Window {
        internalBroadcast?: BroadcastChannel
     }
}


export function initBroadcastChannel() {
    if (window.internalBroadcast) return;
    window.internalBroadcast = new BroadcastChannel('internal');
    window.internalBroadcast.addEventListener('message', e => {
        console.log(`[utils/bc] Got trigger ${e.data}`)
        const cbs = triggerMap.get(e.data);
        cbs?.forEach(cb => cb()) 
    })
    console.log(`[utils/bc] Broadcast Channel Initiated 🚚`)
}

export function broadcast(key: string) {
    if (!window.internalBroadcast) {
        console.warn(`[utils/bc] Broadcast channel called without init!!`)
        return
    }
    console.info(`[utils/bc] Broadcasting ${key}`)
    window.internalBroadcast.postMessage(key);
}

export function onBroadcast(key: string, cb: () => void) {
    const v = triggerMap.get(key) ?? new Set()
    if (v.has(cb)) {
        console.warn(`[utils/bc] Listener for trigger ${key} already exists!`);
        return;
    }
    console.log(`[utils/bc] Added new listener for trigger ${key}`)
    v.add(cb)
    triggerMap.set(key, v) 
}