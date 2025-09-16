import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
        console.log('✅ User account created successfully');
        console.log('📧 Email confirmation disabled - user can proceed immediately');

        // Step 1.5: Save user profile data to profiles table
        if (authData.user?.id) {
          console.log('💾 Saving user profile data...');
          
          const profileData = {
            id: authData.user.id,
            username: formData.username,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            account_type: selectedAccountType,
            email_verified: false, // Will be verified later in profile page
            phone_verified: false, // Will be updated after OTP verification
            credit_balance: 100, // Free credits
            // Personal account fields
            ...(selectedAccountType === 'personal' && {
              id_card: formData.idCard,
              address: formData.address,
              use_same_address: formData.useSameAddress,
              billing_address: formData.useSameAddress ? formData.address : formData.billingAddress
            }),
            // Corporate account fields  
            ...(selectedAccountType === 'corporate' && {
              company_registration: formData.companyRegistration,
              company_name_th: formData.companyNameTh,
              company_name_en: formData.companyNameEn,
              company_address: formData.companyAddress,
              tax_id: formData.taxId,
              company_phone: formData.companyPhone,
              authorized_person: formData.authorizedPerson,
              position: formData.position,
              business_type: formData.businessType,
              use_same_address_for_billing: formData.useSameAddressForBilling,
              billing_address: formData.useSameAddressForBilling ? formData.companyAddress : formData.billingAddress
            })
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) {
            console.error('❌ Profile creation failed:', profileError);
            throw new Error(`Failed to save profile data: ${profileError.message}`);
          }

          console.log('✅ Profile data saved successfully');
        }port { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AccountTypeSelection from '@/components/AccountTypeSelection';
import CorporateFields from '@/components/CorporateFields';
import OTPVerification from '@/components/OTPVerification';
import { supabase } from '@/lib/supabase';
import { simpleOTPService } from '@/services/simpleOTPService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Phone, Mail, UserCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // Multi-step registration states
  const [currentStep, setCurrentStep] = useState<'form' | 'otp' | 'success'>('form');
  const [registrationProgress, setRegistrationProgress] = useState(33);
  
  // Registration flow states
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string>('');
  
  const [selectedAccountType, setSelectedAccountType] = useState<'personal' | 'corporate'>('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    company: '',
    businessType: '',
    password: '',
    confirmPassword: '',
    idCard: '',
    address: '',
    useSameAddress: false,
    billingAddress: '',
    // Corporate fields
    companyRegistration: '',
    companyNameTh: '',
    companyNameEn: '',
    companyAddress: '',
    taxId: '',
    companyPhone: '',
    authorizedPerson: '',
    position: '',
    useSameAddressForBilling: false
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'text-gray-500'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // ฟังก์ชันตรวจสอบความแข็งแกร่งของรหัสผ่าน
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';
    let color = 'text-gray-500';

    // ตรวจสอบความยาว
    if (password.length >= 12) {
      score += 1;
    } else if (password.length >= 8) {
      score += 0.5;
    }

    // ตรวจสอบตัวพิมพ์ใหญ่
    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // ตรวจสอบตัวพิมพ์เล็ก
    if (/[a-z]/.test(password)) {
      score += 1;
    }

    // ตรวจสอบตัวเลข
    if (/\d/.test(password)) {
      score += 1;
    }

    // ตรวจสอบสัญลักษณ์พิเศษ
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    }

    // ตรวจสอบไม่ใช่รหัสผ่านที่ง่ายเกินไป
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      score -= 1;
    }

    // กำหนด feedback และสี
    if (score < 2) {
      feedback = 'รหัสผ่านอ่อนมาก';
      color = 'text-red-500';
    } else if (score < 3) {
      feedback = 'รหัสผ่านอ่อน';
      color = 'text-orange-500';
    } else if (score < 4) {
      feedback = 'รหัสผ่านปานกลาง';
      color = 'text-yellow-500';
    } else if (score < 5) {
      feedback = 'รหัสผ่านแข็งแรง';
      color = 'text-green-500';
    } else {
      feedback = 'รหัสผ่านแข็งแรงมาก';
      color = 'text-green-600';
    }

    setPasswordStrength({ score, feedback, color });
  };

  const handleAccountTypeSelect = (type: 'personal' | 'corporate') => {
    setSelectedAccountType(type);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        [field]: field === 'useSameAddress' || field === 'useSameAddressForBilling' 
          ? value === 'true' 
          : value
      };

      // ตรวจสอบ confirm password แบบ real-time หลังจากอัปเดต formData แล้ว
      if (field === 'confirmPassword') {
        if (value && value !== updatedFormData.password) {
          setErrors(prevErrors => ({
            ...prevErrors,
            confirmPassword: 'รหัสผ่านไม่ตรงกัน'
          }));
        } else if (value && value === updatedFormData.password) {
          setErrors(prevErrors => ({
            ...prevErrors,
            confirmPassword: ''
          }));
        }
      }

      return updatedFormData;
    });

    // Clear error for this field (ยกเว้น confirmPassword ที่จัดการแล้ว)
    if (errors[field] && field !== 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // ตรวจสอบความแข็งแกร่งของรหัสผ่านแบบ real-time
    if (field === 'password') {
      checkPasswordStrength(value);
    }
  };

  const validateForm = () => {
    console.log('validateForm called');
    console.log('Current formData:', formData);
    console.log('selectedAccountType:', selectedAccountType);
    console.log('acceptTerms:', acceptTerms);
    
    const newErrors: Record<string, string> = {};

    // Basic validation (removed accountType validation since it's now always set)
    if (!formData.firstName.trim()) {
      console.log('firstName validation failed');
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }
    if (!formData.lastName.trim()) {
      console.log('lastName validation failed');
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!formData.username.trim()) {
      console.log('username validation failed - empty');
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      console.log('username validation failed - too short');
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      console.log('username validation failed - invalid characters');
      newErrors.username = 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และขีดล่างเท่านั้น';
    }

    if (!formData.email.trim()) {
      console.log('email validation failed - empty');
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      console.log('email validation failed - invalid format');
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.phone.trim()) {
      console.log('phone validation failed');
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    }

    if (!formData.password.trim()) {
      console.log('password validation failed - empty');
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 12) {
      console.log('password validation failed - too short');
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      console.log('password validation failed - complexity');
      newErrors.password = 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์พิเศษ';
    } else if (/\s/.test(formData.password)) {
      console.log('password validation failed - spaces');
      newErrors.password = 'รหัสผ่านต้องไม่มีช่องว่าง';
    } else if (passwordStrength.score < 3) {
      console.log('password validation failed - strength score:', passwordStrength.score);
      newErrors.password = 'รหัสผ่านไม่แข็งแรงเพียงพอ กรุณาปรับปรุง';
    }

    if (!formData.confirmPassword.trim()) {
      console.log('confirmPassword validation failed - empty');
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.confirmPassword !== formData.password) {
      console.log('confirmPassword validation failed - mismatch');
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // Corporate-specific validation
    if (selectedAccountType === 'corporate') {
      if (!formData.companyRegistration.trim()) {
        newErrors.companyRegistration = 'กรุณากรอกเลขทะเบียนบริษัท';
      } else if (!/^[0-9]{13}$/.test(formData.companyRegistration)) {
        newErrors.companyRegistration = 'เลขทะเบียนบริษัทต้องเป็นตัวเลข 13 หลัก';
      }

      if (!formData.companyNameTh.trim()) {
        newErrors.companyNameTh = 'กรุณากรอกชื่อบริษัทภาษาไทย';
      }

      if (!formData.companyAddress.trim()) {
        newErrors.companyAddress = 'กรุณากรอกที่อยู่บริษัท';
      }

      if (!formData.authorizedPerson.trim()) {
        newErrors.authorizedPerson = 'กรุณากรอกชื่อผู้มีอำนาจลงนาม';
      }

      if (!formData.position.trim()) {
        newErrors.position = 'กรุณาเลือกตำแหน่ง';
      }

      if (!formData.businessType.trim()) {
        newErrors.businessType = 'กรุณาเลือกประเภทธุรกิจ';
      }

      if (!formData.useSameAddressForBilling && !formData.billingAddress.trim()) {
        newErrors.billingAddress = 'กรุณากรอกที่อยู่สำหรับออกใบเสร็จ';
      }
    }

    // Individual-specific validation
    if (selectedAccountType === 'personal') {
      if (!formData.idCard.trim()) {
        newErrors.idCard = 'กรุณากรอกเลขบัตรประจำตัวประชาชน';
      } else if (!/^[0-9]{13}$/.test(formData.idCard)) {
        newErrors.idCard = 'เลขบัตรประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'กรุณากรอกที่อยู่';
      }

      if (!formData.useSameAddress && !formData.billingAddress.trim()) {
        newErrors.billingAddress = 'กรุณากรอกที่อยู่สำหรับออกใบเสร็จ';
      }
    }

    if (!acceptTerms) {
      console.log('terms validation failed');
      newErrors.terms = 'กรุณายอมรับข้อกำหนดการใช้งาน';
    }

    console.log('Validation errors found:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Multi-step registration functions
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Step 1: Create user account with Supabase Auth (disable email confirmation for now)
        console.log('🚀 Creating user account...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`,
            data: {
              username: formData.username,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              account_type: selectedAccountType
            }
          }
        });

        if (authError) {
          console.error('❌ Auth signup failed:', authError);
          throw new Error(authError.message);
        }

        // Store user ID for later use
        if (authData.user?.id) {
          setRegisteredUserId(authData.user.id);
        }

        console.log('✅ User account created successfully');
        console.log('� Email confirmation disabled - user can proceed immediately');

        // Step 2: Move to OTP verification (Skip sign-in step)
        setCurrentStep('otp');
        setRegistrationProgress(66);
        console.log('✅ Proceeding to OTP verification without email confirmation requirement');
        setCurrentStep('otp');
        setRegistrationProgress(66);
        console.log('✅ User account created, proceeding to OTP verification');

      } catch (error: any) {
        console.error('Registration failed:', error);
        setSubmitError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOTPSuccess = async (verifiedPhone: string) => {
    console.log('📱 Phone verification successful:', verifiedPhone);
    setPhoneVerified(true);
    setRegistrationProgress(100);
    
    // Complete registration - go directly to profile
    setCurrentStep('success');
    console.log('✅ Registration completed, going to profile');
  };

  const handleOTPError = (error: string) => {
    console.error('❌ OTP verification failed:', error);
    setSubmitError(error);
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setRegistrationProgress(33);
    setPhoneVerified(false);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'form': return <UserCheck className="w-5 h-5" />;
      case 'otp': return <Phone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'success': return <CheckCircle2 className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStepTitle = (step: string) => {
    switch (step) {
      case 'form': return 'ข้อมูลส่วนตัว';
      case 'otp': return 'ยืนยันเบอร์โทร';
      case 'success': return 'เสร็จสิ้น';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                เริ่มต้นใช้งาน SMS-UP+
              </h1>
              <p className="text-xl text-muted-foreground">
                สมัครสมาชิกและเริ่มเพิ่มยอดขายได้ทันที
              </p>
            </div>

            <div className="container mx-auto px-4">
              {/* Registration Form */}
              <Card className="shadow-professional max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">สร้างบัญชีใหม่</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลเพื่อเริ่มทดลองใช้ฟรี 14 วัน
                  </CardDescription>
                  
                  {/* Progress Indicator */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            currentStep === 'form' ? 'bg-primary border-primary text-primary-foreground' :
                            ['otp', 'email', 'success'].includes(currentStep) ? 'bg-green-500 border-green-500 text-white' :
                            'bg-background border-muted-foreground text-muted-foreground'
                          }`}>
                            {getStepIcon('form')}
                          </div>
                          <div className="hidden md:block">
                            <p className="text-sm font-medium">{getStepTitle('form')}</p>
                          </div>
                        </div>
                        
                        <div className={`w-16 h-1 transition-all duration-300 ${
                          ['otp', 'email', 'success'].includes(currentStep) ? 'bg-green-500' : 'bg-muted'
                        }`}></div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            currentStep === 'otp' ? 'bg-primary border-primary text-primary-foreground' :
                            ['email', 'success'].includes(currentStep) ? 'bg-green-500 border-green-500 text-white' :
                            'bg-background border-muted-foreground text-muted-foreground'
                          }`}>
                            {getStepIcon('otp')}
                          </div>
                          <div className="hidden md:block">
                            <p className="text-sm font-medium">{getStepTitle('otp')}</p>
                          </div>
                        </div>
                        
                        <div className={`w-16 h-1 transition-all duration-300 ${
                          currentStep === 'success' ? 'bg-green-500' : 'bg-muted'
                        }`}></div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            currentStep === 'success' ? 'bg-green-500 border-green-500 text-white' :
                            'bg-background border-muted-foreground text-muted-foreground'
                          }`}>
                            {getStepIcon('success')}
                          </div>
                          <div className="hidden md:block">
                            <p className="text-sm font-medium">{getStepTitle('success')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>ความคืบหน้า</span>
                        <span>{registrationProgress}%</span>
                      </div>
                      <Progress value={registrationProgress} className="h-2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Registration Form */}
                  {currentStep === 'form' && (
                    <div className="space-y-6">
                      <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Account Type Selection */}
                    <AccountTypeSelection
                      selectedType={selectedAccountType}
                      onTypeSelect={handleAccountTypeSelect}
                    />

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">ชื่อ <span className="text-red-500">*</span></Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="ชื่อของคุณ"
                          className={errors.firstName ? 'border-red-500' : ''}
                          autoComplete="given-name"
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-500">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">นามสกุล <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="นามสกุลของคุณ"
                          className={errors.lastName ? 'border-red-500' : ''}
                          autoComplete="family-name"
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-500">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">ชื่อผู้ใช้ <span className="text-red-500">*</span></Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="ชื่อผู้ใช้ของคุณ"
                        className={errors.username ? 'border-red-500' : ''}
                        autoComplete="username"
                      />
                      {errors.username && (
                        <p className="text-xs text-red-500">{errors.username}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={errors.email ? 'border-red-500' : ''}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className={errors.phone ? 'border-red-500' : ''}
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">รหัสผ่าน <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="รหัสผ่านของคุณ (อย่างน้อย 12 ตัวอักษร)"
                        className={errors.password ? 'border-red-500' : ''}
                        autoComplete="new-password"
                      />
                      {errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                      {formData.password && (
                        <div className="text-xs">
                          <span className={`font-medium ${passwordStrength.color}`}>
                            ความแข็งแกร่ง: {passwordStrength.feedback}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Individual-specific fields */}
                    {selectedAccountType === 'personal' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="idCard">เลขบัตรประจำตัวประชาชน <span className="text-red-500">*</span></Label>
                          <Input
                            id="idCard"
                            value={formData.idCard}
                            onChange={(e) => handleInputChange('idCard', e.target.value)}
                            placeholder="13 หลัก"
                            className={errors.idCard ? 'border-red-500' : ''}
                            maxLength={13}
                          />
                          {errors.idCard && (
                            <p className="text-xs text-red-500">{errors.idCard}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">ที่อยู่ <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="ที่อยู่ของคุณ"
                            className={errors.address ? 'border-red-500' : ''}
                            rows={3}
                          />
                          {errors.address && (
                            <p className="text-xs text-red-500">{errors.address}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="useSameAddress"
                              checked={formData.useSameAddress}
                              onCheckedChange={(checked) => {
                                setFormData(prev => ({
                                  ...prev,
                                  useSameAddress: checked as boolean
                                }));
                              }}
                            />
                            <Label htmlFor="useSameAddress" className="text-sm">
                              ใช้ที่อยู่เดียวกันสำหรับออกใบเสร็จ
                            </Label>
                          </div>
                        </div>

                        {!formData.useSameAddress && (
                          <div className="space-y-2">
                            <Label htmlFor="billingAddress">ที่อยู่สำหรับออกใบเสร็จ <span className="text-red-500">*</span></Label>
                            <Textarea
                              id="billingAddress"
                              value={formData.billingAddress}
                              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                              placeholder="ที่อยู่สำหรับออกใบเสร็จ"
                              className={errors.billingAddress ? 'border-red-500' : ''}
                              rows={3}
                            />
                            {errors.billingAddress && (
                              <p className="text-xs text-red-500">{errors.billingAddress}</p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Corporate Fields */}
                    {selectedAccountType === 'corporate' && (
                      <CorporateFields
                        formData={{
                          companyRegistration: formData.companyRegistration,
                          companyNameTh: formData.companyNameTh,
                          companyNameEn: formData.companyNameEn,
                          companyAddress: formData.companyAddress,
                          taxId: formData.taxId,
                          companyPhone: formData.companyPhone,
                          authorizedPerson: formData.authorizedPerson,
                          position: formData.position,
                          username: formData.username,
                          businessType: formData.businessType,
                          useSameAddressForBilling: formData.useSameAddressForBilling,
                          billingAddress: formData.billingAddress
                        }}
                        onChange={handleInputChange}
                        errors={errors}
                      />
                    )}

                    {/* Terms and Conditions */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground">
                          ฉันยอมรับ{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            ข้อกำหนดการใช้งาน
                          </a>{" "}
                          และ{" "}
                          <a href="/privacy" className="text-primary hover:underline">
                            นโยบายความเป็นส่วนตัว
                          </a>
                        </Label>
                      </div>
                      {errors.terms && (
                        <p className="text-xs text-red-500">{errors.terms}</p>
                      )}
                    </div>

                    {/* Submit Error Message */}
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{submitError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>กำลังสมัครสมาชิก...</span>
                        </div>
                      ) : (
                        selectedAccountType === 'corporate'
                          ? 'สมัครบัญชีนิติบุคคล (100 เครดิตฟรี)'
                          : 'สมัครบัญชีส่วนบุคคล (100 เครดิตฟรี)'
                      )}
                    </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                      มีบัญชีอยู่แล้ว?{" "}
                      <a href="#login" className="text-primary hover:underline font-medium">
                        เข้าสู่ระบบ
                      </a>
                    </p>
                    </div>
                  )}

                  {/* Step 2: OTP Verification */}
                  {currentStep === 'otp' && (
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">ยืนยันเบอร์โทรศัพท์</h3>
                        <p className="text-sm text-muted-foreground">
                          เราได้ส่งรหัส OTP ไปที่เบอร์ {formData.phone}
                        </p>
                      </div>
                      
                      <OTPVerification
                        initialPhoneNumber={formData.phone}
                        userId={registeredUserId}
                        onSuccess={handleOTPSuccess}
                        onError={handleOTPError}
                      />
                      
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={handleBackToForm}
                          className="flex items-center space-x-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>กลับไปแก้ไขข้อมูล</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Success */}
                  {currentStep === 'success' && (
                    <div className="space-y-6 text-center">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-green-600">สมัครสมาชิกเรียบร้อย!</h3>
                        <p className="text-muted-foreground">
                          ยินดีต้อนรับสู่ SMS-UP+ คุณได้รับเครดิตฟรี 100 เครดิต
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm">เบอร์โทรศัพท์ยืนยันแล้ว</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-orange-600">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-sm">กรุณายืนยันอีเมลในหน้าโปรไฟล์</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-sm">Auto-Bot ใช้ได้หลังยืนยันอีเมลแล้ว</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-800">
                          <p className="font-semibold">🎉 คุณได้รับ:</p>
                          <p>• เครดิตฟรี 100 เครดิต</p>
                          <p>• ทดลองใช้ฟรี 14 วัน</p>
                          <p>• เข้าถึงฟีเจอร์ครบครัน</p>
                        </div>
                      </div>
                      
                      <Button onClick={() => navigate('/profile')} className="w-full">
                        ไปที่หน้าโปรไฟล์เพื่อยืนยันอีเมล
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Register;