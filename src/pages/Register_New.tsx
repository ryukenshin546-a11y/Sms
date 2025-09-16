import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AccountTypeSelection from '@/components/AccountTypeSelection';
import CorporateFields from '@/components/CorporateFields';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  // Simplified states - เหลือเฉพาะที่จำเป็น
  const [selectedAccountType, setSelectedAccountType] = useState<'personal' | 'corporate'>('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
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
    businessType: '',
    useSameAddressForBilling: false
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Simplified validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validations
    if (!formData.firstName.trim()) newErrors.firstName = 'กรุณาใส่ชื่อ';
    if (!formData.lastName.trim()) newErrors.lastName = 'กรุณาใส่นามสกุล';
    if (!formData.username.trim()) newErrors.username = 'กรุณาใส่ชื่อผู้ใช้';
    if (!formData.email.trim()) newErrors.email = 'กรุณาใส่อีเมล';
    if (!formData.phone.trim()) newErrors.phone = 'กรุณาใส่เบอร์โทรศัพท์';
    if (!formData.password) newErrors.password = 'กรุณาใส่รหัสผ่าน';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }

    // Confirm password validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // Corporate account validation
    if (selectedAccountType === 'corporate') {
      if (!formData.companyNameTh.trim()) newErrors.companyNameTh = 'กรุณาใส่ชื่อบริษัท (ภาษาไทย)';
      if (!formData.taxId.trim()) newErrors.taxId = 'กรุณาใส่เลขประจำตัวผู้เสียภาษี';
    }

    // Terms acceptance
    if (!acceptTerms) newErrors.terms = 'กรุณายอมรับข้อตกลงการใช้งาน';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'useSameAddress' || field === 'useSameAddressForBilling' 
        ? value === 'true' 
        : value
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAccountTypeSelect = (type: 'personal' | 'corporate') => {
    setSelectedAccountType(type);
    setErrors({}); // Clear all errors when switching account type
  };

  // Simplified form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Starting registration...');
      
      // Create user account with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            phone: formData.phone,
            account_type: selectedAccountType,
            
            // Personal account data
            ...(selectedAccountType === 'personal' && {
              id_card: formData.idCard,
              address: formData.address,
              billing_address: formData.useSameAddress ? formData.address : formData.billingAddress
            }),
            
            // Corporate account data
            ...(selectedAccountType === 'corporate' && {
              company_name_th: formData.companyNameTh,
              company_name_en: formData.companyNameEn,
              tax_id: formData.taxId,
              company_address: formData.companyAddress,
              company_phone: formData.companyPhone,
              authorized_person: formData.authorizedPerson,
              position: formData.position,
              business_type: formData.businessType,
              billing_address: formData.useSameAddressForBilling ? formData.companyAddress : formData.billingAddress
            })
          }
        }
      });

      if (authError) {
        console.error('❌ Registration failed:', authError);
        throw new Error(authError.message);
      }

      console.log('✅ Registration successful! Please check email for verification.');
      
      // Show success message
      setRegistrationSuccess(true);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
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
              <Card className="shadow-professional max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">สร้างบัญชีใหม่</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลเพื่อเริ่มทดลองใช้ฟรี 14 วัน
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {registrationSuccess ? (
                    // Success Message
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-600 mb-2">สมัครสมาชิกสำเร็จ!</h3>
                      <p className="text-muted-foreground mb-6">
                        เราได้ส่งอีเมลยืนยันไปที่ <strong>{formData.email}</strong><br/>
                        กรุณาเช็คอีเมลและคลิกลิงค์เพื่อยืนยันบัญชีของคุณ
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => navigate('/login')}
                          className="w-full max-w-sm"
                        >
                          ไปหน้าเข้าสู่ระบบ
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          ไม่ได้รับอีเมล? ตรวจสอบในโฟลเดอร์ Spam หรือ Junk
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Registration Form
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

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="0912345678"
                            className={errors.phone ? 'border-red-500' : ''}
                            autoComplete="tel"
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-500">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">รหัสผ่าน <span className="text-red-500">*</span></Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="อย่างน้อย 8 ตัวอักษร"
                            className={errors.password ? 'border-red-500' : ''}
                            autoComplete="new-password"
                          />
                          {errors.password && (
                            <p className="text-xs text-red-500">{errors.password}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="ยืนยันรหัสผ่าน"
                            className={errors.confirmPassword ? 'border-red-500' : ''}
                            autoComplete="new-password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      {/* Corporate Fields (conditional) */}
                      {selectedAccountType === 'corporate' && (
                        <CorporateFields 
                          formData={formData}
                          errors={errors}
                          onChange={handleInputChange}
                        />
                      )}

                      {/* Terms and Conditions */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="acceptTerms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                            className="mt-1"
                          />
                          <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                            ฉันยอมรับ{' '}
                            <a href="/terms" className="text-primary hover:underline">
                              ข้อตกลงการใช้งาน
                            </a>
                            {' '}และ{' '}
                            <a href="/privacy" className="text-primary hover:underline">
                              นโยบายความเป็นส่วนตัว
                            </a>
                          </Label>
                        </div>
                        {errors.terms && (
                          <p className="text-xs text-red-500">{errors.terms}</p>
                        )}
                      </div>

                      {/* Error Display */}
                      {submitError && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700">
                            {submitError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full text-lg py-6"
                        disabled={isLoading}
                      >
                        {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          มีบัญชีอยู่แล้ว?{' '}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-semibold"
                            onClick={() => navigate('/login')}
                          >
                            เข้าสู่ระบบ
                          </Button>
                        </p>
                      </div>
                    </form>
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