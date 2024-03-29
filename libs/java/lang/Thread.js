/*
 node-jvm
 Copyright (c) 2013 Yaroslav Gaponov <yaroslav.gaponov@gmail.com>
*/

var util = require("util");
var Object = require("./Object.js");
var Frame = require("./../../frame.js");
var Thread = require("./../../thread.js");

var AThread = module.exports = function() {
    if (this instanceof AThread) {
        this.thread = Thread()
    } else {
        return new AThread();
    }
}

util.inherits(String, Object);


AThread.getClassName = function() {
    return "java/lang/Thread";
}
 
AThread.prototype["<init>"] = function(instance) {
    this._instance = instance;
}

AThread.prototype.setName = function(name) {
    this.thread.setName(name);    
}

AThread.prototype.getName = function() {
    return this.thread.getName();    
}

AThread.prototype.setPriority = function(priority) {
    this.thread.setPriority(priority);    
}

AThread.prototype.getPriority = function() {
    return this.thread.getPriority();    
}

AThread.prototype["start"] = function() {
    const pid = THREADS.add(this.thread);
    if (this._instance["run"].type == 'frame') {
        this._instance["run"].pid = pid
        this._instance["run"].run([this._instance])
        THREADS.remove(pid)
    } else {
        this._instance["run"]()
        THREADS.remove(pid)
    }
};

