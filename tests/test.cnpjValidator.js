const { checkDigit, validateCnpj } = cnpjValidator;

describe("Calculate Check Digit", function() {
  describe("Aplica regras para obtenção de dígito verificador", function(){
    it("Deve ser capaz calcular tanto o primeiro...", function(){
      assert.equal(checkDigit(685566840001), 4);
    });

    it("... quanto o segundo dígito verificador.", function(){
      assert.equal(checkDigit(6855668400014), 6);
    });

    it("Deve retornar 0 se o resultado for maior do que 9", function(){
      assert.equal(checkDigit('036272030001'), 0);
    });
  });

  describe("Casos de Teste", function(){

    function testCase(number, expected) {
      it(`${number} deve retornar ${expected}`, function(){
        assert.equal(checkDigit(number), expected);
      });
    }

    testCase('036272030001', 0);
    testCase('0362720300010',9);
    testCase('375517500001', 6);
    testCase( 3755175000016, 1);
    testCase(  417717060001, 3);
    testCase( 4177170600013, 4);
  });
})

describe("CNPJ Validator", function() {

  describe("Verifica se o número fornecido corresponde a um CNPJ válido", function() {
    it('Retorna true se for um número válido.', function() {
      assert.equal(validateCnpj(68556684000146), true);
    });

    it('Retorna true se for uma string (sem caracteres especiais) que corresponda a um número válido', function() {
      assert.equal(validateCnpj('68556684000146'), true);
    });

    it('Retorna false caso contrário.', function() {
      assert.equal(validateCnpj(99999999999999), false);
    });
  });

  describe("Casos de Teste", function(){

    function numberCase(cnpj, expected) {
      it(`Numero ${cnpj} deve retornar ${expected}`, function(){
        assert.equal(validateCnpj(cnpj), expected);
      });
    }

    function stringCase(cnpj, expected) {
      it(`String '${cnpj}' deve retornar ${expected}`, function(){
        assert.equal(validateCnpj(cnpj), expected);
      });
    }

    numberCase( 0, false );
    stringCase('00000000000000',false);
    stringCase('00342454000176',false);
    stringCase('37551750000161', true);
    stringCase('03627203000109', true);
    numberCase( 37551750000161 , true);
    numberCase( 41771706000134 , true);
  });
});