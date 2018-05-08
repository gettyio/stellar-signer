var StellarSdk = require('stellar-sdk')
StellarSdk.Network.useTestNetwork();

// Create transaction with first signer
let keypair0 = StellarSdk.Keypair.random();
let account = new StellarSdk.Account(keypair0.publicKey(), '1234');

let tx = new StellarSdk.TransactionBuilder('GB6HTTYZZAAEX6YBJMZPMTRN4BN2N74EG27TUIBKMLPRHFLIB55NNIZN')
    .addOperation(StellarSdk.Operation.payment({
      destination: 'GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA',
      asset: StellarSdk.Asset.native(),
      amount: '100',
    }))
		.build();
		
		console.log('tx',tx)