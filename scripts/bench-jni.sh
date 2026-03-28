#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Locate Java — prefer JAVA_HOME, then Homebrew, then PATH
if [ -n "${JAVA_HOME:-}" ]; then
    JAVA="$JAVA_HOME/bin/java"
elif [ -d "/opt/homebrew/opt/openjdk@21" ]; then
    JAVA="/opt/homebrew/opt/openjdk@21/bin/java"
elif command -v java &>/dev/null; then
    JAVA="java"
else
    echo "Error: java not found. Install Java or set JAVA_HOME." >&2
    exit 1
fi

cd "$PROJECT_DIR"
$JAVA -Djava.library.path=jni-bench/rust/target/release -cp jni-bench/build Benchmark
