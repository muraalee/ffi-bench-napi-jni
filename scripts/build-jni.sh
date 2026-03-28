#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Locate Java — prefer JAVA_HOME, then Homebrew, then PATH
if [ -n "${JAVA_HOME:-}" ]; then
    JAVAC="$JAVA_HOME/bin/javac"
elif [ -d "/opt/homebrew/opt/openjdk@21" ]; then
    JAVAC="/opt/homebrew/opt/openjdk@21/bin/javac"
elif command -v javac &>/dev/null; then
    JAVAC="javac"
else
    echo "Error: javac not found. Install Java or set JAVA_HOME." >&2
    exit 1
fi

echo "Using javac: $JAVAC"

# Build Rust JNI library
cd "$PROJECT_DIR/jni-bench/rust"
cargo build --release

# Compile Java
cd "$PROJECT_DIR"
mkdir -p jni-bench/build
$JAVAC -h jni-bench -d jni-bench/build jni-bench/src/Benchmark.java

echo "JNI build complete."
