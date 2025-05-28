const crypto = require('crypto');

/**
 * Função f - Transformação aplicada em cada rodada da Cifra de Feistel
 * Esta é uma função simples para fins didáticos (não é criptograficamente forte)
 * @param {Buffer} R - Bloco de dados (metade direita)
 * @param {Buffer} key - Chave para a rodada
 * @returns {Buffer} - Resultado da transformação
 */
function f(R, key) {
    // Operação simples: XOR com a chave seguido de rotação de bits
    const result = Buffer.alloc(R.length);
    for (let i = 0; i < R.length; i++) {
        result[i] = R[i] ^ key[i % key.length];
    }
    
    // Rotaciona os bits para a esquerda por 1 posição
    const rotated = Buffer.alloc(result.length);
    for (let i = 0; i < result.length; i++) {
        rotated[i] = ((result[i] << 1) | (result[i] >> 7)) & 0xFF;
    }
    
    return rotated;
}

/**
 * Gera subchaves para cada rodada
 * @param {Buffer} mainKey - Chave principal
 * @param {number} rounds - Número de rodadas
 * @returns {Buffer[]} - Array de subchaves
 */
function generateSubkeys(mainKey, rounds) {
    const subkeys = [];
    const hash = crypto.createHash('sha256');
    hash.update(mainKey);
    let keyMaterial = hash.digest();
    
    for (let i = 0; i < rounds; i++) {
        // Deriva uma subchave para cada rodada
        const roundHash = crypto.createHash('sha256');
        roundHash.update(keyMaterial);
        roundHash.update(Buffer.from([i]));
        const subkey = roundHash.digest().slice(0, 8); // Pega os primeiros 8 bytes
        subkeys.push(subkey);
    }
    
    return subkeys;
}

/**
 * Executa uma rodada da Cifra de Feistel
 * @param {Buffer} L - Metade esquerda
 * @param {Buffer} R - Metade direita
 * @param {Buffer} subkey - Chave da rodada
 * @returns {Object} - Novos L e R
 */
function feistelRound(L, R, subkey) {
    const newL = R;
    const fResult = f(R, subkey);
    const newR = Buffer.alloc(L.length);
    
    for (let i = 0; i < L.length; i++) {
        newR[i] = L[i] ^ fResult[i];
    }
    
    return { L: newL, R: newR };
}

/**
 * Cifra de Feistel - Processo principal (encriptação/decriptação)
 * @param {Buffer} block - Bloco de dados (deve ter tamanho par)
 * @param {Buffer[]} subkeys - Subchaves para cada rodada
 * @param {boolean} isDecrypt - Se true, faz decriptação
 * @returns {Buffer} - Dados processados
 */
function feistelCipher(block, subkeys, isDecrypt = false) {
    // Divide o bloco em duas metades iguais
    const half = block.length / 2;
    let L = block.slice(0, half);
    let R = block.slice(half);
    
    // Para decriptação, usa as subchaves na ordem inversa
    const keys = isDecrypt ? [...subkeys].reverse() : subkeys;
    
    // Executa todas as rodadas
    for (const subkey of keys) {
        const { L: newL, R: newR } = feistelRound(L, R, subkey);
        L = newL;
        R = newR;
    }
    
    // Concatena R+L no final (última troca não ocorre)
    return Buffer.concat([R, L]);
}

/**
 * Encripta dados usando a Cifra de Feistel
 * @param {Buffer} data - Dados a serem encriptados
 * @param {Buffer} key - Chave secreta
 * @returns {Buffer} - Dados encriptados
 */
function encrypt(data, key) {
    const blockSize = 16; // 16 bytes (128 bits)
    const rounds = 16;
    
    // Gera subchaves
    const subkeys = generateSubkeys(key, rounds);
    
    // Preenche o dado se necessário para ter múltiplos do tamanho do bloco
    const padLength = (blockSize - (data.length % blockSize)) % blockSize;
    const paddedData = Buffer.concat([data, Buffer.alloc(padLength, padLength)]);
    
    const encryptedBlocks = [];
    
    // Processa cada bloco
    for (let i = 0; i < paddedData.length; i += blockSize) {
        const block = paddedData.slice(i, i + blockSize);
        const encryptedBlock = feistelCipher(block, subkeys);
        encryptedBlocks.push(encryptedBlock);
    }
    
    return Buffer.concat(encryptedBlocks);
}

/**
 * Decripta dados usando a Cifra de Feistel
 * @param {Buffer} data - Dados encriptados
 * @param {Buffer} key - Chave secreta
 * @returns {Buffer} - Dados decriptados
 */
function decrypt(data, key) {
    const blockSize = 16;
    const rounds = 16;
    
    // Gera subchaves (mesmo processo que na encriptação)
    const subkeys = generateSubkeys(key, rounds);
    
    const decryptedBlocks = [];
    
    // Processa cada bloco
    for (let i = 0; i < data.length; i += blockSize) {
        const block = data.slice(i, i + blockSize);
        const decryptedBlock = feistelCipher(block, subkeys, true);
        decryptedBlocks.push(decryptedBlock);
    }
    
    // Remove preenchimento (padding)
    const lastBlock = decryptedBlocks[decryptedBlocks.length - 1];
    const padLength = lastBlock[lastBlock.length - 1];
    const decryptedData = Buffer.concat(decryptedBlocks);
    
    // Verifica se o padding é válido
    if (padLength <= blockSize) {
        // Remove o padding
        return decryptedData.slice(0, decryptedData.length - padLength);
    }
    
    return decryptedData;
}

// Exemplo de uso
function main() {
    const plaintext = "Hello, Feistel Cipher! This is a test message.";
    const key = crypto.randomBytes(32); // Chave de 256 bits
    
    console.log("Texto original:", plaintext);
    
    // Encriptação
    const encrypted = encrypt(Buffer.from(plaintext), key);
    console.log("Encriptado (hex):", encrypted.toString('hex'));
    
    // Decriptação
    const decrypted = decrypt(encrypted, key);
    console.log("Decriptado:", decrypted.toString('utf8'));
}

main();