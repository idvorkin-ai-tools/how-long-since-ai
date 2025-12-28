default:
    @just --list

# Deploy to surge.sh (staging)
deploy-stage:
    npx surge dist $(gh repo view --json name -q .name)-stage.surge.sh

# Deploy to surge.sh (production)
deploy-prod:
    npx surge dist $(gh repo view --json name -q .name).surge.sh

# Run a local server to preview
serve:
    npx serve dist
