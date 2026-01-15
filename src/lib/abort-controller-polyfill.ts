/**
 * AbortController Polyfill for WeChat Mini-Program
 * 小程序环境不支持 AbortController，需要添加 polyfill
 */

// 检查是否已有 AbortController
if (typeof AbortController === 'undefined') {
  // 完整的 AbortSignal polyfill
  class AbortSignalPolyfill {
    aborted = false
    onabort: ((this: AbortSignalPolyfill, ev: any) => any) | null = null
    private listeners: Array<{ type: string; listener: (ev: any) => void }> = []

    abort() {
      if (this.aborted) return
      this.aborted = true
      
      // 触发 onabort 回调
      if (this.onabort) {
        try {
          this.onabort.call(this, { type: 'abort', target: this })
        } catch (e) {
          console.error('Error in onabort handler:', e)
        }
      }
      
      // 触发所有 'abort' 事件监听器
      this.listeners
        .filter(l => l.type === 'abort')
        .forEach(({ listener }) => {
          try {
            listener({ type: 'abort', target: this })
          } catch (e) {
            console.error('Error in abort event listener:', e)
          }
        })
    }

    addEventListener(type: string, listener: (ev: any) => void) {
      if (type === 'abort' && this.aborted) {
        // 如果已经 abort，立即调用
        listener({ type: 'abort', target: this })
        return
      }
      this.listeners.push({ type, listener })
    }

    removeEventListener(type: string, listener: (ev: any) => void) {
      this.listeners = this.listeners.filter(
        l => !(l.type === type && l.listener === listener)
      )
    }

    dispatchEvent(event: any): boolean {
      if (event.type === 'abort') {
        this.abort()
      }
      return true
    }
  }

  // 完整的 AbortController polyfill
  class AbortControllerPolyfill {
    signal = new AbortSignalPolyfill()

    abort() {
      this.signal.abort()
    }
  }

  // 将 polyfill 添加到全局对象
  ;(global as any).AbortController = AbortControllerPolyfill
  ;(global as any).AbortSignal = AbortSignalPolyfill
  
  // 也添加到 window 对象（如果存在）
  if (typeof window !== 'undefined') {
    ;(window as any).AbortController = AbortControllerPolyfill
    ;(window as any).AbortSignal = AbortSignalPolyfill
  }
}

export {}
