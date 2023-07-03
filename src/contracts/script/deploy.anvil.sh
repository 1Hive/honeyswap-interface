# source .env
# forge script scripts/deploy.anvil.s.sol:DeployAnvil \
#     -f http://127.0.0.1:8545 \
#     --broadcast
forge script script/deploy.anvil.s.sol:DeployAnvil \
    -f http://127.0.0.1:8545 \
    --broadcast