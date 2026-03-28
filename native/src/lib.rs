use napi_derive::napi;

#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[napi]
pub fn fibonacci(n: u32) -> f64 {
    let (mut a, mut b) = (0.0_f64, 1.0_f64);
    for _ in 0..n {
        let t = a + b;
        a = b;
        b = t;
    }
    a
}

#[napi]
pub fn reverse_string(s: String) -> String {
    s.chars().rev().collect()
}

#[napi]
pub fn sum_array(arr: Vec<f64>) -> f64 {
    arr.iter().sum()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn test_fibonacci() {
        assert!((fibonacci(0) - 0.0).abs() < f64::EPSILON);
        assert!((fibonacci(1) - 1.0).abs() < f64::EPSILON);
        assert!((fibonacci(10) - 55.0).abs() < f64::EPSILON);
        assert!((fibonacci(50) - 12586269025.0).abs() < 1.0);
    }

    #[test]
    fn test_reverse_string() {
        assert_eq!(reverse_string("hello".into()), "olleh");
        assert_eq!(reverse_string("".into()), "");
        assert_eq!(reverse_string("a".into()), "a");
    }

    #[test]
    fn test_sum_array() {
        assert!((sum_array(vec![1.0, 2.0, 3.0]) - 6.0).abs() < f64::EPSILON);
        assert!((sum_array(vec![]) - 0.0).abs() < f64::EPSILON);
    }
}
