const codeDir = __dirname + '/_test'
require('child_process').execSync(`javac ${codeDir}/Object.java ${codeDir}/Main.java ${codeDir}/Nested.java`)
const JVM = require('../libs/jvm.js')
const jvm = new JVM()
// jvm.setLogLevel(0)
jvm.loadClassFiles(codeDir)
jvm.CLASSES.clinit()

describe('Object', () => {
    const o1 = jvm.CLASSES.newObject('Object')
    const o2 = jvm.CLASSES.newObject('Object')
    it('should return true for same instance', () => expect(o1).toEqual(o1))
    it('should return false for different instances', () => expect(o1).toEqual(o1))
    it('getClass should return correct class object', () => expect(o1).not.toEqual(o2))
    it('getClassName should return correct class object', () => expect(o1.getClassName()).toEqual('Object'))
    it('toString should return correct class object', () => expect(o1.toString()).toEqual(`Object@${o1.hashCode().toString(16)}`))
    it('Object hashcode should return a number', () => expect(typeof o1.hashCode()).toEqual('number'))
    it('Object hashcode should be greater than 0', () => expect(o1.hashCode()).toBeGreaterThan(0))
    it('Object should be different for different instances', () => expect(o1.hashCode()).not.toEqual(o2.hashCode()))
})
describe('Static', () => {
    const nested = jvm.CLASSES.getStaticField('_test/Main', 'o')
    console.log('>>>>>', jvm.CLASSES.getClass('_test/Main') )
//     nested.getNumber.run([nested], number => {
//         it('should return true for default number', () => expect(number).toBe(1))
//     })
//     nested.setNumber.run([nested, 1000], () => {
//         nested.getNumber.run([nested], number => {
//             it('should return true for custom number', () => expect(number).toBe(1000))
//         })
//     })
})
