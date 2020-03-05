module.exports = (bytes, offset) => {
    offset = offset || 0
    return {
        read8: () => bytes.readUInt8(offset++),
        read16: () => {
            const data = bytes.readUInt16BE(offset)
            offset += 2
            return data
        },
        read32: () => {
            const data = bytes.readUInt32BE(offset)
            offset += 4
            return data
        },
        readString: length => {
            const data = bytes.toString(undefined, offset, offset + length)
            offset += length
            return data
        },
        readBytes: length => {
            const data = bytes.slice(offset, offset + length)
            offset += length
            return data
        }
    }
}
