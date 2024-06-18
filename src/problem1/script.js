var sum_to_n_a = function (n) {
  return (n / 2) * (n + 1);
};

var sum_to_n_b = function (n) {
  let result = 0;
  for (let i = 1; i <= n; i++) {
    result += i;
  }

  return result;
};

var sum_to_n_c = function (n) {
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_b(n - 1);
};