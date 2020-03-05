var Numeric = require("./util/numeric");
var Signature = require("./classfile/signature");

var TAGS = require("./classfile/tags")

var Frame = module.exports = function(classArea, method) {
    pid = 0 // default main thread
    this._cp = classArea.getConstantPool()
    locals = null
    for(var i=0; i<method.attributes.length; i++) {
        if (method.attributes[i].info.type === 'Code') {
            this._code = method.attributes[i].info.code;
            this._exception_table = method.attributes[i].info.exception_table;
            locals = Array(method.attributes[i].info.max_locals)
            break;
        }
    }

    this.setPid = processId => pid = processId
    this._read8 = () => this._code[this._ip++]
    this._read16 = () => this._read8()<<8 | this._read8()
    this._read32 = () => this._read16()<<16 | this._read16()
    this._throw = function(ex) { 
        var handler_pc = null;
    
        for(var i=0; i<this._exception_table.length; i++) {
            if (this._ip >= this._exception_table[i].start_pc && this._ip <= this._exception_table[i].end_pc) {
                if (this._exception_table[i].catch_type === 0) {
                    handler_pc = this._exception_table[i].handler_pc;             
                } else {
                    var name = this._cp[this._cp[this._exception_table[i].catch_type].name_index].bytes;
                    if (name === ex.getClassName()) {
                        handler_pc = this._exception_table[i].handler_pc;
                        break;
                    }
                }
            }
        }
        
        if (handler_pc != null) {
            this._stack.push(ex);
            this._ip = handler_pc;      
        } else {
            throw ex;
        }
    }

    this.run = (args, done) => {        
        this._ip = 0;
        this._stack = [];
        this._widened = false;
        
        for(var i=0; i<args.length; i++) {
            locals[i] = args[i];
        }
        
        var step = () => {
            SCHEDULER.tick(pid, () => {
                var opCode = this._read8()
                
                switch (opCode) {
                    
                    case OPCODES.return:
                        return done();
                        
                    case OPCODES.ireturn:
                    case OPCODES.lreturn:
                    case OPCODES.freturn:
                    case OPCODES.dreturn:
                    case OPCODES.areturn:
                        return done(this._stack.pop());
                    
                    default:
                        const opName = OPCODES.toString(opCode)                    
                        if (!(opName in this)) throw new Error(`Opcode ${opName} [${opCode}] is not supported.`)
                        this[opName](step)
                }
            })   
        }
        
        step();
    }

//================================================================================= instructions
    this.nop = done => done()

    this.aconst_null = done => {
        this._stack.push(null);
        return done();
    }

    this.iconst_m1 = done => {
        this._stack.push(-1);
        return done();
    }

    this.iconst_0 = this.lconst_0 = this.fconst_0 = this.dconst_0 = done => { this._stack.push(0); return done(); }

    this.iconst_1 = this.lconst_1 = this.fconst_1 = this.dconst_1 = done => { this._stack.push(1); return done(); }

    this.iconst_2 = this.fconst_2 = done => { this._stack.push(2); return done(); }

    this.iconst_3 = done => { this._stack.push(3); return done(); }

    this.iconst_4 = done => {
        this._stack.push(4);
        return done();
    }

    this.iconst_4 = done => {
        this._stack.push(5);
        return done();
    }

    this.iconst_5 = done => {
        this._stack.push(5);
        return done();
    }

    this.sipush = done => {
        this._stack.push(this._read16());
    }

    this.bipush = done => {
        this._stack.push(this._read8());
        return done();
    }

    this.ldc = done => {
        var constant = this._cp[this._read8()];
        if(constant.tag == TAGS.get('String'))
            this._stack.push(this._cp[constant.string_index].bytes);
        else throw new Error('not support constant type')
        return done()
    }

    this.ldc_w = done => {
        var constant = this._cp[this._read16()];
        if(constant.tag == TAGS.get('String')) this._stack.push(this._cp[constant.string_index].bytes);
        else throw new Error('not support constant type')
        return done()
    }

    this.ldc2_w = done => {
        var constant = this._cp[this._read16()];
        switch(constant.tag) {
            case TAGS.get('String'):
                this._stack.push(this._cp[constant.string_index].bytes)
                break
            case TAGS.get('Long'):
                this._stack.push(Numeric.getLong(constant.bytes));
                break
            case TAGS.get('Double'):
                this._stack.push(constant.bytes.readDoubleBE(0));
                break
            default:
                throw new Error('not support constant type')
        }
        return done()
    }

    this.iload = done => {
        var idx = this._widened ? this._read16() : this._read8();
        this._stack.push(locals[idx]);
        this._widened = false;
        return done();
    }

    this.lload = done => {
        var idx = this._widened ? this._read16() : this._read8();
        this._stack.push(locals[idx]);
        this._widened = false;
        return done();
    }

    this.fload = done => {
        var idx = this._widened ? this._read16() : this._read8();
        this._stack.push(locals[idx]);
        this._widened = false;
        return done();
    }

    this.dload = done => {
        var idx = this._widened ? this._read16() : this._read8();
        this._stack.push(locals[idx]);
        this._widened = false;
        return done();
    }

    this.aload = done => {
        var idx = this._widened ? this._read16() : this._read8();
        this._stack.push(locals[idx]);
        this._widened = false;
        return done();
    }

    this.iload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.lload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.fload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.fload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.dload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.aload_0 = done => {
        this._stack.push(locals[0]);
        return done();
    }

    this.iload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.lload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.fload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.fload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.dload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.aload_1 = done => {
        this._stack.push(locals[1]);
        return done();
    }

    this.iload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.lload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.fload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.fload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.dload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.aload_2 = done => {
        this._stack.push(locals[2]);
        return done();
    }

    this.iload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.lload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.fload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.fload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.dload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.aload_3 = done => {
        this._stack.push(locals[3]);
        return done();
    }

    this.iaload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.laload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.faload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }


    this.daload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.aaload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.baload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.caload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.saload = done => {
        var idx = this._stack.pop();
        var refArray = this._stack.pop();
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            this._stack.push(refArray[idx]);
        }
        
        return done();
    }

    this.istore = done => {
        var idx = this._widened ? this._read16() : this._read8();
        locals[idx] = this._stack.pop();
        this._widened = false;
        return done();
    }

    this.lstore = done => {
        var idx = this._widened ? this._read16() : this._read8();
        locals[idx] = this._stack.pop();
        this._widened = false;
        return done();
    }

    this.fstore = done => {
        var idx = this._widened ? this._read16() : this._read8();
        locals[idx] = this._stack.pop();
        this._widened = false;
        return done();
    }

    this.dstore = done => {
        var idx = this._widened ? this._read16() : this._read8();
        locals[idx] = this._stack.pop();
        this._widened = false;
        return done();
    }

    this.astore = done => {
        var idx = this._widened ? this._read16() : this._read8();
        locals[idx] = this._stack.pop();
        this._widened = false;
        return done();
    }

    this.istore_0 = done => {
        locals[0] = this._stack.pop();
        return done();
    }

    this.lstore_0 = done => {
        locals[0] = this._stack.pop();
        return done();
    }

    this.fstore_0 = done => {
        locals[0] = this._stack.pop();
        return done();
    }

    this.dstore_0 = done => {
        locals[0] = this._stack.pop();
        return done();
    }

    this.astore_0 = done => {
        locals[0] = this._stack.pop();
        return done();
    }

    this.istore_1 = done => {
        locals[1] = this._stack.pop();
        return done();
    }

    this.lstore_1 = done => {
        locals[1] = this._stack.pop();
        return done();
    }

    this.fstore_1 = done => {
        locals[1] = this._stack.pop();
        return done();
    }

    this.dstore_1 = done => {
        locals[1] = this._stack.pop();
        return done();
    }

    this.astore_1 = done => {
        locals[1] = this._stack.pop();
        return done();
    }


    this.istore_2 = done => {
        locals[2] = this._stack.pop();
        return done();
    }

    this.lstore_2 = done => {
        locals[2] = this._stack.pop();
        return done();
    }

    this.fstore_2 = done => {
        locals[2] = this._stack.pop();
        return done();
    }

    this.dstore_2 = done => {
        locals[2] = this._stack.pop();
        return done();
    }

    this.astore_2 = done => {
        locals[2] = this._stack.pop();
        return done();
    }

    this.istore_3 = done => {
        locals[3] = this._stack.pop();
        return done();
    }

    this.lstore_3 = done => {
        locals[3] = this._stack.pop();
        return done();
    }

    this.fstore_3 = done => {
        locals[3] = this._stack.pop();
        return done();
    }

    this.dstore_3 = done => {
        locals[3] = this._stack.pop();
        return done();
    }

    this.astore_3 = done => {
        locals[3] = this._stack.pop();
        return done();
    }

    this.iastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.lastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.fastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.dastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.aastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.bastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.castore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.sastore = done => {
        var val = this._stack.pop();
        var idx = this._stack.pop();                
        var refArray = this._stack.pop();
        
        
        var ex = null;
        
        if (!refArray) {
            ex = CLASSES.newException("java/lang/NullPointerException");
        } else if (idx < 0 || idx >= refArray.length) {
            ex = CLASSES.newException("java/lang/ArrayIndexOutOfBoundsException", idx);
        }
        
        if (ex) {
            this._throw(ex);
        } else {
            refArray[idx] = val;
        }
        
        return done();
    }

    this.pop = done => {
        this._stack.pop();
        return done();
    }

    this.pop2 = done => {
        this._stack.pop();
        return done();
    }

    this.dup = done => {
        var val = this._stack.pop();
        this._stack.push(val);
        this._stack.push(val);
        return done();
    }

    this.dup_x1 = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val1);
        this._stack.push(val2);
        this._stack.push(val1);
        return done();
    }

    this.dup_x2 = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        var val3 = this._stack.pop();    
        this._stack.push(val1);
        this._stack.push(val3);
        this._stack.push(val2);    
        this._stack.push(val1);
        return done();
    }

    this.dup2 = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2);
        this._stack.push(val1);
        this._stack.push(val2);
        this._stack.push(val1);
        return done();
    }

    this.dup2_x1 = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        var val3 = this._stack.pop();
        this._stack.push(val2);
        this._stack.push(val1);
        this._stack.push(val3);
        this._stack.push(val2);
        this._stack.push(val1);
        return done();
    }

    this.dup2_x2 = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        var val3 = this._stack.pop();
        var val4 = this._stack.pop();
        this._stack.push(val2);
        this._stack.push(val1);
        this._stack.push(val4);
        this._stack.push(val3);
        this._stack.push(val2);
        this._stack.push(val1);
        return done();
    }


    this.swap = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val1);
        this._stack.push(val2);
        return done();
    }


    this.iinc = done => {
        var idx = this._widened ? this._read16() : this._read8();
        var val = this._widened ? this._read16() : this._read8();
        locals[idx] += val
        this._widened = false;
        return done();
    }

    this.iadd = done => {
        this._stack.push(this._stack.pop() + this._stack.pop());
        return done();
    }

    this.ladd = done => {
        this._stack.push(this._stack.pop() + this._stack.pop());
        return done();
    }

    this.dadd = done => {
        this._stack.push(this._stack.pop() + this._stack.pop());
        return done();
    }

    this.fadd = done => {
        this._stack.push(this._stack.pop() + this._stack.pop());
        return done();
    }

    this.isub = done => {
        this._stack.push(- this._stack.pop() + this._stack.pop());
        return done();
    }

    this.lsub = done => {
        this._stack.push(- this._stack.pop() + this._stack.pop());
        return done();
    }

    this.dsub = done => {
        this._stack.push(- this._stack.pop() + this._stack.pop());
        return done();
    }

    this.fsub = done => {
        this._stack.push(- this._stack.pop() + this._stack.pop());
        return done();
    }

    this.imul = done => {
        this._stack.push(this._stack.pop() * this._stack.pop());
        return done();
    }

    this.lmul = done => {
        this._stack.push(this._stack.pop() * this._stack.pop());
        return done();
    }

    this.dmul = done => {
        this._stack.push(this._stack.pop() * this._stack.pop());
        return done();
    }

    this.fmul = done => {
        this._stack.push(this._stack.pop() * this._stack.pop());
        return done();
    }

    this.idiv = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        if (val1 === 0) {
            this._throw(CLASSES.newException("java/lang/ArithmeticException"));
        } else {
            this._stack.push(val2 / val1);
        }
        return done();
    }

    this.ldiv = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        if (val1 === 0) {
            this._throw(CLASSES.newException("java/lang/ArithmeticException"));
        } else {
            this._stack.push(val2 / val1);
        }
        return done();
    }

    this.ddiv = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 / val1);
        return done();
    }

    this.fdiv = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 / val1);
        return done();
    }

    this.irem = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 % val1);
        return done();
    }

    this.lrem = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 % val1);
        return done();
    }

    this.drem = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 % val1);
        return done();
    }

    this.frem = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 % val1);
        return done();
    }

    this.ineg = done => {
        this._stack.push(- this._stack.pop());
        return done();
    }

    this.lneg = done => {
        this._stack.push(- this._stack.pop());
        return done();
    }

    this.dneg = done => {
        this._stack.push(- this._stack.pop());
        return done();
    }

    this.fneg = done => {
        this._stack.push(- this._stack.pop());
        return done();
    }

    this.ishl = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 << val1);
        return done();
    }

    this.lshl = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 << val1);
        return done();
    }

    this.ishr = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 >> val1);
        return done();
    }

    this.lshr = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 >> val1);
        return done();
    }

    this.iushr = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 >>> val1);
        return done();
    }

    this.lushr = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        this._stack.push(val2 >>> val1);
        return done();
    }

    this.iand = done => {
        this._stack.push(this._stack.pop() & this._stack.pop());
        return done();
    }

    this.land = done => {
        this._stack.push(this._stack.pop() & this._stack.pop());
        return done();
    }

    this.ior = done => {
        this._stack.push(this._stack.pop() | this._stack.pop());
        return done();
    }

    this.lor = done => {
        this._stack.push(this._stack.pop() | this._stack.pop());
        return done();
    }

    this.ixor = done => {
        this._stack.push(this._stack.pop() ^ this._stack.pop());
        return done();
    }

    this.lxor = done => {
        this._stack.push(this._stack.pop() ^ this._stack.pop());
        return done();
    }

    this.lcmp = done => {
        var val1 = this._stack.pop();
        var val2 = this._stack.pop();
        if (val2 > val1) {
            this._stack.push(1);
        } else if (val2 < val1) {
            this._stack.push(-1);
        } else {
            this._stack.push(0);
        }
        return done()
    }

    this.fcmpl = done => {
        var val1 = this._stack.pop()
        var val2 = this._stack.pop()
        if (isNaN(val1) || isNaN(val2)) {
            this._stack.push(-1)
        } else if (val2 > val1) {
            this._stack.push(1)
        } else if (val2 < val1) {
            this._stack.push(-1)
        } else {
            this._stack.push(0)
        }
        return done
    }

    this.fcmpg = done => {
        var val1 = this._stack.pop()
        var val2 = this._stack.pop()
        if (isNaN(val1) || isNaN(val2)) {
            this._stack.push(1)
        } else if (val2 > val1) {
            this._stack.push(1)
        } else if (val2 < val1) {
            this._stack.push(-1)
        } else {
            this._stack.push(0)
        }    
        return done
    }

    this.dcmpl = done => {
        var val1 = this._stack.pop()
        var val2 = this._stack.pop()
        if (isNaN(val1) || isNaN(val2)) {
            this._stack.push(-1)
        } else if (val2 > val1) {
            this._stack.push(1)
        } else if (val2 < val1) {
            this._stack.push(-1)
        } else {
            this._stack.push(0)
        }    
        return done
    }

    this.dcmpg = done => {
        var val1 = this._stack.pop()
        var val2 = this._stack.pop()
        if (isNaN(val1) || isNaN(val2)) {
            this._stack.push(1)
        } else if (val2 > val1) {
            this._stack.push(1)
        } else if (val2 < val1) {
            this._stack.push(-1)
        } else {
            this._stack.push(0)
        }    
        return done;
    }


    this.newarray = done => {
        var type = this._read8();  
        var size = this._stack.pop();
        if (size < 0) {
            this._throw(CLASSES.newException("java/lang/NegativeSizeException"));
        } else {
            this._stack.push(new Array(size));
        }
        return done();    
    }


    this.anewarray = done => {
        var idx = this._read16();
        var className = this._cp[this._cp[idx].name_index].bytes;       
        var size = this._stack.pop();
        if (size < 0) {
            this._throw(CLASSES.newException("java/lang/NegativeSizeException"));
        } else {
            this._stack.push(new Array(size));
        }
        return done();
    }

    this.multianewarray = done => {
        var idx = this._read16();
        var type = this._cp[this._cp[idx].name_index].bytes;       
        var dimensions = this._read8();
        var lengths = new Array(dimensions);
        for(var i=0; i<dimensions; i++) {
            lengths[i] = this._stack.pop();
        }
        var createMultiArray = function(lengths) {
            if (lengths.length === 0) {
                return null;
            }
            var length = lengths.shift();
            var array = new Array(length);
            for (var i=0; i<length; i++) {
                array[i] = createMultiArray(lengths);
            }
            return array;
        };
        this._stack.push(createMultiArray(lengths));    
        return done();
    }

    this.arraylength = done => {
        var ref = this._stack.pop();
        this._stack.push(ref.length);
        return done();
    }

    this.if_icmpeq = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 === ref2 ? jmp : this._ip;
        return done();
    }

    this.if_icmpne = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 !== ref2 ? jmp : this._ip;
        return done();
    }

    this.if_icmpgt = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 < ref2 ? jmp : this._ip;
        return done();
    }

    this.if_icmple = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() >= this._stack.pop() ? jmp : this._ip;
        return done();
    }

    this.if_icmplt = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() > this._stack.pop() ? jmp : this._ip;
        return done();
    }

    this.if_icmpge = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 <= ref2 ? jmp : this._ip;
        return done();
    }

    this.if_acmpeq = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 === ref2 ? jmp : this._ip;
        return done();
    }

    this.if_acmpne = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());                                
        var ref1 = this._stack.pop();
        var ref2 = this._stack.pop();
        this._ip = ref1 !== ref2 ? jmp : this._ip;
        return done();
    }

    this.ifne = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() !== 0 ? jmp : this._ip;
        return done();
    }

    this.ifeq = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() === 0 ? jmp : this._ip;
        return done();
    }

    this.iflt = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() < 0 ? jmp : this._ip;
        return done();
    }

    this.ifge = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() >= 0 ? jmp : this._ip;
        return done();
    }

    this.ifgt = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() > 0 ? jmp : this._ip;
        return done();
    }

    this.ifle = done => {
        var jmp = this._ip - 1 + Numeric.getInt(this._read16());
        this._ip = this._stack.pop() <= 0 ? jmp : this._ip;
        return done();
    }
    this.i2l = done => done()
    this.i2f = done => done()
    this.i2d = done => done()
    this.i2b = done => done()
    this.i2c = done => done()
    this.i2s = done => done()
    this.l2i = done => done()
    this.l2d = done => done()
    this.l2f = done => done()
    this.d2i = done => done()
    this.d2l = done => done()
    this.d2f = done => done()
    this.f2d = done => done()
    this.f2i = done => done()
    this.f2l = done => done()

    this.goto = done => {
        this._ip += Numeric.getInt(this._read16()) - 1;
        return done();
    }

    this.goto_w = done => {
        this._ip += Numeric.getInt(this._read32()) - 1;
        return done();
    }

    this.ifnull = done => {
        var ref = this._stack.pop();
        if (!ref) {
            this._ip += Numeric.getInt(this._read16()) - 1;
        }
        return done();
    }

    this.ifnonnull = done => {
        var ref = this._stack.pop();
        if (!!ref) {
            this._ip += Numeric.getInt(this._read16()) - 1;
        }
        return done();
    }

    this.putfield = done => {
        var idx = this._read16();
        var fieldName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;    
        var val = this._stack.pop();
        var obj = this._stack.pop();
        if (!obj) {
            this._throw(CLASSES.newException("java/lang/NullPointerException"));
        } else {
            obj[fieldName] = val;
        }
        return done();
    }

    this.getfield = done => {    
        var idx = this._read16();
        var fieldName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        var obj = this._stack.pop();
        if (!obj) {
            this._throw(CLASSES.newException("java/lang/NullPointerException"));
        } else {
            this._stack.push(obj[fieldName]);
        }
        return done();
    }


    this.new = done => {
        var idx = this._read16();
        var className = this._cp[this._cp[idx].name_index].bytes;    
        this._stack.push(CLASSES.newObject(className));
        return done();
    }

    this.getstatic = done => {    
        var idx = this._read16();
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var fieldName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        this._stack.push(CLASSES.getStaticField(className, fieldName));
        return done();
    }

    this.putstatic = done => {
        var idx = this._read16();
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var fieldName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        CLASSES.setStaticField(className, fieldName, this._stack.pop());
        return done();
    }

    this.invokestatic = done => {
        var self = this;
        
        var idx = this._read16();
        
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var methodName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        var signature = Signature.parse(this._cp[this._cp[this._cp[idx].name_and_type_index].signature_index].bytes);
        
        var args = [];
        for (var i=0; i<signature.IN.length; i++) {
            if (!signature.IN[i].isArray && ["long", "double"].indexOf(signature.IN[i].type) !== -1) {
                args.unshift("");
                args.unshift(this._stack.pop());
            } else {
                args.unshift(this._stack.pop());
            }
        }
        
        var method = CLASSES.getStaticMethod(className, methodName, signature);
        
        if (method instanceof Frame) {
            method.setPid(pid)
            method.run(args, function(res) {
                if (signature.OUT.length != 0) {                        
                self._stack.push(res);
                }
                return done();
            });
        } else {
            var res = method.apply(null, args);
            if (signature.OUT.length != 0) {                        
                self._stack.push(res);                        
            }
            return done();
        }
    }    


    this.invokevirtual = done => {
        var self = this;
        
        var idx = this._read16();
        
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var methodName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        var signature = Signature.parse(this._cp[this._cp[this._cp[idx].name_and_type_index].signature_index].bytes);
        
        var args = [];
        for (var i=0; i<signature.IN.length; i++) {
            if (!signature.IN[i].isArray && ["long", "double"].indexOf(signature.IN[i].type) !== -1) {
                args.unshift("");
                args.unshift(this._stack.pop());
            } else {
                args.unshift(this._stack.pop());
            }
        }

        
        var instance = this._stack.pop();
        var method = CLASSES.getMethod(className, methodName, signature);
        
        if (method instanceof Frame) {
            args.unshift(instance)
            method.setPid(pid)
            method.run(args, function(res) {
                if (signature.OUT.length != 0) {                        
                self._stack.push(res);
                }
                return done();            
            });
        } else {
            var res = method.apply(instance, args);        
            if (signature.OUT.length != 0) {
                self._stack.push(res);
            }
            return done();
        }
    }

    this.invokespecial = done => {
        var self = this;
        
        var idx = this._read16();
        
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var methodName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        var signature = Signature.parse(this._cp[this._cp[this._cp[idx].name_and_type_index].signature_index].bytes);
        
        var args = [];
        for (var i=0; i<signature.IN.length; i++) {
            if (!signature.IN[i].isArray && ["long", "double"].indexOf(signature.IN[i].type) !== -1) {
                args.unshift("");
                args.unshift(this._stack.pop());
            } else {
                args.unshift(this._stack.pop());
            }
        }


        var instance = this._stack.pop();
        var ctor = CLASSES.getMethod(className, methodName, signature);
        
        if (ctor instanceof Frame) {
            args.unshift(instance);
            ctor.setPid(pid)
            ctor.run(args, function() {
                return done();
            });
        } else {
            ctor.apply(instance, args);
            return done();
        }
        
    }

    this.invokeinterface = done => {
        var self = this;
        
        var idx = this._read16();
        var argsNumber = this._read8();
        var zero = this._read8();
        
        var className = this._cp[this._cp[this._cp[idx].class_index].name_index].bytes;
        var methodName = this._cp[this._cp[this._cp[idx].name_and_type_index].name_index].bytes;
        var signature = Signature.parse(this._cp[this._cp[this._cp[idx].name_and_type_index].signature_index].bytes);
        
        var args = [];
        for (var i=0; i<signature.IN.length; i++) {
            if (!signature.IN[i].isArray && ["long", "double"].indexOf(signature.IN[i].type) !== -1) {
                args.unshift("");
                args.unshift(this._stack.pop());
            } else {
                args.unshift(this._stack.pop());
            }
        }


        var instance = this._stack.pop();
        
        if (instance[methodName] instanceof Frame) {
            args.unshift(instance);
            instance[methodName].setPid(pid)
            instance[methodName].run(args, function(res) {
                if (signature.OUT.length != 0) {                        
                self._stack.push(res);
                }
                return done();            
            });
        } else {
            var res = instance[methodName].apply(instance, args);
            if (signature.OUT.length != 0) {
                self._stack.push(res);
            }
            return done();
        }
    }

    this.jsr = done => {
        var jmp = this._read16();
        this._stack.push(this._ip);
        this._ip = jmp;
        return done();
    }

    this.jsr_w = done => {
        var jmp = this._read32();
        this._stack.push(this._ip);
        this._ip = jmp;
        return done();
    }

    this.ret = done => {   
        var idx = this._widened ? this._read16() : this._read8();
        this._ip = locals[idx]; 
        this._widened = false;
        return done();
    }

    this.tableswitch = done => {

        var startip = this._ip;
        var jmp;

        while ((this._ip % 4) != 0) {
            this._ip++;
        }
            
        var def = this._read32();
        var low = this._read32();
        var high = this._read32();
        var val = this._stack.pop();
        
        if (val < low || val > high) {
            jmp = def;
        } else {
            this._ip  += (val - low) << 2;
            jmp = this._read32();        
        }    
        
        this._ip = startip - 1 + Numeric.getInt(jmp);
        
        return done();
    }

    this.lookupswitch = done => {

        var startip = this._ip;

        while ((this._ip % 4) != 0) {
            this._ip++;
        }
            
        var jmp = this._read32();
        var size = this._read32();
        var val = this._stack.pop();
        
        lookup:
            for(var i=0; i<size; i++) {
                var key = this._read32();
                var offset = this._read32();
                if (key === val) {
                    jmp = offset;
                }
                if (key >= val) {
                    break lookup;    
                }
            }
        
        this._ip = startip - 1 + Numeric.getInt(jmp);
        
        return done();
    }

    this.instanceof = done => {
        var idx = this._read16();
        var className = this._cp[this._cp[idx].name_index].bytes;
        var obj = this._stack.pop();
        if (obj.getClassName() === className) {
            this._stack.push(true);
        } else {
            this._stack.push(false);
        }
        return done();
    }

    this.checkcast = done => {
        var idx = this._read16();
        var type = this._cp[this._cp[idx].name_index].bytes;
        return done();
    }


    this.athrow = done => {
        this._throw(this._stack.pop());
        return done();
    }

    this.wide = done => {
        this._widened = true;
        return done();
    }

    this.monitorenter = done => {
        var obj = this._stack.pop();
        if (!obj) {
            this._throw(CLASSES.newException("java/lang/NullPointerException"));
        } else if (obj.hasOwnProperty("$lock$")) {
            this._stack.push(obj);
            this._ip--;
            SCHEDULER.yield();
        } else {
            obj["$lock$"] = "locked";
        }
        return done();
    }

    this.monitorexit = done => {
        var obj = this._stack.pop();
        if (!obj) {
            this._throw(CLASSES.newException("java/lang/NullPointerException"));
        } else {
            delete obj["$lock$"];
            SCHEDULER.yield();
        }
        return done();
    }
}
