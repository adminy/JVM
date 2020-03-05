module.exports = () => {
    const threads = []
    const empty = []
    return {
        add: thread => {
            if (empty.length > 0) {
                const pid = empty.pop()
                threads[pid] = thread
                return pid
            } else return threads.push(thread) - 1
        },
        remove: pid => {
            empty.push(pid)
            threads[pid] = null
        },
        count: () => threads.length - empty.length,
        getThread: pid => threads[pid]
    }
}
