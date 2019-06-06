import { getCurrentBucket } from './internal'

type Dispatch<A> = (value: A) => void
type SetStateAction<S> = S | ((prevState: S) => S)
type Reducer<S, A> = (prevState: S, action: A) => S
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never

export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer?: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useReducer() only valid inside an Articulated Function or a Custom Hook.")
  }

  if (!(bucket.nextStateIdx in bucket.states)) {
    const slot: any[] = []
    slot[0] = typeof initializer === "function" ? initializer(initializerArg) : initializerArg
    slot[1] = function dispatch(action) {
      slot[0] = reducer(slot[0], action)
    }
    bucket.states[bucket.nextStateIdx] = slot
  }

  return [...bucket.states[bucket.nextStateIdx++]] as any
}

export function useState<S>(initState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useState() only valid inside an Articulated Function or a Custom Hook.")
  }

  if (!(bucket.nextStateIdx in bucket.states)) {
    const slot = []
    slot[0] = initState
    slot[1] = function setState(state) {
      if (typeof state === 'function') {
        slot[0] = state(slot[0])
      } else {
        slot[0] = state
      }
    }
    bucket.states[bucket.nextStateIdx] = slot
  }

  return [...bucket.states[bucket.nextStateIdx++]] as any
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

export function useMemo<T>(factory: () => T, deps: any[] | undefined): T {
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
      slot[0] = factory()
    } finally {
      slot[1] = deps
    }
  }
  
  bucket.nextMemoizationIdx++

  return slot[0]
}

export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useCallback() only valid inside an Articulated Function or a Custom Hook.")
  }

  return useMemo(() => callback, deps)
}

export function useRef(initValue: any) {
  const bucket = getCurrentBucket()
  if (!bucket) {
    throw new Error("useRef() only valid inside an Articulated Function or a Custom Hook.")
  }
  const [ref] = useState({ current: initValue })
  return ref
}
