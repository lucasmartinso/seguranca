const crypto = require("crypto");
const fs = require("fs");

function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function isProbablyPrime(n, k = 5) {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;

  let r = 0n;
  let d = n - 1n;
  while (d % 2n === 0n) {
    d /= 2n;
    r += 1n;
  }

  const bitLength = n.toString(2).length;
  const byteLength = Math.ceil(bitLength / 8);

  WitnessLoop:
  for (let i = 0; i < k; i++) {
    let a;
    do {
      const buf = crypto.randomBytes(byteLength);
      a = BigInt('0x' + buf.toString('hex')) % (n - 3n) + 2n;
    } while (a < 2n || a >= n - 1n);

    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;

    for (let j = 0n; j < r - 1n; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) continue WitnessLoop;
    }

    return false;
  }

  return true;
}

function modPow(base, exp, mod) {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp /= 2n;
  }
  return result;
}

function generatePrime(bits) {
  while (true) {
    let p = BigInt("0x" + crypto.randomBytes(bits / 8).toString("hex")) | 1n;
    if (p % 4n !== 3n) p += 2n;
    if (isProbablyPrime(p)) return p;
  }
}

function generateSeed(n) {
  while (true) {
    const s = BigInt("0x" + crypto.randomBytes(64).toString("hex"));
    if (gcd(s, n) === 1n) return s;
  }
}

function bbs(p, q, s, numBits) {
  const n = p * q;
  let x = (s * s) % n;
  let bits = "";

  for (let i = 0; i < numBits; i++) {
    x = (x * x) % n;
    bits += (x % 2n).toString();
  }

  return { bits, n };
}

// ==== EXECUÇÃO ====

const numBits = 4096;
const p = generatePrime(128);
const q = generatePrime(128);
const n = p * q;
const s = generateSeed(n);
const { bits } = bbs(p, q, s, numBits);

// Exportar como .txt para testar
fs.writeFileSync("bbs-output-tuned.txt", bits);
console.log("Arquivo gerado: bbs-output-tuned.txt");
console.log(`p = ${p}`);
console.log(`q = ${q}`);
console.log(`s = ${s}`);
console.log(`n = ${n}`);
