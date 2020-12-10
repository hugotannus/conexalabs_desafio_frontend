const cnpjValidator = function() {
  function validateCnpj(cnpj) {
    var partial = Math.floor(cnpj / 100);

    var dv1 = checkDigit(partial);
    var dv2 = checkDigit(partial * 10 + dv1);
    var number = partial * 100 + dv1 * 10 + dv2;

    // '==' intentionally preferred over the '==='
    return number > 0 && number == cnpj;
  }


  function checkDigit(partial) {
    var acc = 0;

    while(partial) {
      for(var i=2; i<=9; i++) {
        acc += (partial % 10) * i;
        partial = Math.floor(partial / 10);
      }
    } acc %= 11;

    return (acc < 2) ? 0 : 11 - acc;
  }

  return { validateCnpj, checkDigit };
}();
