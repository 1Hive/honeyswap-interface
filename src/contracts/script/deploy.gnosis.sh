#!/bin/bash

source .env

forge script script/deploy.s.sol:Deploy \
    --broadcast \
    --verify \
    --verifier-url https://api.gnosisscan.io/api \
    --etherscan-api-key $GNOSISSCAN_API_KEY \
    -vvvv

# forge verify-contract --verifier-url https://api.gnosisscan.io/api 0x117Dde32ccf781b3ce9C384b30F9f0D20Ea412a2 src/Marquee.sol:Marquee
# forge verify-contract --verifier-url https://api.gnosisscan.io/api 0x2eCBd11C0EB9b131fE3cDa3a2267FEf7648EACBf lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy    