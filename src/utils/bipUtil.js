import bip39 from 'bip39'
import base64 from 'base-64'
import base64js from 'base64-js'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import cryptocore from 'crypto-js/core'
import randomize from 'randomatic'
import createHmac from 'create-hmac'
import StellarSdk from 'stellar-sdk'
import { isNaN } from 'lodash';
const Buffer = require('buffer/').Buffer

export const getMasterKeyFromSeed = (seed) => {
	const ED25519_CURVE = 'ed25519 seed';
	const hmac = createHmac('sha512', ED25519_CURVE);
	const I = hmac.update(Buffer.from(seed, 'hex')).digest();
	const IL = I.slice(0, 32);
	const IR = I.slice(32);
	return {
			key: IL,
			chainCode: IR,
	};
};

export const CKDPriv = ({ key, chainCode }, index) => {
	const indexBuffer = Buffer.allocUnsafe(4);
	indexBuffer.writeUInt32BE(index, 0);

	const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

	const I = createHmac('sha512', chainCode)
			.update(data)
			.digest();
	const IL = I.slice(0, 32);
	const IR = I.slice(32);
	return {
			key: IL,
			chainCode: IR,
	};
}

export const replaceDerive = (val) => val.replace("'", '')

export const isValidPath = (path) => {
	const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
	if (!pathRegex.test(path)) {
			return false;
	}
	return !path
			.split('/')
			.slice(1)
			.map(replaceDerive)
			.some(isNaN); /* ts T_T*/
};

export const derivePath = (path, seed) => {
	const HARDENED_OFFSET = 0x80000000;

	if (!isValidPath(path)) {
			throw new Error('Invalid derivation path');
	}

	const { key, chainCode } = getMasterKeyFromSeed(seed);
	const segments = path
			.split('/')
			.slice(1)
			.map(replaceDerive)
			.map(el => parseInt(el, 10));

	return segments.reduce(
			(parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET),
			{ key, chainCode },
	);
};

export const generateKeypair = (seed, vn) => {
	const seedHex = bip39.mnemonicToSeedHex(seed);
	const derivationPath = `m/44'/148'/${vn}'`;
	const data = derivePath(derivationPath, seedHex);
	return StellarSdk.Keypair.fromRawEd25519Seed(data.key);
}