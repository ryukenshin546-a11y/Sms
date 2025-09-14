/**
 * OTP Demo Page
 * Demonstrates OTP verification functionality
 * Updated: September 14, 2025
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Phone, Shield, AlertTriangle } from 'lucide-react';
import OTPVerification from '@/components/OTPVerification';
import { useOTP } from '@/hooks/useOTP';

const OTPDemo: React.FC = () => {
  const [verifiedPhones, setVerifiedPhones] = useState<string[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const {
    loading,
    error,
    success,
    isVerified,
    sendOTP,
    verifyOTP,
    checkPhoneVerified,
    clearError,
    reset
  } = useOTP({
    onSuccess: (phoneNumber, sessionId) => {
      console.log('OTP Verified Successfully:', { phoneNumber, sessionId });
      if (phoneNumber && !verifiedPhones.includes(phoneNumber)) {
        setVerifiedPhones(prev => [...prev, phoneNumber]);
      }
    },
    onError: (error) => {
      console.error('OTP Error:', error);
    }
  });

  const handleOTPSuccess = (phoneNumber: string) => {
    if (!verifiedPhones.includes(phoneNumber)) {
      setVerifiedPhones(prev => [...prev, phoneNumber]);
    }
  };

  const handleCheckPhone = async (phone: string) => {
    const isVerified = await checkPhoneVerified(phone);
    alert(`Phone ${phone} is ${isVerified ? 'verified' : 'not verified'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">SMS OTP Verification System</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure phone number verification using SMS OTP to prevent duplicate registrations and ensure authentic phone numbers.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Phone Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Validates Thai phone numbers with automatic country code formatting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                SMS Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Integrated with ANTS OTP service for reliable SMS delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                Database Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Comprehensive session management and verification tracking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Verified Phones Display */}
        {verifiedPhones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Verified Phone Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {verifiedPhones.map((phone, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {phone} ✓
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>
              Test the OTP verification system with different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setShowDemo(true)}
                variant="default"
              >
                Start OTP Demo
              </Button>
              
              <Button 
                onClick={() => handleCheckPhone('0812345678')}
                variant="outline"
              >
                Check Sample Phone
              </Button>
              
              <Button 
                onClick={() => {
                  setVerifiedPhones([]);
                  reset();
                  setShowDemo(false);
                }}
                variant="outline"
              >
                Reset Demo
              </Button>
            </div>

            {/* Hook Demo */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">useOTP Hook Demo</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  {loading && <Badge variant="secondary">Loading...</Badge>}
                  {isVerified && <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>}
                  {error && <Badge variant="destructive">Error</Badge>}
                </div>
                
                {success && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription className="text-green-600">{success}</AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OTP Verification Component */}
        {showDemo && (
          <OTPVerification
            onSuccess={handleOTPSuccess}
            onError={(error) => console.error('OTP Component Error:', error)}
            className="max-w-md mx-auto"
          />
        )}

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>
              Technical overview of the OTP verification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backend Services</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• ANTS OTP API Integration</li>
                  <li>• Supabase Database Management</li>
                  <li>• Session Management</li>
                  <li>• Phone Number Validation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frontend Components</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• OTPVerification React Component</li>
                  <li>• useOTP Custom Hook</li>
                  <li>• TypeScript Type Safety</li>
                  <li>• Error Handling & UI Feedback</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Rate Limiting & Cooldowns</li>
                  <li>• Attempt Tracking</li>
                  <li>• Session Expiration</li>
                  <li>• Phone Format Validation</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Database Schema</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• otp_verifications table</li>
                  <li>• verified_phone_numbers table</li>
                  <li>• RLS Security Policies</li>
                  <li>• Automated Cleanup Functions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>
              Required environment variables for OTP functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
              <div className="text-gray-600"># ANTS OTP Service</div>
              <div>VITE_ANTS_OTP_BASE_URL=https://web.smsup-plus.com</div>
              <div>VITE_ANTS_OTP_LOGIN_USERNAME=your_username</div>
              <div>VITE_ANTS_OTP_LOGIN_PASSWORD=your_password</div>
              <div className="mt-2 text-gray-600"># OTP Configuration</div>
              <div>VITE_OTP_EXPIRES_IN_MINUTES=5</div>
              <div>VITE_OTP_MAX_ATTEMPTS=3</div>
              <div>VITE_OTP_RESEND_COOLDOWN_SECONDS=60</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPDemo;