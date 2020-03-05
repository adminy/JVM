module.exports = {
    getByte: v => {
        n = parseInt(v, 10) & 0xff
        if (n > 0x7F) {
            n = -((n & 0x7F) ^ 0x7F) - 1
        }
        return n
    },
    getInt: v => {
        n = parseInt(v, 10) & 0xffff
        if (n > 0x7FFF) {
            n = -((n & 0x7FFF) ^ 0x7FFF) - 1
        }
        return n
    },
    getLong: bytes => {
        var l = 0
        for(var i = 0; i < 8; i++) {
            l <<= 8
            l ^= bytes[i] & 0xFF
        }
        return l
    }
}
