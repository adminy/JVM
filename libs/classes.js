const fs = require('fs')
var ClassArea = require("./classfile/classarea.js");
var Frame = require("./frame.js");

var ACCESS_FLAGS = require("./classfile/accessflags.js");
module.exports = function() {
    paths = [ __dirname ]
    classes = {}
    staticFields = {}
    this.addPath = path => paths.indexOf(path) === -1 && paths.push(path)
    this.clinit = function() {
        for(var className in classes) {
            classArea = classes[className];
            var clinit = this.getStaticMethod(className, "<clinit>", "()V");
            if (clinit instanceof Frame) {
                SCHEDULER.sync(function() {
                    LOG.debug("call " + className + ".<clinit> ...");
                    clinit.run([], function() {
                        LOG.debug("call " + className + ".<clinit> ... done");
                    });
                });
            }
        }
    }
    this.loadClassBytes = bytes => {
        const classArea = new ClassArea(bytes)
        classes[classArea.getClassName()] = classArea
        return classArea
    }
    this.loadClassFile = function(fileName) {
        LOG.debug("loading " + fileName + " ...")
        const bytes = fs.readFileSync(fileName)
        const _class = this.loadClassBytes(bytes)
        _class.getClasses().filter(_class => !classes[_class]).forEach(_class => {
            this.loadClassFile(fileName.split('/').slice(0, -1).join('/') + '/' + _class + ".class")
        })
        return _class
    }
    this.loadJSFile = fileName => {
        LOG.debug("loading " + fileName + " ...")
        return classes[classArea.getClassName()] = require(fileName)
    }

    this.loadJarFile = function(fileName) {
        var self = this;
        
        var AdmZip = require("adm-zip");

        var zip = new AdmZip(fileName);
        var zipEntries = zip.getEntries();

        var mainClass;
        
        zipEntries.forEach(function(zipEntry) {
            if (!zipEntry.isDirectory) {
                if (zipEntry.entryName.split('.').slice(-1)[0] === "class") {
                    LOG.debug("loading " + fileName + '@' + zipEntry.entryName + " ...");
                    self.loadClassBytes(zipEntry.getData());
                } else if (zipEntry.entryName === "META-INF/MANIFEST.MF") {
                    var manifest = zipEntry.getData().toString().split('\n');
                    for(var i=0; i<manifest.length; i++) {
                        var line = [];
                        manifest[i].split(':').forEach(
                            function(p) {
                                line.push(p.trim());
                            }
                        );
                        if (line[0] === "Main-Class") {
                            mainClass = line[1];
                            break;
                        }
                    }                
                }
            }
            return mainClass;
        });    
    }

    this.getEntryPoint = (className, methodName) => {
        for(const name in classes) {
            const _class = classes[name]
            if (_class instanceof ClassArea) {
                if (!className || (className === _class.getClassName())) {
                    if (ACCESS_FLAGS.isPublic(_class.getAccessFlags())) {
                        const cp = _class.getConstantPool()
                        for(const method of _class.getMethods()) {
                            if(ACCESS_FLAGS.isPublic(method.access_flags) && ACCESS_FLAGS.isStatic(method.access_flags) && cp[method.name_index].bytes === methodName) return new Frame(_class, method)
                        }
                    }
                }
            }
        }    
    }

    this.getClass = className => {
        if(className in classes) return classes[className]
        for(const path of paths) {
            const fileName = `${path}/${className}`
            let file = `${fileName}.js`
            if(fs.existsSync(file)) return this.loadJSFile(file)
            file = `${fileName}.class`
            if(fs.existsSync(file)) return this.loadClassFile(file)
        }
        throw new Error(`Implementation of the ${className} class is not found.`)
    }
    this.getStaticField = (className, fieldName) => staticFields[className + '.' + fieldName]
    this.setStaticField = (className, fieldName, value) => staticFields[className + '.' + fieldName] = value
    this.getStaticMethod = function(className, methodName, signature) {
        const _class = this.getClass(className)
        if (_class instanceof ClassArea) {
            const cp = _class.getConstantPool()
            for(const method of _class.getMethods()) 
                if (ACCESS_FLAGS.isStatic(method.access_flags)) 
                    if (cp[method.name_index].bytes === methodName)
                        if (signature.toString() === cp[method.signature_index].bytes)
                            return new Frame(_class, method)
        } else {
            if (methodName in _class) return _class[methodName]
        }
        return null
    }
        
    this.getMethod = function(className, methodName, signature) {
        var _class = this.getClass(className);
        if (_class instanceof ClassArea) {
            var methods = _class.getMethods();
            var cp = _class.getConstantPool();
            for(var i=0; i<methods.length; i++)
                if (!ACCESS_FLAGS.isStatic(methods[i].access_flags)) 
                    if (cp[methods[i].name_index].bytes === methodName) 
                        if (signature.toString() === cp[methods[i].signature_index].bytes) 
                            return new Frame(_class, methods[i]);
        } else {
            var o = new _class();
            if (methodName in o) {
            return o[methodName];
            }
        }
        return null;
    };
        
    this.newObject = function(className) {
        var _class = this.getClass(className)
        if (_class instanceof ClassArea) {
            
            var ctor = function() {};
            ctor.prototype = this.newObject(_class.getSuperClassName());
            const o = new ctor()
            o.getClassName = new Function(`return "${className}"`)
            const cp = _class.getConstantPool() 
            _class.getFields().forEach(field => {
                const fieldName = cp[field.name_index].bytes
                o[fieldName] = null
            })
            _class.getMethods().forEach(function(method) {
                const methodName = cp[method.name_index].bytes
                o[methodName] = new Frame(_class, method)
            })
            return o
        } else {
            const o = new _class()
            o.getClassName = new Function(`return "${className}"`)
            return o
        }
    }

    this.newException = (className, message, cause) => {
        const ex = this.newObject(className)
        ex["<init>"](message, cause)
        return ex
    }

}