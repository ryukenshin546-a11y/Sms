import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AccountTypeSelection from '@/components/AccountTypeSelection';
import CorporateFields from '@/components/CorporateFields';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const Register = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    setSubmitError('');

    if (validateForm()) {
      console.log('Form validation passed');
      setIsLoading(true);

      try {
        // Prepare profile data for database
        const profileData = {
          account_type: selectedAccountType,
          // Use correct field names matching TypeScript types
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password, // Note: In production, this should be hashed on the backend
          // Default values
          credit_balance: 100, // Free credits
          email_verified: false,
          phone_verified: false,
          status: 'active' as const,
          role: 'user' as const,
          // Individual fields (only for personal accounts)
          ...(selectedAccountType === 'personal' && {
            id_card: formData.idCard,
            address: formData.address,
            use_same_address: formData.useSameAddress,
            billing_address: formData.useSameAddress ? formData.address : formData.billingAddress
          }),
          // Corporate fields (only for corporate accounts)
          ...(selectedAccountType === 'corporate' && {
            company: formData.company,
            business_type: formData.businessType || null,
            company_registration: formData.companyRegistration,
            company_name_th: formData.companyNameTh,
            company_name_en: formData.companyNameEn || null,
            company_address: formData.companyAddress,
            tax_id: formData.taxId || null,
            company_phone: formData.companyPhone || null,
            authorized_person: formData.authorizedPerson,
            position: formData.position,
            use_same_address_for_billing: formData.useSameAddressForBilling,
            billing_address: formData.useSameAddressForBilling ? formData.companyAddress : formData.billingAddress
          })
        };

        console.log('Profile data to be sent:', profileData);

        // Step 1: Create user account with Supabase Auth
        console.log('🚀 Creating user account with Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              account_type: selectedAccountType,
              ...profileData // Include all profile data
            }
          }
        });

        if (authError) {
          console.error('❌ Auth signup failed:', authError);
          throw new Error(authError.message);
        }

        console.log('✅ User account created:', authData.user?.id);

        // Success message
        alert(`สมัครสมาชิกสำเร็จ! คุณได้รับเครดิตฟรี 100 เครดิต\n\nกรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี`);

        // Reset form
        setFormData({
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
        setAcceptTerms(false);
        setSelectedAccountType('personal');
        setErrors({});

      } catch (error: any) {
        console.error('Registration failed:', error);
        setSubmitError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
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