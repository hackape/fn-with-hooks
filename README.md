# fn-with-hooks

> Credit to https://github.com/getify/TNG-Hooks. This lib is basically a re-implementation of TNG-Hooks in Typescript, with APIs aligned to React's hooks.

[React's hooks](https://reactjs.org/docs/hooks-overview.html) ported to plain functions.

## Usage

[Live demo](https://frontarm.com/demoboard/?id=d6196ec0-083e-4c78-b708-8ee04652b099)

```javascript
import { withHooks, useState, useEffect, reset, useReducer, useMemo } from 'fn-with-hooks'

const foobar = withHooks((plus=0) => {
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


function reducer(state, action) {
  if (action.type === 'inc') {
    return { ...state, count: state.count+1 }
  }
  return state
}

const zoo = withHooks(() => {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  console.log('check current state', state)

  const chance = Math.random()
  if (chance > 0.5) {
    dispatch({ type: 'inc' })
  }

  console.log('check the chance', useMemo(() => chance, [state]))
})

zoo()
zoo()
zoo()
zoo()
```
