const checkFlag = flag => flags => (flags & flag) === flag
const ACCESS_FLAGS = {
    ACC_PUBLIC: 0x0001,
    ACC_PRIVATE: 0x0002,
    ACC_PROTECTED: 0x0004,
    ACC_STATIC: 0x0008,
    ACC_FINAL: 0x0010,
    ACC_SYNCHRONIZED: 0x0020,
    ACC_VOLATILE: 0x0040,
    ACC_TRANSIENT: 0x0080,
    ACC_NATIVE: 0x0100,
    ACC_INTERFACE: 0x0200,
    ACC_ABSTRACT: 0x0400
}
module.exports = {
    ...ACCESS_FLAGS,
    toString:       flags => Object.keys(ACCESS_FLAGS).filter(flag => ACCESS_FLAGS[flag] & flags === ACCESS_FLAGS[flag]).toString(),
    isPublic:       flags => checkFlag(ACCESS_FLAGS.ACC_PUBLIC)(flags),
    isPrivate:      flags => checkFlag(ACCESS_FLAGS.ACC_PRIVATE)(flags),
    isProtected:    flags => checkFlag(ACCESS_FLAGS.ACC_PROTECTED)(flags),
    isStatic:       flags => checkFlag(ACCESS_FLAGS.ACC_STATIC)(flags),
    isFinal:        flags => checkFlag(ACCESS_FLAGS.ACC_FINAL)(flags),
    isSynchronized: flags => checkFlag(ACCESS_FLAGS.ACC_SYNCHRONIZED)(flags),
    isVolatile:     flags => checkFlag(ACCESS_FLAGS.ACC_VOLATILE)(flags),
    isTransient:    flags => checkFlag(ACCESS_FLAGS.ACC_TRANSIENT)(flags),
    isNative:       flags => checkFlag(ACCESS_FLAGS.ACC_NATIVE)(flags),
    isInterface:    flags => checkFlag(ACCESS_FLAGS.ACC_INTERFACE)(flags),
    isAbstract:     flags => checkFlag(ACCESS_FLAGS.ACC_ABSTRACT)(flags)
}
