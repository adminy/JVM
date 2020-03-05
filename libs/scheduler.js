const MODE = {
    NORMAL: 0,
    SYNC: 1,
    YIELD: 2
}
module.exports = () => {
    ticks = 0
    mode = MODE.NORMAL
    return {
        tick: (pid, fn) => ({
            [MODE.SYNC]: fn,
            [MODE.YIELD]: () => {
                mode = MODE.NORMAL
                ticks = 0
                (setImmediate || process.nextTick)(fn)
            },
            [MODE.NORMAL]: () => {
                if (++ticks > THREADS.getThread(pid).getPriority()) {
                    ticks = 0
                    (setImmediate || process.nextTick)(fn)
                } else fn()
            }
        })[mode](),
        yield: () => mode = MODE.YIELD,
        sync: fn => {
            mode = MODE.SYNC
            fn()
            mode = MODE.NORMAL
        }
    }
}
