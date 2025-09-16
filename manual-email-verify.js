// Manual Email Verification Update
// Run this in browser console to manually verify email for testing

const supabase = window.supabase || createClient(
  'https://mnhdueclyzwtfkmwttkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGR1ZWNseXp3dGZrbXd0dGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU4Nzg2MjAsImV4cCI6MjA0MTQ1NDYyMH0.wNJkqHdGkwf-xfejYWaGFaJd1ZCzWbPdh6Q_e4Kd7LI'
);

// Update email verification for current user
async function verifyCurrentUserEmail() {
  const userId = '74b3dd5f-6107-4417-b731-bd23bf9016ae'; // Your user ID
  
  const { error } = await supabase
    .from('profiles')
    .update({ email_verified: true })
    .eq('id', userId);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Email verified successfully!');
    // Refresh the page to see changes
    window.location.reload();
  }
}

// Call this function
verifyCurrentUserEmail();