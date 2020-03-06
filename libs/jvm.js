var fs = require("fs");
var path = require("path");
var globalizer = require("./util/globalizer");

var Classes = require("./classes");
var Threads = require("./threads");
var Logger = require("./logger");

var OPCODES = require("./opcodes");
var Thread = require("./thread");

var JVM = module.exports = function() {
    this._onExitCallback = () => {}
    this.LOG = new Logger()
    this.CLASSES = new Classes()
    this.THREADS = Threads()
    globalizer.add("LOG", this.LOG);
    globalizer.add("CLASSES", this.CLASSES)
    globalizer.add("THREADS", this.THREADS)
    globalizer.add("OPCODES", OPCODES)
    
    THREADS.add(Thread("main"))
    
    this.entryPoint = {
        className: null,
        methodName: "main"
    }
}

JVM.prototype.setEntryPointClassName = function(className) {
    this.entryPoint.className = className;
}

JVM.prototype.setEntryPointMethodName = function(methodName) {
    this.entryPoint.methodName = methodName;
}

JVM.prototype.setLogLevel = function(level) {
    this.LOG.setLogLevel(level)
}

JVM.prototype.loadClassFile = function(fileName) {
    return CLASSES.loadClassFile(fileName);
}

JVM.prototype.loadClassFiles = function(dirName) {
    var self = this;
    CLASSES.addPath(dirName);
    var files = fs.readdirSync(dirName);
    files.forEach(function(file) {
        var p = dirName + "/" + file
        var stat = fs.statSync(p);
        if (stat.isFile()) {
            if (path.extname(file) === ".class") {
                self.loadClassFile(p);
            }
        } else if (stat.isDirectory()) {
            self.loadClassFiles(p);
        }
    });
}

JVM.prototype.loadJSFile = function(fileName) {
    return CLASSES.loadJSFile(fileName);
}

JVM.prototype.loadJarFile = function(fileName) {
    return CLASSES.loadJarFile(fileName);
}
JVM.prototype.onExit = function(cb) {
    this._onExitCallback = cb
}
JVM.prototype.run = function() {
    CLASSES.clinit();
    
    var entryPoint = CLASSES.getEntryPoint(this.entryPoint.className, this.entryPoint.methodName);
    if (!entryPoint) throw new Error("Entry point method is not found.")
    entryPoint.run(arguments, code => (THREADS.count() === 1) ? THREADS.remove(0) : this._onExitCallback(code))
}

