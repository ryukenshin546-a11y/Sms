# Deploy SMS Account API Edge Function

# Build and deploy the Edge Function to Supabase
echo "🚀 Deploying SMS Account API Edge Function..."

# Deploy the function
supabase functions deploy create-sms-account

echo "✅ SMS Account API Edge Function deployed successfully!"

# Test the function
echo "🧪 Testing the deployed function..."
echo "You can test the function using:"
echo ""
echo "curl -X POST 'https://your-project.supabase.co/functions/v1/create-sms-account' \\"
echo "  -H 'Authorization: Bearer YOUR_USER_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"creditAmount": 100}'"
echo ""
echo "Replace 'your-project' with your actual Supabase project reference"
echo "Replace 'YOUR_USER_TOKEN' with a valid user JWT token"