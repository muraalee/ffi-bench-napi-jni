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

## Sample Results (Apple Silicon, 1M iterations)

```
NAPI-RS (TypeScript → Rust)           JNI (Java → Rust)
─────────────────────────────         ─────────────────────────────
add(2, 3)           17 ns/call        add(2, 3)            5 ns/call
fibonacci(50)       38 ns/call        fibonacci(50)       35 ns/call
reverse_string(1K)  1,381 ns/call     reverse_string(1K)  2,873 ns/call
sum_array(100)      2,716 ns/call     sum_array(100)      173 ns/call
```

### Raw FFI call overhead (primitives only)

| | Per-call overhead |
|---|---|
| **JNI** | ~3 ns |
| **NAPI** | ~17 ns |

Both are negligible for real workloads. The marshalling cost (strings, arrays) is what matters in practice.

## License

MIT
