/* eslint-disable @typescript-eslint/no-var-requires */
// Copies the installed @markee_team/sdk browser bundle into public/ so the app can load it with a
// native import(). The SDK ships modern syntax (class fields, BigInt literals) that this app's
// webpack 4 / Babel toolchain cannot bundle. The installed version is pinned by yarn.lock.
const fs = require('fs')
const path = require('path')

const packageDir = path.join(__dirname, '..', 'node_modules', '@markee_team', 'sdk')
const { version } = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
const target = path.join(__dirname, '..', 'public', 'markee-sdk.js')

fs.copyFileSync(path.join(packageDir, 'dist', 'index.js'), target)
console.log(`Copied @markee_team/sdk@${version} to public/markee-sdk.js`)
