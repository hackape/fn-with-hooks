export type IBucket = {
  states: any[]
  effects: any[]
  disposes: any[]
  memoizations: any[]
  stateIdx: number
  effectIdx: number
  memoizationIdx: number
}

export const _buckets = new WeakMap<object, IBucket>()
export const _callstack = []

export function getCurrentBucket() {
  if (_callstack.length) {
    const currentFn = _callstack[_callstack.length - 1]
    if (!_buckets.has(currentFn)) {
      const bucket: IBucket = {
        states: [],
        effects: [],
        disposes: [],
        memoizations: [],
        stateIdx: 0,
        effectIdx: 0,
        memoizationIdx: 0
      }
      _buckets.set(currentFn, bucket)
    }

    return _buckets.get(currentFn)
  }
}
