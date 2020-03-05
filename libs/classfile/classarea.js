var Reader = require("../util/reader.js"),
    TAGS = require("./tags.js")

var ClassArea = module.exports = function(classBytes) {
    if (this instanceof ClassArea) {
        this.classImage = getClassImage(classBytes);
    } else {
        return new ClassArea(classBytes);
    }
}

ClassArea.prototype.getClassName = function() {    
    return this.classImage.constant_pool[this.classImage.constant_pool[this.classImage.this_class].name_index].bytes;    
}

ClassArea.prototype.getSuperClassName = function() {    
    return this.classImage.constant_pool[this.classImage.constant_pool[this.classImage.super_class].name_index].bytes;    
}

ClassArea.prototype.getAccessFlags = function() {
    return this.classImage.access_flags;    
}

ClassArea.prototype.getConstantPool = function() {
    return this.classImage.constant_pool;
}

ClassArea.prototype.getFields = function() {
    return this.classImage.fields;
}

ClassArea.prototype.getMethods = function() {
    return this.classImage.methods;
}

ClassArea.prototype.getClasses = function() {
    var self = this;
    var classes = [];
    this.classImage.attributes.forEach(function(a) {
        if (a.info.type === 'InnerClasses') {
            a.info.classes.forEach(function(c) {
                classes.push(self.classImage.constant_pool[self.classImage.constant_pool[c.inner_class_info_index].name_index].bytes);
                classes.push(self.classImage.constant_pool[self.classImage.constant_pool[c.outer_class_info_index].name_index].bytes);
            });
        }
    });
    return classes;
}

var getClassImage = function(classBytes) {

    var classImage = {};
        
    var getAttributes = function(attribute_name_index, bytes) {
            
        var reader = Reader(bytes)
        var attribute = { attribute_name_index: attribute_name_index };
    
    
        var item = classImage.constant_pool[attribute_name_index];
    
        
        switch(item.tag) {
        
            case TAGS.get('Long'):
            case TAGS.get('Float'):
            case TAGS.get('Double'):
            case TAGS.get('Integer'):
            case TAGS.get('String'):
                attribute.type = 'ConstantValue'
                attribute.constantvalue_index = reader.read16();
                return attribute;        
            
                
            case TAGS.get('Utf8'):
                switch(item.bytes) {
                    
                    case 'Code':
                        attribute.type = 'Code'
                        attribute.max_stack = reader.read16();
                        attribute.max_locals = reader.read16();
                        var code_length = reader.read32();
                        attribute.code = reader.readBytes(code_length);
                        
                        var exception_table_length = reader.read16();        
                        attribute.exception_table = [];
                        for(var i=0; i<exception_table_length; i++) {
                            var start_pc = reader.read16();
                            var end_pc = reader.read16();
                            var handler_pc= reader.read16();
                            var catch_type = reader.read16();
                            attribute.exception_table.push({start_pc:start_pc,end_pc:end_pc,handler_pc:handler_pc,catch_type:catch_type });
                        }

                        var attributes_count = reader.read16();        
                        attribute.attributes = [];
                        for(var i=0; i<attributes_count; i++) {
                            var attribute_name_index = reader.read16();
                            var attribute_length = reader.read32();
                            var info = reader.readBytes(attribute_length);
                            attribute.attributes.push({ attribute_name_index: attribute_name_index, attribute_length: attribute_length, info: info });
                        }
                        return attribute;
                        
                    case 'SourceFile':
                        attribute.type = 'SourceFile'
                        attribute.sourcefile_index = reader.read16();
                        return attribute;
                    
                    case 'Exceptions':
                        attribute.type = 'Exceptions'
                        var number_of_exceptions = reader.read16();
                        attribute.exception_index_table = [];
                        for(var i=0; i<number_of_exceptions; i++) {
                            attribute.exception_index_table.push(reader.read16());
                        }
                        return attribute;
                    
                    case 'InnerClasses':
                        attribute.type = 'InnerClasses'
                        var number_of_classes = reader.read16();
                        attribute.classes = [];
                        for(var i=0; i<number_of_classes; i++) {
                            var inner = {};
                            inner.inner_class_info_index = reader.read16();
                            inner.outer_class_info_index = reader.read16();
                            inner.inner_name_index = reader.read16();
                            inner.inner_class_access_flags = reader.read16();
                            attribute.classes.push(inner);
                        }
                        return attribute;
                    
                    default:
                        throw new Error("This attribute type is not supported yet. [" + JSON.stringify(item) + "]");            
                }
                
            default:
                throw new Error("This attribute type is not supported yet. [" + JSON.stringify(item) + "]");            
        }
    };
    
    
    var reader = Reader(classBytes);
    classImage.magic = reader.read32().toString(16);

    classImage.version = {
        minor_version: reader.read16(),
        major_version: reader.read16()
    };
        
    classImage.constant_pool = [ null ];
    var constant_pool_count = reader.read16();
    for(var i=1; i<constant_pool_count; i++) {        
        var tag =  reader.read8();
        switch(tag) {
            case TAGS.get('Class'):
                var name_index = reader.read16();
                classImage.constant_pool.push( { tag, name_index: name_index } );
                break;
            case TAGS.get('Utf8'):
                var length = reader.read16();
                var bytes = reader.readString(length);
                classImage.constant_pool.push( { tag, bytes } );
                break;
            case TAGS.get('NameAndType'):
                var name_index = reader.read16();
                var signature_index = reader.read16();
                classImage.constant_pool.push( { tag, name_index: name_index,  signature_index: signature_index } );                
                break;
            case TAGS.get('String'):
                var string_index = reader.read16();
                classImage.constant_pool.push( { tag, string_index: string_index } );                                                
                break;
            case TAGS.get('Integer'):
                var bytes = reader.read32();
                classImage.constant_pool.push( {  tag, bytes } );                                                
                break;
            case TAGS.get('Double'):
            case TAGS.get('Long'):
                var bytes = new Buffer(8);
                for (var b=0; b<8; b++) {
                    bytes[b] = reader.read8();
                }
                classImage.constant_pool.push( {  tag, bytes: bytes } );
                classImage.constant_pool.push( null ); i++;
                break;
            case TAGS.get('Fieldref'):
            case TAGS.get('Methodref'):
            case TAGS.get('InterfaceMethodref'):
                var class_index = reader.read16();
                var name_and_type_index = reader.read16();
                classImage.constant_pool.push({tag, class_index: class_index, name_and_type_index:name_and_type_index})
                break
            default:                
                throw new Error(`tag ${tag} is not supported.`)
        }
    }
        
    classImage.access_flags = reader.read16();
    
    classImage.this_class = reader.read16();
    
    classImage.super_class = reader.read16();

    
    classImage.interfaces = [];
    var interfaces_count = reader.read16();
    for(var i=0; i<interfaces_count; i++) {
        var index = reader.read16();
        if (index != 0){
            classImage.interfaces.push(index);
        }
    }
        
    classImage.fields = [];
    var fields_count = reader.read16();
    for(var i=0; i<fields_count; i++) {
        var access_flags = reader.read16();
        var name_index = reader.read16();
        var descriptor_index = reader.read16();
        var attributes_count = reader.read16();
        var field_info = {
            access_flags: access_flags,
            name_index: name_index,
            descriptor_index: descriptor_index,
            attributes_count: attributes_count,
            attributes: []
        }
        for(var j=0; j <attributes_count; j++) {
            var attribute_name_index = reader.read16();
            var attribute_length = reader.read32();
            var constantvalue_index = reader.read16();            
            var attribute = {
                attribute_name_index: attribute_name_index,
                attribute_length: attribute_length,
                constantvalue_index: constantvalue_index
            }            
            field_info.attributes.push(attribute);
        }
        classImage.fields.push(field_info);
    }    
    
    
    classImage.methods = [];
    var methods_count = reader.read16();
    for(var i=0; i<methods_count; i++) {
        var access_flags = reader.read16();
        var name_index = reader.read16();
        var signature_index = reader.read16();
        var attributes_count = reader.read16();
        var method_info  = {
            access_flags: access_flags,
            name_index: name_index,
            signature_index: signature_index,
            attributes_count: attributes_count,
            attributes: []
        }        
        for(var j=0; j <attributes_count; j++) {
            var attribute_name_index = reader.read16();
            var attribute_length = reader.read32();
            var info = getAttributes(attribute_name_index, reader.readBytes(attribute_length));
            var attribute = {
                attribute_name_index: attribute_name_index,
                attribute_length: attribute_length,
                info: info
            }
            method_info.attributes.push(attribute);
        }
                
        classImage.methods.push(method_info);
    }
    
    
    classImage.attributes = [];
    var attributes_count = reader.read16();
    for(var i=0; i<attributes_count; i++) {
            var attribute_name_index = reader.read16();
            var attribute_length = reader.read32();
            var info = getAttributes(attribute_name_index, reader.readBytes(attribute_length));
            var attribute = {
                attribute_name_index: attribute_name_index,
                attribute_length: attribute_length,
                info: info
            }
            classImage.attributes.push(attribute);        
    }
    
    return classImage;
 
};

