# FFI Benchmark: NAPI-RS vs JNI

Benchmarking the cost of calling Rust from TypeScript (via NAPI-RS) and Java (via JNI).

Four identical operations are tested across both FFI boundaries to produce a fair comparison:

| Method | What it measures |
|---|---|
| `add(2, 3)` | Raw FFI call overhead — primitives only, no allocation |
| `fibonacci(50)` | Compute-heavy work — does the Rust speed offset the FFI cost? |
| `reverse_string(1K)` | String marshalling — 1,000 char string across the boundary and back |
| `sum_array(100 doubles)` | Array marshalling — 100 element numeric array |

## Prerequisites

- **Rust** (stable) — [rustup.rs](https://rustup.rs)
- **Node.js** (v18+)
- **Java** (JDK 17+) — set `JAVA_HOME` or install via Homebrew (`brew install openjdk@21`)

## Quick Start

```bash
npm install
npm run build     # builds both NAPI and JNI
npm run bench     # runs both benchmarks
```

## Commands

| Command | Description |
|---|---|
| `npm run build` | Build everything (Rust + TypeScript + Java) |
| `npm run build:napi` | Build Rust NAPI module only |
| `npm run build:jni` | Build Rust JNI library + Java class |
| `npm run bench` | Run both benchmarks side by side |
| `npm run bench:napi` | Run NAPI benchmark only |
| `npm run bench:jni` | Run JNI benchmark only |
| `npm run test:rust` | Run Rust unit tests for both crates |

## Project Structure

```
.
├── native/                 # Rust crate — NAPI-RS bindings
│   ├── Cargo.toml
│   └── src/lib.rs
├── src/
│   └── index.ts            # TypeScript benchmark harness
├── jni-bench/
│   ├── rust/               # Rust crate — JNI bindings
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   └── src/
│       └── Benchmark.java  # Java benchmark harness
├── scripts/
│   ├── build-jni.sh
│   └── bench-jni.sh
├── native-binding.d.ts     # TypeScript type definitions
├── native-binding.js       # Native module loader
├── package.json
└── tsconfig.json
```

## Benchmark Results

Apple Silicon, OpenJDK 21, Node 24, Rust 1.93 (release + LTO), 1M iterations per test.

### Per-call latency (nanoseconds)

| Method | Pure Java | Pure JS | Java→Rust (JNI) | TS→Rust (NAPI) |
|---|---:|---:|---:|---:|
| `add(2, 3)` | 1.4 | 3.8 | 5.3 | 18.1 |
| `fibonacci(50)` | 1.5 | 13.4 | 33.2 | 37.4 |
| `reverse_string(1K)` | 188.3 | 7,400.4 | 2,811.8 | 1,355.9 |
| `sum_array(100)` | 1.2 | 53.9 | 169.4 | 2,647.9 |

### FFI overhead (call cost minus native equivalent)

| Method | JNI overhead | NAPI overhead |
|---|---:|---:|
| `add(2, 3)` | 2.7 ns | 16.8 ns |
| `fibonacci(50)` | 22.5 ns | 22.3 ns |
| `reverse_string(1K)` | 2,518 ns | -5,900 ns (Rust faster than JS) |
| `sum_array(100)` | 169 ns | 2,570 ns |

### Observations

**Raw call overhead:** JNI ~3 ns, NAPI ~17 ns. Both negligible for real workloads.

**Compute (fibonacci):** Both FFI boundaries add ~22 ns of overhead. The Rust computation dominates at that point, making the boundary cost identical.

**String marshalling:** NAPI wins — Rust reverses a 1K string in 1,356 ns vs JavaScript's 7,400 ns. JNI tells the opposite story: 15x slower than pure Java (2,812 ns vs 188 ns). Java's `StringBuilder.reverse()` operates in-place on a contiguous `char[]`, while JNI pays for two UTF-16 ↔ UTF-8 encoding conversions and two allocations per call. The Rust computation itself is fast — it's the round-trip string marshalling that kills it.

**Array handling:** JNI copies the entire `double[]` buffer in one shot (169 ns). NAPI extracts each element individually through V8's API (2,648 ns).

**Bottom line:** FFI tax only matters when the function does less work than the crossing costs. For any meaningful computation, both are fine.

## License

MIT
