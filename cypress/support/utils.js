function generateCPF() {
    const randomDigits = () => Math.floor(Math.random() * 9);
  
    const calcCheckDigit = (cpfArray, factor) => {
      let total = 0;
      for (let i = 0; i < cpfArray.length; i++) {
        total += cpfArray[i] * factor--;
      }
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
  
    const cpf = [];
    for (let i = 0; i < 9; i++) {
      cpf.push(randomDigits());
    }
  
    cpf.push(calcCheckDigit(cpf, 10)); // 10 to 2 for first check digit
    cpf.push(calcCheckDigit(cpf, 11)); // 11 to 2 for second check digit
  
    return cpf.join('');
  }
  
  module.exports = generateCPF;
  