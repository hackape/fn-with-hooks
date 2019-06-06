export type IBucket = {
  states: any[]
  effects: any[]
  disposes: any[]
  memoizations: any[]
  nextStateIdx: number
  nextEffectIdx: number
  nextMemoizationIdx: number
}

export const _buckets = new WeakMap<object, IBucket>()
export const _callstack = []

export function getCurrentBucket() {
  if (_callstack.length) {
    const currentFn = _callstack[_callstack.length - 1]
    if (!_buckets.has(currentFn)) {
      const bucket = {
        states: [],
        effects: [],
        disposes: [],
        memoizations: [],
        nextStateIdx: 0,
        nextEffectIdx: 0,
        nextMemoizationIdx: 0
      }
      _buckets.set(currentFn, bucket)
    }

    return _buckets.get(currentFn)
  }
}
