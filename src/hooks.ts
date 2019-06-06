import { getCurrentBucket } from './internal'

export function useReducer(reducer, initState: any, init: Function) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useReducer() only valid inside an Articulated Function or a Custom Hook.")
  }

  if (!(bucket.nextStateIdx in bucket.states)) {
    const slot: any[] = []
    slot[0] = typeof init === "function" ? init(initState) : initState
    slot[1] = function dispatch(action) {
      slot[0] = reducer(slot[0], action)
    }
    bucket.states[bucket.nextStateIdx] = slot
  }

  return [...bucket.states[bucket.nextStateIdx++]]
}

export function useState(initState: any) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useState() only valid inside an Articulated Function or a Custom Hook.")
  }

  if (!(bucket.nextStateIdx in bucket.states)) {
    const slot = []
    slot[0] = initState
    slot[1] = function setState(state) {
      slot[0] = state
    }
    bucket.states[bucket.nextStateIdx] = slot
  }

  return [...bucket.states[bucket.nextStateIdx++]]
}

function depsChanged(deps1: any[] | undefined, deps2: any[] | undefined) {
  if (deps1 === undefined || deps2 === undefined) return true
  if (deps1.length !== deps2.length) return true
  for (let i in deps1) {
    if (!Object.is(deps1[i], deps2[i])) return true
  }
  return false
}

export function useEffect(fn: Function, deps?: any[]) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useEffect() only valid inside an Articulated Function or a Custom Hook.")
  }

  if (deps !== undefined && !Array.isArray(deps)) {
    throw new Error("useEffect depList must be array")
  }

  const effectIdx = bucket.nextEffectIdx
  if (!(effectIdx in bucket.effects)) {
    bucket.effects[effectIdx] = []
  }

  const slot = bucket.effects[effectIdx]

  if (depsChanged(slot[1], deps)) {
    slot[0] = function effect() {
      const prevDispose = bucket.disposes[effectIdx]
      if (typeof prevDispose === 'function') {
        try {
          prevDispose()
        } finally {
          bucket.disposes[effectIdx] = undefined
        }
      }

      bucket.disposes[effectIdx] = fn()
    }

    slot[1] = deps
  }

  bucket.nextEffectIdx++;
}

export function useMemo(fn: Function, deps: any[]) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useMemo() only valid inside an Articulated Function or a Custom Hook.")
  }

  const memoizationIdx = bucket.nextMemoizationIdx
  if (!(bucket.nextMemoizationIdx in bucket.memoizations)) {
    bucket.memoizations[memoizationIdx] = [];
  }

  const slot = bucket.memoizations[memoizationIdx]

  if (depsChanged(slot[1], deps)) {
    try {
      slot[0] = fn()
    } finally {
      slot[1] = deps
    }
  }
  
  bucket.nextMemoizationIdx++

  return slot[0]
}

export function useCallback(fn: Function, deps: any[]) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useCallback() only valid inside an Articulated Function or a Custom Hook.")
  }

  return useMemo(function callback() { return fn }, deps)
}

export function useRef(initValue: any) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useRef() only valid inside an Articulated Function or a Custom Hook.")
  }
  const [ref] = useState({ current: initValue })
  return ref
}
