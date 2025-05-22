const fs = require('fs');

const frequenciaPortugues = {
  a: 14.63,
  e: 12.57,
  o: 10.73,
  s: 7.81,
  r: 6.53,
  i: 6.18,
  n: 5.05,
  d: 4.99,
  m: 4.74,
  u: 4.63,
  t: 4.34,
  c: 3.88,
  l: 2.78,
  p: 2.52,
  v: 1.67,
  g: 1.30,
  h: 1.28,
  q: 1.20,
  b: 1.04,
  f: 1.02,
  z: 0.47,
  j: 0.40,
  x: 0.21,
  k: 0.02,
  w: 0.01,
  y: 0.01
};

// Função para contar letras no texto
function contarFrequencias(texto) {
  const frequencias = {};
  const letras = texto.toLowerCase().match(/[a-z]/g);

  if (!letras) return {};

  letras.forEach(letra => {
    frequencias[letra] = (frequencias[letra] || 0) + 1;
  });

  return frequencias;
}

// Função para encontrar a letra mais comum
function letraMaisFrequente(frequencias) {
  let maxLetra = '';
  let maxValor = -1;
  for (const letra in frequencias) {
    if (frequencias[letra] > maxValor) {
      maxValor = frequencias[letra];
      maxLetra = letra;
    }
  }
  return maxLetra;
}

// Função para decifrar com um deslocamento específico
function decifrarCesar(texto, deslocamento) {
  return texto.split('').map(char => {
    const code = char.charCodeAt(0);

    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 - deslocamento + 26) % 26) + 97);
    }

    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 - deslocamento + 26) % 26) + 65);
    }

    return char;
  }).join('');
}

// Função principal de criptoanálise
function criptoanaliseCesar(textoCifrado) {
  const freqTexto = contarFrequencias(textoCifrado);
  const letraMaisComum = letraMaisFrequente(freqTexto);

  // Supondo que a letra mais comum no texto cifrado corresponde a 'a' ou 'e' em português
  const suposicoes = ['a', 'e'];

  const resultados = suposicoes.map(letraBase => {
    const deslocamento = (letraMaisComum.charCodeAt(0) - letraBase.charCodeAt(0) + 26) % 26;
    const decifrado = decifrarCesar(textoCifrado, deslocamento);
    return {
      letraBase,
      deslocamento,
      textoDecifrado: decifrado
    };
  });

  return resultados;
}

// --- Execução no terminal ---
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Uso: node criptoanalise.js \"texto_cifrado\"");
  process.exit(1);
}

const textoCifrado = args[0];
const analises = criptoanaliseCesar(textoCifrado);

console.log("Possíveis resultados de criptoanálise:\n");
analises.forEach(r => {
  console.log(`Letra base: '${r.letraBase}' => Deslocamento provável: ${r.deslocamento}`);
  console.log(`Texto decifrado: ${r.textoDecifrado}\n`);
});
