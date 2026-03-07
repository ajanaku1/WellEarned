#!/bin/bash
set -e
echo "=== WellEarned Rewards Program Deployment ==="
echo "1. Building program..."
anchor build
echo "2. Getting program ID..."
PROGRAM_ID=$(solana address -k target/deploy/wellearned_rewards-keypair.json)
echo "Program ID: $PROGRAM_ID"
echo "3. Updating program ID in source..."
sed -i '' "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PROGRAM_ID\")/" programs/wellearned-rewards/src/lib.rs
sed -i '' "s/wellearned_rewards = \"[^\"]*\"/wellearned_rewards = \"$PROGRAM_ID\"/" Anchor.toml
echo "4. Rebuilding with correct ID..."
anchor build
echo "5. Deploying to devnet..."
anchor deploy --provider.cluster devnet
echo "6. Done! Program deployed at: $PROGRAM_ID"
echo ""
echo "Add this to your .env:"
echo "WELLEARNED_PROGRAM_ID=$PROGRAM_ID"
