import fs from 'fs'
import path from 'path'
import { Glob } from 'glob'

const PATH_TO_SAVE = path.join(__dirname, '../addresses.json')
const BROADCAST_DIR = path.join(__dirname, `../broadcast/`)

async function main() {
  const g = new Glob('**/run-latest.json', { cwd: BROADCAST_DIR, withFileTypes: true })
  for await (const entry of g) {
    const chainID = entry.parent?.name
    console.log(entry.fullpath())
    console.log(chainID)

    if (!chainID) {
      console.log('chainID not found')
      continue
    }

    const pathAdd = entry.fullpath()
    if (!fs.existsSync(pathAdd)) {
      console.log('File not found')
      return
    }
    const addresses = JSON.parse(fs.readFileSync(pathAdd, 'utf8'))
    //   console.log(addresses);
    let objContracts: Record<any, any> = {}

    addresses.transactions.forEach((tx: any) => {
      if (tx.transactionType === 'CREATE' && tx.contractName !== 'ERC1967Proxy') {
        objContracts[tx.contractName] = tx.contractAddress
        console.log(`${tx.contractName}: ${tx.contractAddress}`)
      }
    })

    addresses.transactions.forEach((tx: any) => {
      if (tx.transactionType === 'CREATE' && tx.contractName === 'ERC1967Proxy') {
        if ('arguments' in tx && tx.arguments?.length > 0) {
          // find key on objContracts equal to tx.arguments[0]
          const key = Object.keys(objContracts).find(key => objContracts[key] === tx.arguments[0])
          if (key) {
            objContracts[`${key}Proxy`] = tx.contractAddress
          }
        }
      }
    })

    console.log(JSON.stringify(objContracts, null, 2))
    //   save objContracts to file
    // load pathToSave and update

    const currentObjContracts = fs.readFileSync(PATH_TO_SAVE, 'utf8')

    const currentObjContractsJSON = JSON.parse(currentObjContracts)

    objContracts = { [chainID]: objContracts }

    // merge currentObjContractsJSON with objContracts

    const newObjContracts = { ...currentObjContractsJSON, ...objContracts }

    fs.writeFileSync(PATH_TO_SAVE, JSON.stringify(newObjContracts, null, 2))
  }
}

main()
