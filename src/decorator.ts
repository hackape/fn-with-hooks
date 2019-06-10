import { _callstack, _buckets, IBucket, getCurrentBucket } from './internal'

function decorator<T extends Function>(fn: T): T {
  function wrapper() {
    _callstack.push(wrapper)
    const bucket = getCurrentBucket()
    // reset bucket index
    bucket.stateIdx = 0
    bucket.effectIdx = 0
    bucket.memoizationIdx = 0

    try {
      return fn.apply(this, arguments)
    } finally {
      try {
        runEffects(bucket)
      } finally {
        _callstack.pop()
      }
    }
  }

  function runEffects(bucket: IBucket) {
    for (let idx in bucket.effects) {
      const [effect] = bucket.effects[idx]
      try {
        if (typeof effect === 'function') {
          effect()
        }
      } finally {
        bucket.effects[idx][0] = undefined
      }
    }
  }

  return wrapper as any
}

export function reset(fn: Function) {
  _callstack.push(fn)
  const bucket = getCurrentBucket()
  try {
    for (let dispose of bucket.disposes) {
      if (typeof dispose === 'function') dispose()
    }
  } finally {
    _callstack.pop()
    _buckets.delete(fn)
  }
}

export function withHooks<T extends Function | Function[]>(fns: T): T {
  if (typeof fns === 'function') {
    return decorator(fns)
  } else if (Array.isArray(fns)) {
    return fns.map(fn => {
      if (typeof fns === 'function') return decorator(fn)
      throw new Error('withHooks() takes function or array of function')
    }) as any
  } else {
    throw new Error('withHooks() takes function or array of function')
  }
}
