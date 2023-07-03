import * as fs from 'fs'
import * as path from 'path'

async function main() {
  // path join
  const pathAdd = path.join(__dirname, '../broadcast/deploy.anvil.s.sol/31337/run-latest.json')
  if (!fs.existsSync(pathAdd)) {
    console.log('File not found')
    return
  }
  const addresses = JSON.parse(fs.readFileSync(pathAdd, 'utf8'))
  //   console.log(addresses);
  const objContracts: Record<any, any> = {}

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
  fs.writeFileSync(path.join(__dirname, '../addresses.json'), JSON.stringify(objContracts, null, 2))
}

main()
