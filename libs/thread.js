module.exports = name => {
    const state = {
        type: 'thread',
        MIN_PRIORITY: 0,
        MAX_PRIORITY: 100,
        name: name || 'noname',
        priority: 50,
        setName: name => state.name = name,
        getName: () => state.name,
        setPriority: priority => state.priority = priority,
        getPriority: () => state.priority
        
    }
    return state   
}
