
## Example###

```javascript
const JVM = require('./libs/jvm.js')
const jvm = new JVM()
      jvm.setLogLevel(7)
      jvm.setEntryPointClassName(jvm.loadJarFile('./Main.jar'))
      jvm.onExit(code => process.exit(code))
      jvm.run([15])
```
