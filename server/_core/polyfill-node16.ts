/**
 * Node 16 无全局 Headers/Request/Response/WritableStream，tRPC node-http 会报 "X is not defined"。
 * 本文件在生产入口最前 import，确保在任何其他代码之前执行。
 */
function installPolyfills() {
  // Node 16 无全局 WritableStream，writeResponseBody 里会 new WritableStream(...)
  if (typeof (globalThis as any).WritableStream === "undefined") {
    (globalThis as any).WritableStream = class WritableStream {
      private _sink: { write?(chunk: unknown): Promise<void>; close?(): Promise<void> };
      private _state = "writable";
      private _writer: { write(chunk: unknown): Promise<void>; close(): Promise<void> } | null = null;
      constructor(underlyingSink?: { write?(chunk: unknown): Promise<void>; close?(): Promise<void> }) {
        this._sink = underlyingSink ?? {};
      }
      getWriter() {
        if (this._writer) throw new Error("Writer already locked");
        const stream = this;
        this._writer = {
          write(chunk: unknown) {
            if (stream._state !== "writable") return Promise.resolve();
            return stream._sink?.write?.(chunk) ?? Promise.resolve();
          },
          close() {
            if (stream._state !== "writable") return Promise.resolve();
            stream._state = "closed";
            return stream._sink?.close?.() ?? Promise.resolve();
          },
        };
        return this._writer;
      }
    };
  }

  if (typeof (globalThis as any).Headers === "undefined") {
    (globalThis as any).Headers = class Headers {
      private map = new Map<string, string>();
      constructor(init?: [string, string][] | Record<string, string>) {
        if (init) {
          if (Array.isArray(init)) {
            init.forEach(([k, v]) => this.map.set(k.toLowerCase(), String(v)));
          } else if (typeof init === "object" && init !== null) {
            Object.entries(init).forEach(([k, v]) => this.map.set(k.toLowerCase(), String(v)));
          }
        }
      }
      get(name: string) {
        return this.map.get(name.toLowerCase()) ?? null;
      }
      has(name: string) {
        return this.map.has(name.toLowerCase());
      }
      set(name: string, value: string) {
        this.map.set(name.toLowerCase(), value);
      }
      append(name: string, value: string) {
        const k = name.toLowerCase();
        const prev = this.map.get(k);
        this.map.set(k, prev ? `${prev}, ${value}` : value);
      }
      forEach(cb: (value: string, key: string) => void) {
        this.map.forEach(cb);
      }
      entries() {
        return this.map.entries();
      }
      keys() {
        return this.map.keys();
      }
      values() {
        return this.map.values();
      }
      [Symbol.iterator]() {
        return this.map.entries();
      }
    };
  }

  if (typeof (globalThis as any).Request === "undefined") {
    const GHeaders = (globalThis as any).Headers;
    (globalThis as any).Request = class Request {
      url: string;
      method: string;
      headers: InstanceType<typeof GHeaders>;
      body: unknown;
      signal: unknown;
      constructor(
        input: string | URL,
        init?: {
          method?: string;
          headers?: [string, string][] | Record<string, string> | InstanceType<typeof GHeaders>;
          body?: unknown;
          signal?: unknown;
        }
      ) {
        this.url = typeof input === "string" ? input : input.toString();
        this.method = (init?.method ?? "GET").toUpperCase();
        this.body = init?.body;
        this.signal = init?.signal;
        if (init?.headers instanceof GHeaders) {
          this.headers = init.headers;
        } else {
          this.headers = new GHeaders((init?.headers as [string, string][] | Record<string, string>) ?? {});
        }
      }
    };
  }

  if (typeof (globalThis as any).Response === "undefined") {
    const GHeaders = (globalThis as any).Headers;
    (globalThis as any).Response = class Response {
      body: unknown;
      status: number;
      statusText: string;
      headers: InstanceType<typeof GHeaders>;
      ok: boolean;
      constructor(
        body?: string | null,
        init?: {
          status?: number;
          statusText?: string;
          headers?: [string, string][] | Record<string, string> | InstanceType<typeof GHeaders>;
        }
      ) {
        this.status = init?.status ?? 200;
        this.statusText = init?.statusText ?? "";
        this.ok = this.status >= 200 && this.status < 300;
        if (init?.headers instanceof GHeaders) {
          this.headers = init.headers;
        } else {
          this.headers = new GHeaders((init?.headers as [string, string][] | Record<string, string>) ?? {});
        }
        // tRPC writeResponse 使用 response.body.pipeTo(writableStream)，需提供 pipeTo。
        // 只 write(chunk) 不 close(writer)，由 tRPC 的 rawResponse.end() 统一结束，避免 ERR_STREAM_WRITE_AFTER_END
        if (body != null && body !== "") {
          const chunk = new TextEncoder().encode(body);
          this.body = {
            pipeTo(
              dest: { getWriter: () => { write: (c: Uint8Array) => Promise<void>; close: () => Promise<void> } },
              _opts?: { signal?: AbortSignal }
            ): Promise<void> {
              const writer = dest.getWriter();
              if (_opts?.signal?.aborted) return Promise.resolve();
              return writer.write(chunk) as Promise<void>;
            },
          };
        } else {
          this.body = null;
        }
      }
    };
  }
}

installPolyfills();
