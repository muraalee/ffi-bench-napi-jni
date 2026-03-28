public class Benchmark {

    static { System.loadLibrary("jni_rust"); }

    // Native methods — same 4 operations as the NAPI benchmark
    public static native int    add(int a, int b);
    public static native double fibonacci(int n);
    public static native String reverseString(String s);
    public static native double sumArray(double[] arr);

    private static final int ITERATIONS = 1_000_000;
    private static final int WARMUP     = 10_000;

    public static void main(String[] args) {
        // Test data — matches the NAPI benchmark
        String str1k    = "abcdefghij".repeat(100);                   // 1,000 chars
        double[] arr100 = new double[100];                            // 100 doubles
        for (int i = 0; i < 100; i++) arr100[i] = i;

        System.out.printf("%nJNI Benchmark — Java → Rust (%dM iterations, %dK warmup)%n%n",
                ITERATIONS / 1_000_000, WARMUP / 1_000);

        System.out.println("  JNI (Rust)");
        System.out.println("  " + "-".repeat(70));
        bench("add(2, 3)",              () -> add(2, 3));
        bench("fibonacci(50)",          () -> fibonacci(50));
        bench("reverse_string(1K)",     () -> reverseString(str1k));
        bench("sum_array(100 doubles)", () -> sumArray(arr100));

        System.out.println("\n  Pure Java");
        System.out.println("  " + "-".repeat(70));
        bench("add(2, 3)",              () -> javaAdd(2, 3));
        bench("fibonacci(50)",          () -> javaFib(50));
        bench("reverse_string(1K)",     () -> javaReverse(str1k));
        bench("sum_array(100 doubles)", () -> javaSum(arr100));

        // Overhead summary
        System.out.println("\n  Overhead (JNI − Java)");
        System.out.println("  " + "-".repeat(70));
        overhead("add(2, 3)",              () -> add(2, 3),              () -> javaAdd(2, 3));
        overhead("fibonacci(50)",          () -> fibonacci(50),          () -> javaFib(50));
        overhead("reverse_string(1K)",     () -> reverseString(str1k),   () -> javaReverse(str1k));
        overhead("sum_array(100 doubles)", () -> sumArray(arr100),       () -> javaSum(arr100));

        System.out.println();
    }

    // -- Pure Java equivalents -----------------------------------------------
    static int javaAdd(int a, int b) { return a + b; }

    static double javaFib(int n) {
        double a = 0, b = 1;
        for (int i = 0; i < n; i++) { double t = a + b; a = b; b = t; }
        return a;
    }

    static String javaReverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }

    static double javaSum(double[] arr) {
        double s = 0;
        for (double v : arr) s += v;
        return s;
    }

    // -- Bench harness -------------------------------------------------------
    static void bench(String name, Runnable fn) {
        for (int i = 0; i < WARMUP; i++) fn.run();

        long start = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) fn.run();
        long elapsed = System.nanoTime() - start;

        double nsPerCall = (double) elapsed / ITERATIONS;
        System.out.printf("  %-40s %10.3f µs/call  (%8.1f ns)%n", name, nsPerCall / 1000, nsPerCall);
    }

    static void overhead(String name, Runnable napiFn, Runnable javaFn) {
        for (int i = 0; i < WARMUP; i++) { napiFn.run(); javaFn.run(); }

        long s1 = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) napiFn.run();
        double jniNs = (double) (System.nanoTime() - s1) / ITERATIONS;

        long s2 = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) javaFn.run();
        double javaNs = (double) (System.nanoTime() - s2) / ITERATIONS;

        double diff = jniNs - javaNs;
        System.out.printf("  %-40s %8.1f ns  (jni: %.1f ns, java: %.1f ns)%n", name, diff, jniNs, javaNs);
    }
}
