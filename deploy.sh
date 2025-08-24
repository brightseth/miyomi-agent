#!/bin/bash

echo "🚀 Deploying Miyomi to Production"
echo "================================="

# Check for required environment variables
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ Error: ANTHROPIC_API_KEY not set in .env"
    exit 1
fi

echo "✅ Environment variables loaded"

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial Miyomi setup"
fi

# Create GitHub repo if not exists
if ! git remote | grep -q origin; then
    echo "🐙 Creating GitHub repository..."
    gh repo create miyomi-agent --public --source=. --push
else
    echo "✅ GitHub repository already connected"
fi

# Push latest changes
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Update Miyomi configuration" || true
git push -u origin main

# Deploy to Vercel
echo "▲ Deploying to Vercel..."
if [ ! -d .vercel ]; then
    vercel --yes
else
    vercel --prod
fi

echo ""
echo "✨ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Vercel Dashboard"
echo "2. Configure Supabase tables (see SETUP.md)"
echo "3. Add social media API keys"
echo ""
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "GitHub Repo: https://github.com/$(git config user.name)/miyomi-agent"