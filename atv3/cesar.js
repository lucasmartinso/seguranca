function cifraDeCesar(texto, deslocamento) {
  const resultado = texto
    .split('')
    .map(char => {
      const codigo = char.charCodeAt(0);

      // Letras minúsculas
      if (codigo >= 97 && codigo <= 122) {
        return String.fromCharCode(((codigo - 97 + deslocamento) % 26) + 97);
      }

      // Letras maiúsculas
      if (codigo >= 65 && codigo <= 90) {
        return String.fromCharCode(((codigo - 65 + deslocamento) % 26) + 65);
      }

      // Caracteres não alfabéticos permanecem iguais
      return char;
    });

  return resultado.join('');
}

// --- Execução pelo terminal ---
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Uso: node cesar.js \"mensagem\" deslocamento");
  process.exit(1);
}

const textoOriginal = args[0];
const deslocamento = parseInt(args[1]);

if (isNaN(deslocamento) || deslocamento < 1) {
  console.log("Por favor, informe um deslocamento válido (número inteiro >= 1).");
  process.exit(1);
}

const textoCifrado = cifraDeCesar(textoOriginal, deslocamento);
console.log(`Texto cifrado: ${textoCifrado}`);
