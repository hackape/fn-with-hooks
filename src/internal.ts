type EffectCallback = () => (void | EffectDisposer)
type EffectDeps = any[]
type EffectDisposer = () => void
export type IBucket = {
  states: any[]
  effects: [EffectCallback?, EffectDeps?, EffectDisposer?][]
  memos: any[]
  stateIdx: number
  effectIdx: number
  memoIdx: number
}

export const _buckets = new WeakMap<object, IBucket>()
export const _callstack = []

export function getCurrentBucket(callerName='Hooks') {
  if (!_callstack.length) {
    throw new Error('`' + callerName + '` only valid inside a function decorated with `withHooks()` or a custom hook.')
  }
  const currentFn = _callstack[_callstack.length - 1]
  if (!_buckets.has(currentFn)) {
    const bucket: IBucket = {
      states: [],
      effects: [],
      memos: [],
      stateIdx: 0,
      effectIdx: 0,
      memoIdx: 0
    }
    _buckets.set(currentFn, bucket)
  }

  return _buckets.get(currentFn)
}
