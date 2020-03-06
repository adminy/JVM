const INSTRUCTIONS = {
    nop:  () => {},
    aconst_null: o => o.stack.push(null),
    iconst_m1: o => o.stack.push(-1),
    iconst_0: o => o.stack.push(0),
    lconst_0: o => o.stack.push(0),
    fconst_0: o => o.stack.push(0),
    dconst_0: o => o.stack.push(0),
    iconst_1: o => o.stack.push(1),
    lconst_1: o => o.stack.push(1),
    fconst_1: o => o.stack.push(1),
    dconst_1: o => o.stack.push(1),
    iconst_2: o => o.stack.push(2),
    fconst_2: o => o.stack.push(2),
    iconst_3: o => o.stack.push(3),
    iconst_4: o => o.stack.push(4),
    iconst_5: o => o.stack.push(5),
    sipush: o => o.stack.push(o.read16()),
    bipush: o => o.stack.push(o.read8()),
    ldc: o => o.stack.push(o.constPool[o.constPool[o.read8()].string_index].bytes), //o.constPool[o.read8()].tag == o.TAGS['String']
    ldc_w: o => o.stack.push(o.constPool[o.constPool[o.read16()].string_index].bytes), //o.constPool[o.read16()].tag == o.TAGS['String']
    ldc2_w: o => (constant => ({ //constant.tag == o.TAGS['String', 'Long', 'Double']
        [o.TAGS.get('String')]: constant => o.stack.push(o.constPool[constant.string_index].bytes),
        [o.TAGS.get('Long')]: constant => o.stack.push(Numeric.getLong(constant.bytes)),
        [o.TAGS.get('Double')]: constant => o.stack.push(constant.bytes.readDoubleBE(0)),
    })[constant.tag](constant))(o.constPool[o.read16()]),
    iload_0: o => o.stack.push(o.locals[0]),
    lload_0: o => o.stack.push(o.locals[0]),
    fload_0: o => o.stack.push(o.locals[0]),
    dload_0: o => o.stack.push(o.locals[0]),
    aload_0: o => o.stack.push(o.locals[0]),
    iload_1: o => o.stack.push(o.locals[1]),
    lload_1: o => o.stack.push(o.locals[1]),
    fload_1: o => o.stack.push(o.locals[1]),
    dload_1: o => o.stack.push(o.locals[1]),
    aload_1: o => o.stack.push(o.locals[1]),
    iload_2: o => o.stack.push(o.locals[2]),
    lload_2: o => o.stack.push(o.locals[2]),
    fload_2: o => o.stack.push(o.locals[2]),
    dload_2: o => o.stack.push(o.locals[2]),
    aload_2: o => o.stack.push(o.locals[2]),
    iload_3: o => o.stack.push(o.locals[3]),
    lload_3: o => o.stack.push(o.locals[3]),
    fload_3: o => o.stack.push(o.locals[3]),
    dload_3: o => o.stack.push(o.locals[3]),
    aload_3: o => o.stack.push(o.locals[3]),
    istore_0: o => o.locals[0] = o.stack.pop(),
    lstore_0: o => o.locals[0] = o.stack.pop(),
    fstore_0: o => o.locals[0] = o.stack.pop(),
    dstore_0: o => o.locals[0] = o.stack.pop(),
    astore_0: o => o.locals[0] = o.stack.pop(),
    istore_1: o => o.locals[1] = o.stack.pop(),
    lstore_1: o => o.locals[1] = o.stack.pop(),
    fstore_1: o => o.locals[1] = o.stack.pop(),
    dstore_1: o => o.locals[1] = o.stack.pop(),
    astore_1: o => o.locals[1] = o.stack.pop(),
    istore_2: o => o.locals[2] = o.stack.pop(),
    lstore_2: o => o.locals[2] = o.stack.pop(),
    fstore_2: o => o.locals[2] = o.stack.pop(),
    dstore_2: o => o.locals[2] = o.stack.pop(),
    astore_2: o => o.locals[2] = o.stack.pop(),
    istore_3: o => o.locals[3] = o.stack.pop(),
    lstore_3: o => o.locals[3] = o.stack.pop(),
    fstore_3: o => o.locals[3] = o.stack.pop(),
    dstore_3: o => o.locals[3] = o.stack.pop(),
    astore_3: o => o.locals[3] = o.stack.pop(),
    pop: o => o.stack.pop(),
    pop2: o => o.stack.pop(),
    iadd: o => o.stack.push(o.stack.pop() + o.stack.pop()),
    ladd: o => o.stack.push(o.stack.pop() + o.stack.pop()),
    dadd: o => o.stack.push(o.stack.pop() + o.stack.pop()),
    fadd: o => o.stack.push(o.stack.pop() + o.stack.pop()),
    isub: o => o.stack.push(- o.stack.pop() + o.stack.pop()),
    lsub: o => o.stack.push(- o.stack.pop() + o.stack.pop()),
    dsub: o => o.stack.push(- o.stack.pop() + o.stack.pop()),
    fsub: o => o.stack.push(- o.stack.pop() + o.stack.pop()),
    imul: o => o.stack.push(o.stack.pop() * o.stack.pop()),
    lmul: o => o.stack.push(o.stack.pop() * o.stack.pop()),
    dmul: o => o.stack.push(o.stack.pop() * o.stack.pop()),
    fmul: o => o.stack.push(o.stack.pop() * o.stack.pop()),
    dup: o => {
        const val = o.stack.pop()
        o.stack.push(val)
        o.stack.push(val)
    },
    dup_x1: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        o.stack.push(val1)
        o.stack.push(val2)
        o.stack.push(val1)
    },
    dup_x2: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        const val3 = o.stack.pop()
        o.stack.push(val1)
        o.stack.push(val3)
        o.stack.push(val2)    
        o.stack.push(val1)
    },
    dup2: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        o.stack.push(val2)
        o.stack.push(val1)
        o.stack.push(val2)
        o.stack.push(val1)
    },
    dup2_x1: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        const val3 = o.stack.pop()
        o.stack.push(val2)
        o.stack.push(val1)
        o.stack.push(val3)
        o.stack.push(val2)
        o.stack.push(val1)
    },
    dup2_x2: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        const val3 = o.stack.pop()
        const val4 = o.stack.pop()
        o.stack.push(val2)
        o.stack.push(val1)
        o.stack.push(val4)
        o.stack.push(val3)
        o.stack.push(val2)
        o.stack.push(val1)
    },
    swap: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        o.stack.push(val1)
        o.stack.push(val2)
    },
    iinc: o => {
        const idx = o.widened ? o.read16() : o.read8()
        const val = o.widened ? o.read16() : o.read8()
        o.locals[idx] += val
        o.widened = false
    },
    ineg: o => o.stack.push(-o.stack.pop()),
    lneg: o => o.stack.push(-o.stack.pop()),
    dneg: o => o.stack.push(-o.stack.pop()),
    fneg: o => o.stack.push(-o.stack.pop()),
    iand:  o => o.stack.push(o.stack.pop() & o.stack.pop()),
    land:  o => o.stack.push(o.stack.pop() & o.stack.pop()),
    ior:  o => o.stack.push(o.stack.pop() | o.stack.pop()),
    lor: o => o.stack.push(o.stack.pop() | o.stack.pop()),
    ixor: o => o.stack.push(o.stack.pop() ^ o.stack.pop()),
    lxor: o => o.stack.push(o.stack.pop() ^ o.stack.pop()),
    lcmp: o => {
        const val1 = o.stack.pop()
        const val2 = o.stack.pop()
        o.stack.push(val2 > val1 ? 1 : ((val2 < val1) ? -1 : 0))
    },
    newarray: o => {
        const type = o.read8()
        const size = o.stack.pop()
        size < 0 ? o.throw(CLASSES.newException('java/lang/NegativeSizeException')) : o.stack.push(Array(size))
    },
    anewarray: o => {
        const idx = o.read16()
        const className = o.constPool[o.constPool[idx].name_index].bytes
        const size = o.stack.pop()
        size < 0 ? o.throw(CLASSES.newException('java/lang/NegativeSizeException')) : o.stack.push(Array(size))
    },
    multianewarray: o => {
        const type = o.constPool[o.constPool[o.read16()].name_index].bytes
        const createMultiArray = lengths => lengths.length === 0 ? null : Array(lengths.shift()).fill(0).map(_ => createMultiArray(lengths))
        o.stack.push(createMultiArray(Array(o.read8()).fill(0).map(_ => o.stack.pop())))
    },
    arraylength: o => o.stack.push(o.stack.pop().length),
    if_icmpeq: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        const ref1 = o.stack.pop()
        const ref2 = o.stack.pop()
        o.ip = ref1 === ref2 ? jmp : o.ip
    },
    if_icmpne: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        const ref1 = o.stack.pop()
        const ref2 = o.stack.pop()
        o.ip = ref1 !== ref2 ? jmp : o.ip
    },
    if_icmpgt: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        const ref1 = o.stack.pop()
        const ref2 = o.stack.pop()
        o.ip = ref1 < ref2 ? jmp : o.ip
    },
    if_icmple: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() >= o.stack.pop() ? jmp : o.ip
    },
    if_icmplt: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() > o.stack.pop() ? jmp : o.ip
    },
    if_icmpge: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() <= o.stack.pop() ? jmp : o.ip
    },
    if_acmpeq: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() === o.stack.pop() ? jmp : o.ip
    },
    if_acmpne: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() !== o.stack.pop() ? jmp : o.ip
    },
    ifne: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() !== 0 ? jmp : o.ip
    },
    ifeq: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() === 0 ? jmp : o.ip
    },
    iflt: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() < 0 ? jmp : o.ip
    },
    ifge: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() >= 0 ? jmp : o.ip
    },
    ifgt: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() > 0 ? jmp : o.ip
    },
    ifle: o => {
        const jmp = o.ip - 1 + o.Numeric.getInt(o.read16())
        o.ip = o.stack.pop() <= 0 ? jmp : o.ip
    },
    i2l: () => {},
    i2f: () => {},
    i2d: () => {},
    i2b: () => {},
    i2c: () => {},
    i2s: () => {},
    l2i: () => {},
    l2d: () => {},
    l2f: () => {},
    d2i: () => {},
    d2l: () => {},
    d2f: () => {},
    f2d: () => {},
    f2i: () => {},
    f2l: () => {},
    goto: o => o.ip += o.Numeric.getInt(o.read16()) - 1,
    goto_w: o => o.ip += o.Numeric.getInt(o.read32()) - 1,
    ifnull: o => !o.stack.pop() && (o.ip += o.Numeric.getInt(o.read16()) - 1),
    ifnonnull: o => !!o.stack.pop() && (o.ip += o.Numeric.getInt(o.read16()) - 1),
    putfield: o => {
        const idx = o.read16()
        const fieldName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const val = o.stack.pop()
        const obj = o.stack.pop()
        !obj ? o.throw(o.CLASSES.newException("java/lang/NullPointerException")) : (obj[fieldName] = val)
    },
    getfield: o => {
        const idx = o.read16()
        const fieldName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const obj = o.stack.pop()
        !obj ? o.throw(o.CLASSES.newException("java/lang/NullPointerException")) : o.stack.push(obj[fieldName])
    },
    new: o => {
        const idx = o.read16()
        const className = o.constPool[o.constPool[idx].name_index].bytes
        o.stack.push(o.CLASSES.newObject(className))
    },
    getstatic: o => {    
        const idx = o.read16()
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const fieldName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        o.stack.push(o.CLASSES.getStaticField(className, fieldName))
    },
    putstatic: o => {
        const idx = o.read16()
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const fieldName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        o.CLASSES.setStaticField(className, fieldName, o.stack.pop())
    },
    invokestatic: o => { //TODO: come back and fix bugs?
        const idx = o.read16()        
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const methodName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const signature = o.Signature.parse(o.constPool[o.constPool[o.constPool[idx].name_and_type_index].signature_index].bytes)
        const args = []
        for(const obj of signature.IN)
            args.push(o.stack.pop()) && (!obj.isArray && ['long', 'double'].indexOf(obj.type) !== -1 ? args.push('') : 0)
        
        const method = o.CLASSES.getStaticMethod(className, methodName, signature)
        if(method && method.type == 'frame') {
            method.pid = o.pid
            const res = method.run(args)
            signature.OUT.length != 0 && o.stack.push(res)
        } else {
            const res = method.apply(null, args)
            signature.OUT.length != 0 && o.stack.push(res)
        }
    },
    invokevirtual: o => {
        const idx = o.read16()        
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const methodName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const signature = o.Signature.parse(o.constPool[o.constPool[o.constPool[idx].name_and_type_index].signature_index].bytes)
        const args = []
        for(const obj of signature.IN)
            args.push(o.stack.pop()) && (!obj.isArray && ['long', 'double'].indexOf(obj.type) !== -1 ? args.push('') : 0)

        const instance = o.stack.pop()
        const method = o.CLASSES.getMethod(className, methodName, signature)
        if(method && method.type == 'frame') {
            args.unshift(instance)
            method.pid = o.pid
            const res = method.run(args)
            signature.OUT.length != 0 && o.stack.push(res)
        } else {
            const res = method.apply(instance, args)
            signature.OUT.length != 0 && o.stack.push(res)
        }
    },
    invokespecial: o => {
        const idx = o.read16()        
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const methodName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const signature = o.Signature.parse(o.constPool[o.constPool[o.constPool[idx].name_and_type_index].signature_index].bytes)
        const args = []
        for(const obj of signature.IN)
            args.push(o.stack.pop()) && (!obj.isArray && ['long', 'double'].indexOf(obj.type) !== -1 ? args.push('') : 0)

        const instance = o.stack.pop()
        const ctor = o.CLASSES.getMethod(className, methodName, signature)
        
        if(ctor && ctor.type == 'frame') {
            args.unshift(instance)
            ctor.pid = o.pid
            ctor.run(args)
        } else ctor.apply(instance, args);
    },
    invokeinterface: o => {
        const idx = o.read16()
        const argsNumber = o.read8()
        const zero = o.read8()
        
        const className = o.constPool[o.constPool[o.constPool[idx].class_index].name_index].bytes
        const methodName = o.constPool[o.constPool[o.constPool[idx].name_and_type_index].name_index].bytes
        const signature = Signature.parse(o.constPool[o.constPool[o.constPool[idx].name_and_type_index].signature_index].bytes)
        
        const args = []
        for(const obj of signature.IN)
            args.push(o.stack.pop()) && (!obj.isArray && ['long', 'double'].indexOf(obj.type) !== -1 ? args.push('') : 0)

        const instance = o.stack.pop()
        
        if(instance[methodName] && instance[methodName].type == 'frame') {
            args.unshift(instance)
            instance[methodName].pid = pid
            const res = instance[methodName].run(args)
            signature.OUT.length != 0 && o.stack.push(res)
        } else {
            const res = instance[methodName].apply(instance, args);
            signature.OUT.length != 0 && o.stack.push(res)
        }
    },
    jsr: o => {
        const jmp = o.read16()
        o.stack.push(o.ip)
        o.ip = jmp
    },
    jsr_w: o => {
        const jmp = o.read32()
        o.stack.push(o.ip)
        o.ip = jmp
    },
    ret: o => {   
        o.ip = o.locals[o.widened ? o.read16() : o.read8()]
        o.widened = false
    },
    tableswitch: o => {
        const startip = o.ip
        while (( o.ip % 4) != 0) o.ip++
        const def = o.read32()
        const low = o.read32()
        const high = o.read32()
        const val = o.stack.pop()    
        const jmp = (val < low || val > high) ? def : [o.ip  += (val - low) << 2, o.read32()][1]
        o.ip = startip - 1 + o.Numeric.getInt(jmp)
    },
    lookupswitch: o => {
        const startip = o.ip
        while (( o.ip % 4) != 0) o.ip++
        let jmp = o.read32()
        const size = o.read32()
        const val = o.stack.pop()
        lookup:
            for(let i = 0; i < size; i++) {
                const key = o.read32()
                const offset = o.read32()
                if (key === val) jmp = offset
                if (key >= val) break lookup    
            }
        o.ip = startip - 1 + o.Numeric.getInt(jmp)
    },
    instanceof: o => {
        const idx = o.read16()
        const className = o.constPool[o.constPool[idx].name_index].bytes
        const obj = o.stack.pop()
        o.stack.push(obj.getClassName() === className)
    },
    checkcast: o => o.constPool[o.constPool[o.read16()].name_index].bytes, //type
    athrow: o => o.throw(o.stack.pop()),
    wide: o => o.widened = true,
    monitorenter: o => {
        const obj = stack.pop()
        !obj ? o.throw(o.CLASSES.newException('java/lang/NullPointerException')) : 
            (obj.hasOwnProperty("$lock$") ? o.stack.push(obj) && o.ip-- : (obj['$lock$'] = 'locked'))
        // SCHEDULER.yield()
    },
    monitorexit: o => {
        const obj = o.stack.pop()
        !obj ? o.throw(CLASSES.newException("java/lang/NullPointerException")) : (delete obj["$lock$"])
        // SCHEDULER.yield()
    }
}
INSTRUCTIONS.iload = INSTRUCTIONS.lload = INSTRUCTIONS.fload = INSTRUCTIONS.dload = INSTRUCTIONS.aload = o =>
    o.widened = !o.stack.push(o.locals[o.widened ? o.read16() : o.read8()])
INSTRUCTIONS.iaload = INSTRUCTIONS.laload = INSTRUCTIONS.faload = INSTRUCTIONS.daload = INSTRUCTIONS.aaload =
    INSTRUCTIONS.baload = INSTRUCTIONS.caload = INSTRUCTIONS.saload = o => {
        const idx = o.stack.pop()
        const refArray = o.stack.pop()
        const ex = !refArray ? o.CLASSES.newException("java/lang/NullPointerException") : ((idx < 0 || idx >= refArray.length) ? o.CLASSES.newException('java/lang/ArrayIndexOutOfBoundsException', idx) : null)
        ex ? o.throw(ex) : o.stack.push(refArray[idx])
    }
INSTRUCTIONS.istore = INSTRUCTIONS.lstore = INSTRUCTIONS.fstore = INSTRUCTIONS.dstore = INSTRUCTIONS.astore = o =>
    o.locals[o.widened ? o.read16() : o.read8()] = o.stack.pop(o.widened = false)

INSTRUCTIONS.iastore = INSTRUCTIONS.lastore = INSTRUCTIONS.fastore = INSTRUCTIONS.dastore = INSTRUCTIONS.aastore =
    INSTRUCTIONS.bastore = INSTRUCTIONS.castore = INSTRUCTIONS.sastore = o => {
        const val = o.stack.pop()
        const idx = o.stack.pop()
        const refArray = o.stack.pop()
        const ex = !refArray ? CLASSES.newException('java/lang/NullPointerException') : ((idx < 0 || idx >= refArray.length) ? CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx) : null)
        ex ? o.throw(ex) : (refArray[idx] = val)
    }

INSTRUCTIONS.idiv = INSTRUCTIONS.ldiv = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    (val1 === 0) ? o.throw(o.CLASSES.newException("java/lang/ArithmeticException")) : o.stack.push(val2 / val1)
}

INSTRUCTIONS.ddiv = INSTRUCTIONS.fdiv = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(val2 / val1)
}
INSTRUCTIONS.irem = INSTRUCTIONS.lrem = INSTRUCTIONS.drem = INSTRUCTIONS.frem = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(val2 % val1)
}
INSTRUCTIONS.ishl = INSTRUCTIONS.lshl = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(val2 << val1)
}
INSTRUCTIONS.ishr = INSTRUCTIONS.lshr = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(val2 >> val1)
}
INSTRUCTIONS.iushr = INSTRUCTIONS.lushr = o => {
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(val2 >>> val1)
}

INSTRUCTIONS.fcmpl = INSTRUCTIONS.dcmpl = INSTRUCTIONS.fcmpg = INSTRUCTIONS.dcmpg = o => { //isNaN is 1 on the last 2 instructions
    const val1 = o.stack.pop()
    const val2 = o.stack.pop()
    o.stack.push(isNaN(val1) || isNaN(val2) ? -1 : ((val2 > val1) ? 1 : ((val2 < val1) ? -1 : 0)))
}

const imports = {
    Numeric: require('./util/numeric'),
    Signature: require('./classfile/signature'),
    TAGS: require('./classfile/tags')
}

module.exports = (classArea, method) => {
    const constPool = classArea.getConstantPool()
    const attr = method.attributes.filter(x => x.info.type === 'Code')[0]

    const state = {
        type: 'frame', //instanceof Replacement
        code: attr.info.code,
        exceptionTable: attr.info.exception_table,
        pid: 0, //default main thread
        ip: 0,
        stack: [],
        widened: false,
        locals: Array(attr.info.max_locals),
        constPool, CLASSES, //<---- TODO: fix
        MAX_LOCALS: attr.info.max_locals,
        ...imports,
        read8: () => state.code[state.ip++],
        read16: () => state.read8() << 8 | state.read8(),
        read32: () => state.read16() << 16 | state.read16(),
        stackPush: (...args) => args.forEach(state.stack.push),
        throw: ex => { 
            const exception = state.exceptionTable.filter(exception => state.ip >= exception.start_pc && state.ip <= exception.end_pc &&
                (exception.catch_type === 0 || state.constPool[state.constPool[exception.catch_type].name_index].bytes === ex.getClassName()))[0]
            if(exception && exception.handler_pc) {
                state.stack.push(ex)
                state.ip = exception.handler_pc
            } else throw ex
        },
        run: args => {
            state.locals = args.map(x => x)
            const opCode = state.read8()
            if(opCode === OPCODES.return) return
            else if([OPCODES.ireturn, OPCODES.lreturn, OPCODES.freturn, OPCODES.dreturn, OPCODES.areturn].includes(opCode)) return state.stack.pop()
            else {
                const opName = OPCODES.toString(opCode)                    
                if (!(opName in INSTRUCTIONS)) throw new Error(`Opcode ${opName} [${opCode}] is not supported.`)
                INSTRUCTIONS[opName](state)
            }
        }
    }
    return state
}
