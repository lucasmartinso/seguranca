// Função para exponenciação modular
function modExp(base, exp, mod) {
  let result = 1n;
  base = base % mod;

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }

  return result;
}

// Lê argumentos da linha de comando
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log("Uso: node diffie-hellman.js <p> <g> <a> <b>");
  process.exit(1);
}

const [pStr, gStr, aStr, bStr] = args;
const p = BigInt(pStr);
const g = BigInt(gStr);
const a = BigInt(aStr);
const b = BigInt(bStr);

// Cálculo das chaves públicas
const A = modExp(g, a, p); // A = g^a mod p
const B = modExp(g, b, p); // B = g^b mod p

// Cálculo do segredo compartilhado
const sAlice = modExp(B, a, p); // s = B^a mod p
const sBob = modExp(A, b, p);   // s = A^b mod p

// Exibe resultados
console.log(`\np = ${p}`);
console.log(`g = ${g}`);
console.log(`a (Alice's secret) = ${a}`);
console.log(`b (Bob's secret) = ${b}`);
console.log(`A (Alice's public key) = ${A}`);
console.log(`B (Bob's public key) = ${B}`);
console.log(`\nShared secret (Alice) = ${sAlice}`);
console.log(`Shared secret (Bob)   = ${sBob}`);