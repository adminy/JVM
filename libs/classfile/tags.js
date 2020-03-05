const CONST_TAGS = ['','Utf8','Unicode','Integer','Float','Long','Double','Class','String','Fieldref','Methodref','InterfaceMethodref','NameAndType']
module.exports = {
    // any: (...args) => args.filter(arg => arg > 0 && arg < CONST_TAGS.length).length,
    // is: tagName => tagName && CONST_TAGS.includes(tagName),
    get: tagName => CONST_TAGS.indexOf(tagName)
    // toString: tag => Object.keys(TAGS).map(name => TAGS[name] === tag)[0]
}
