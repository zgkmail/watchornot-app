#!/bin/bash
set -e

echo "🚀 Deploying WatchOrNot Frontend to Fly.io"
echo "==========================================="
echo ""

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  macOS/Linux: curl -L https://fly.io/install.sh | sh"
    echo "  Windows: powershell -Command \"iwr https://fly.io/install.ps1 -useb | iex\""
    echo ""
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io"
    echo ""
    echo "Please login first:"
    echo "  fly auth login"
    echo ""
    exit 1
fi

echo "✅ Fly CLI is installed and you're logged in"
echo ""

# Check if app exists
if fly apps list | grep -q "watchornot-frontend"; then
    echo "📦 App 'watchornot-frontend' already exists, deploying update..."
    fly deploy
else
    echo "🆕 Creating new app 'watchornot-frontend'..."
    fly launch --now --no-deploy

    echo ""
    echo "📝 Deploying for the first time..."
    fly deploy
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your frontend is now live at:"
fly apps list | grep watchornot-frontend | awk '{print "   https://"$1".fly.dev"}'
echo ""
echo "📋 Next steps:"
echo "   1. Update your backend FRONTEND_URL:"
echo "      cd backend && fly secrets set FRONTEND_URL=\"https://watchornot-frontend.fly.dev\""
echo ""
echo "   2. Test your deployment:"
echo "      fly open"
echo ""
echo "   3. View logs if needed:"
echo "      fly logs"
echo ""
