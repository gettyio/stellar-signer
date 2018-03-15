
# StellarSigner [![Build Status](https://travis-ci.org/gettyio/stellar-signer.svg?branch=master)](https://travis-ci.org/gettyio/stellar-signer)

![StellarSigner](https://github.com/gettyio/stellar-signer/raw/master/src/assets/logo.png)

To empower the people who want to use Stellar apps, we need a simple, reliable and secure way to sign transactions without having to share secrets with third-party apps and tools. Because of that we have created StellarSigner, a new and free secure key store app to sign Stellar transactions. 

StellarSigner enable you to never share your secret keys with third party services and apps.

StellarSigner is designed to be among the most secure apps to sign Stellar transactions on iOS and Android.

StellarSigner can already sign transactions submitted to it from other apps or through the copy/paste buffer.

StellarSigner is also a standalone app and any application that wishes to use it, including websites can use it to sign their transactions.

### Why?

It does not have network permissions (no threat of network-based hack or transmission of secure keys directly from the app)
It cannot create transactions
It will decode and display the XDR on screen for the user to review (both pretty and raw views)
It can sign and reject transactions offline
It can offline return the response to the requesting app via copy/paste and/or deep links
It will store the secret encrypting the database file on disk with AES-256+SHA2 by supplying a key typed by the user
6.5. StellarSigner is intended to integrate with hardware wallets for singing, though this work hasn't been implemented yet.
All sensitive information is stored on the phone and can't be used outside the app
Real Native Apps with React Native and Mobx.
Available for iOS and Android


### StellarSigner is proudly built with:

* React Native
* Mobx
* StellarSdk
* Lodash
* Styled-Components
* PouchDB
* Babel
								
### StellarSigner Contributors

Thanks goes to these wonderful people: 😃

* @dbuarque
* @mikefair
* @marlonbrgomes
* @vitorpereira
* @julianorafael
* @jordancassiano
* @pnakibar
* @nilocoelhojunior
* @leocolodette
* @gettyio

###  Sponsored by Getty/IO Inc.
www.getty.io

Notes: On mobile devices, nothing is 100% secure. Any data stored on the phone can be accessed by hardware and OS vendors because they have full control of the device, they can throw whatever computing power they want at cracking any security or encryption. A jailbroken device can access your iOS Keychain/ Android shared preference and key store in plain text, it is necessary to add another layer of protection so even jailbreaking won't leak your data. Because of that we encrypt your keys with a your password before store it locally on your phone. We are planning to add another layer using seed keys soon.
