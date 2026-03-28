import { add, fibonacci, reverseString, sumArray } from '../native-binding';

const ITERATIONS = 1_000_000;
const WARMUP = 10_000;

function bench(name: string, fn: () => void): void {
    for (let i = 0; i < WARMUP; i++) fn();

    const start = process.hrtime.bigint();
    for (let i = 0; i < ITERATIONS; i++) fn();
    const elapsed = Number(process.hrtime.bigint() - start);

    const nsPerCall = elapsed / ITERATIONS;
    console.log(`  ${name.padEnd(40)} ${(nsPerCall / 1000).toFixed(3).padStart(10)} µs/call  (${nsPerCall.toFixed(1).padStart(8)} ns)`);
}

// -- Test data ---------------------------------------------------------------
const str1k = 'abcdefghij'.repeat(100);                         // 1,000 chars
const arr100 = Array.from({ length: 100 }, (_, i) => i * 1.0);  // 100 doubles

// -- Pure JS equivalents -----------------------------------------------------
function jsAdd(a: number, b: number) { return a + b; }
function jsFib(n: number) {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) { const t = a + b; a = b; b = t; }
    return a;
}
function jsReverse(s: string) { return s.split('').reverse().join(''); }
function jsSum(arr: number[]) { let s = 0; for (const v of arr) s += v; return s; }

// -- Benchmark ---------------------------------------------------------------
console.log(`\nNAPI-RS Benchmark — TypeScript → Rust (${(ITERATIONS / 1e6).toFixed(0)}M iterations, ${(WARMUP / 1e3).toFixed(0)}K warmup)\n`);

console.log('  NAPI (Rust)');
console.log('  ' + '-'.repeat(70));
bench('add(2, 3)',               () => add(2, 3));
bench('fibonacci(50)',           () => fibonacci(50));
bench('reverse_string(1K)',      () => reverseString(str1k));
bench('sum_array(100 doubles)',  () => sumArray(arr100));

console.log('\n  Pure JavaScript');
console.log('  ' + '-'.repeat(70));
bench('add(2, 3)',               () => jsAdd(2, 3));
bench('fibonacci(50)',           () => jsFib(50));
bench('reverse_string(1K)',      () => jsReverse(str1k));
bench('sum_array(100 doubles)',  () => jsSum(arr100));

// -- Overhead summary --------------------------------------------------------
console.log('\n  Overhead (NAPI − JS)');
console.log('  ' + '-'.repeat(70));

function overhead(name: string, napiFn: () => void, jsFn: () => void): void {
    for (let i = 0; i < WARMUP; i++) { napiFn(); jsFn(); }

    const s1 = process.hrtime.bigint();
    for (let i = 0; i < ITERATIONS; i++) napiFn();
    const napiNs = Number(process.hrtime.bigint() - s1) / ITERATIONS;

    const s2 = process.hrtime.bigint();
    for (let i = 0; i < ITERATIONS; i++) jsFn();
    const jsNs = Number(process.hrtime.bigint() - s2) / ITERATIONS;

    const diff = napiNs - jsNs;
    console.log(`  ${name.padEnd(40)} ${diff.toFixed(1).padStart(8)} ns  (napi: ${napiNs.toFixed(1)} ns, js: ${jsNs.toFixed(1)} ns)`);
}

overhead('add(2, 3)',              () => add(2, 3),          () => jsAdd(2, 3));
overhead('fibonacci(50)',          () => fibonacci(50),      () => jsFib(50));
overhead('reverse_string(1K)',     () => reverseString(str1k), () => jsReverse(str1k));
overhead('sum_array(100 doubles)', () => sumArray(arr100),   () => jsSum(arr100));

console.log('');
