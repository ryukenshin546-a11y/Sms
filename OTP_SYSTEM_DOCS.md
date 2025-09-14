# SMS OTP Verification System

## Overview
A comprehensive SMS OTP (One-Time Password) verification system for phone number validation, preventing duplicate registrations and ensuring authentic phone numbers. The system integrates ANTS OTP API with Supabase database management.

## Features

### 🔐 Security Features
- **Rate Limiting**: Configurable cooldown periods between OTP requests
- **Attempt Tracking**: Monitors verification attempts to prevent abuse
- **Session Expiration**: Automatic cleanup of expired OTP sessions
- **Phone Validation**: Validates and formats Thai phone numbers
- **Duplicate Prevention**: Prevents multiple verifications of same phone number

### 🏗️ Architecture
- **Frontend**: React components with TypeScript
- **Backend**: Supabase PostgreSQL database
- **SMS Service**: ANTS OTP API integration
- **State Management**: Custom React hooks
- **Type Safety**: Full TypeScript implementation

## Database Schema

### Tables Created
1. **otp_verifications**: Main OTP session tracking
2. **verified_phone_numbers**: Verified phone number registry
3. **otp_service_tokens**: API token management (future use)

### Key Functions
- `format_phone_number()`: Automatic phone number formatting
- `cleanup_expired_otp_verifications()`: Automated cleanup
- **RLS Policies**: Row-level security for data protection

## Implementation

### 1. Services

#### ANTS OTP Service (`antsOTPService.ts`)
```typescript
// Send OTP
const result = await antsOTP.requestOTP(phoneNumber);

// Verify OTP
const verification = await antsOTP.verifyOTP(otpId, code);

// Resend OTP
const resend = await antsOTP.resendOTP(otpId);
```

#### Supabase OTP Service (`supabaseOTPService.ts`)
```typescript
// Create session
const session = await supabaseOTP.createOTPSession({
  phoneNumber: '66812345678',
  userId: 'user-id'
});

// Update session
await supabaseOTP.updateOTPSession(sessionId, {
  status: 'verified'
});

// Check verification
const isVerified = await supabaseOTP.isPhoneVerified(phoneNumber);
```

#### Simple OTP Service (`simpleOTPService.ts`)
```typescript
// Combined service for easy usage
import { simpleOTPService } from '@/services/simpleOTPService';

// Send OTP
const result = await simpleOTPService.sendOTP({
  phoneNumber: '0812345678'
});

// Verify OTP
const verification = await simpleOTPService.verifyOTP({
  sessionId: result.session.id,
  otpCode: '1234'
});
```

### 2. React Components

#### OTP Verification Component
```typescript
import OTPVerification from '@/components/OTPVerification';

<OTPVerification
  onSuccess={(phoneNumber) => console.log('Verified:', phoneNumber)}
  onError={(error) => console.error('Error:', error)}
  initialPhoneNumber="0812345678"
/>
```

#### useOTP Hook
```typescript
import { useOTP } from '@/hooks/useOTP';

const {
  loading,
  error,
  success,
  sendOTP,
  verifyOTP,
  checkPhoneVerified
} = useOTP({
  onSuccess: (phone, sessionId) => {
    // Handle successful verification
  }
});
```

## Environment Configuration

### Required Variables
```env
# ANTS OTP Service Configuration
VITE_ANTS_OTP_BASE_URL=https://web.smsup-plus.com
VITE_ANTS_OTP_LOGIN_USERNAME=your_username
VITE_ANTS_OTP_LOGIN_PASSWORD=your_password

# OTP Configuration
VITE_OTP_EXPIRES_IN_MINUTES=5
VITE_OTP_MAX_ATTEMPTS=3
VITE_OTP_RESEND_COOLDOWN_SECONDS=60

# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Usage Examples

### 1. Basic Phone Verification
```typescript
import { simpleOTPService } from '@/services/simpleOTPService';

async function verifyUserPhone(phoneNumber: string, userId: string) {
  // Send OTP
  const sendResult = await simpleOTPService.sendOTP({
    phoneNumber,
    userId
  });

  if (!sendResult.success) {
    throw new Error(sendResult.message);
  }

  // User enters OTP code
  const otpCode = await getUserOTPInput();
  
  // Verify OTP
  const verifyResult = await simpleOTPService.verifyOTP({
    sessionId: sendResult.session.id,
    otpCode
  });

  return verifyResult.success;
}
```

### 2. Registration Integration
```typescript
async function registerUser(userData: {
  phoneNumber: string;
  // other fields...
}) {
  // Check if phone is already verified
  const isVerified = await simpleOTPService.isPhoneVerified(
    userData.phoneNumber
  );

  if (!isVerified) {
    throw new Error('Phone number must be verified before registration');
  }

  // Proceed with user registration
  return createUser(userData);
}
```

### 3. Component Integration
```tsx
import React, { useState } from 'react';
import OTPVerification from '@/components/OTPVerification';
import { Button } from '@/components/ui/button';

function RegistrationForm() {
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  return (
    <div>
      {!isPhoneVerified ? (
        <OTPVerification
          onSuccess={(phoneNumber) => {
            setVerifiedPhone(phoneNumber);
            setIsPhoneVerified(true);
          }}
        />
      ) : (
        <div>
          <p>✅ Phone {verifiedPhone} is verified</p>
          <Button onClick={handleRegistration}>
            Complete Registration
          </Button>
        </div>
      )}
    </div>
  );
}
```

## API Integration Details

### ANTS OTP API Endpoints
- **Login**: `POST /login` - Authenticate and get JWT token
- **Request OTP**: `POST /OTP/requestOTP` - Send OTP to phone
- **Verify OTP**: `POST /OTP/verifyOTP` - Verify OTP code
- **Resend OTP**: `POST /OTP/resendOTP` - Resend OTP

### Phone Number Formatting
The system automatically formats Thai phone numbers:
- `0812345678` → `66812345678` (removes leading 0, adds country code)
- `812345678` → `66812345678` (adds country code)
- `66812345678` → `66812345678` (already formatted)

## Error Handling

### Common Error Scenarios
1. **Invalid Phone Number**: Not a valid Thai phone number
2. **Already Verified**: Phone number already verified
3. **OTP Expired**: Session expired before verification
4. **Max Attempts**: Too many failed verification attempts
5. **Rate Limited**: Too many OTP requests in short time
6. **Service Error**: ANTS API or database error

### Error Response Format
```typescript
interface OTPResult {
  success: boolean;
  message: string;
  session?: OTPSession;
  data?: any;
}
```

## Security Considerations

### 1. Rate Limiting
- Configurable cooldown between OTP requests
- Maximum attempts per session
- Session expiration times

### 2. Data Protection
- Row-level security (RLS) policies
- Encrypted sensitive data
- Audit logging

### 3. Phone Number Validation
- Format validation
- Country code enforcement
- Duplicate detection

## Testing

### Manual Testing
```typescript
import { testOTPSystem } from '@/test/otpTest';

// Run comprehensive test
await testOTPSystem();
```

### Demo Page
Access the demo at `/otp-demo` to test functionality interactively.

## Deployment Checklist

### 1. Database Migration
```bash
supabase db push
```

### 2. Environment Variables
- Set all required ANTS OTP credentials
- Configure OTP timing parameters
- Update Supabase connection settings

### 3. Type Generation
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

### 4. Build & Test
```bash
npm run build
npm run test
```

## Future Enhancements

### Phase 2 Planned Features
1. **Multi-language Support**: Thai/English SMS templates
2. **Voice OTP**: Alternative verification method
3. **Admin Dashboard**: OTP analytics and management
4. **Webhook Integration**: Real-time status updates
5. **Bulk Verification**: Enterprise features

### Performance Optimizations
1. **Caching**: Redis integration for session management
2. **Queue System**: Background OTP processing
3. **Load Balancing**: Multiple ANTS API endpoints
4. **Monitoring**: Comprehensive logging and alerts

## Support

### Documentation
- [ANTS OTP API Documentation](https://web.smsup-plus.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Troubleshooting
1. Check environment variables
2. Verify database migration status
3. Test ANTS API credentials
4. Review Supabase logs

---

*Last updated: September 14, 2025*
*Version: 1.0.0*