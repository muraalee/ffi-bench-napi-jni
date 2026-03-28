use jni::objects::{JClass, JDoubleArray, JString};
use jni::sys::{jdouble, jint};
use jni::JNIEnv;

#[no_mangle]
pub extern "system" fn Java_Benchmark_add(_env: JNIEnv, _class: JClass, a: jint, b: jint) -> jint {
    a + b
}

#[no_mangle]
pub extern "system" fn Java_Benchmark_fibonacci(
    _env: JNIEnv,
    _class: JClass,
    n: jint,
) -> jdouble {
    let (mut a, mut b) = (0.0_f64, 1.0_f64);
    for _ in 0..n {
        let t = a + b;
        a = b;
        b = t;
    }
    a
}

#[no_mangle]
pub extern "system" fn Java_Benchmark_reverseString<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass<'local>,
    input: JString<'local>,
) -> JString<'local> {
    let s: String = env.get_string(&input).expect("invalid string").into();
    let reversed: String = s.chars().rev().collect();
    env.new_string(&reversed).expect("failed to create string")
}

#[no_mangle]
pub extern "system" fn Java_Benchmark_sumArray<'local>(
    env: JNIEnv<'local>,
    _class: JClass<'local>,
    arr: JDoubleArray<'local>,
) -> jdouble {
    let len = env.get_array_length(&arr).expect("failed to get array length") as usize;
    let mut buf = vec![0.0_f64; len];
    env.get_double_array_region(&arr, 0, &mut buf)
        .expect("failed to read array");
    buf.iter().sum()
}
