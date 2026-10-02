#!/usr/bin/env bash
# Builds the frontend against the deployed API and publishes it to S3 + CloudFront.
set -euo pipefail

STACK_NAME="${STACK_NAME:-employee-dashboard}"
cd "$(dirname "$0")/.."

output() {
  aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}

API_URL="$(output ApiUrl)"
BUCKET="$(output FrontendBucketName)"
DISTRIBUTION_ID="$(output DistributionId)"

VITE_API_URL="$API_URL" npm run build
aws s3 sync dist "s3://$BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" >/dev/null

echo "Deployed: $(output DashboardUrl)"
