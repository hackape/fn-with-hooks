# fn-with-hooks

> Credit to https://github.com/getify/TNG-Hooks. This lib is basically a re-implementation of TNG-Hooks in Typescript, with APIs aligned to React's hooks.

[React's hooks](https://reactjs.org/docs/hooks-overview.html) ported to plain functions.

## Usage

```javascript
import { withHooks, useState, useEffect } from 'fn-with-hooks'

const foobar = withHooks(function foobar(plus=0) {
  const [count, setCount] = useState(0)
  console.log(count)
  useEffect(() => {
    setCount(count + plus)
  }, [count])
})

foobar(1)
foobar(3)
foobar(5)

reset(foobar)

foobar(7)
foobar()
```
