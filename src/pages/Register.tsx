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
import { useState } from 'react';

const Register = () => {
  const [selectedAccountType, setSelectedAccountType] = useState<'individual' | 'corporate'>('individual');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    company: '',
    businessType: '',
    password: '',
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

  const handleAccountTypeSelect = (type: 'individual' | 'corporate') => {
    setSelectedAccountType(type);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'useSameAddress' || field === 'useSameAddressForBilling' 
        ? value === 'true' 
        : value
    }));
    // Clear error for this field
    if (errors[field]) {
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
    const newErrors: Record<string, string> = {};

    // Basic validation (removed accountType validation since it's now always set)
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และขีดล่างเท่านั้น';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 12) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์พิเศษ';
    } else if (/\s/.test(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องไม่มีช่องว่าง';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'รหัสผ่านไม่แข็งแรงเพียงพอ กรุณาปรับปรุง';
    }

    // Corporate-specific validation
    if (selectedAccountType === 'corporate') {
      if (!formData.companyRegistration.trim()) {
        newErrors.companyRegistration = 'กรุณากรอกเลขทะเบียนบริษัท';
      } else if (!/^[0-9]{13}$/.test(formData.companyRegistration)) {
        newErrors.companyRegistration = 'เลขทะเบียนบริษัทต้องเป็นตัวเลข 13 หลัก';
      }

      if (!formData.companyNameTh.trim()) {
        newErrors.companyNameTh = 'กรุณากรอกชื่อบริษัท (ภาษาไทย)';
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
    if (selectedAccountType === 'individual') {
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
      newErrors.terms = 'กรุณายอมรับข้อกำหนดการใช้งาน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Handle form submission
      console.log('Form submitted:', {
        accountType: selectedAccountType,
        ...formData
      });

      // Here you would typically send the data to your backend
      alert(`สมัครสมาชิกสำเร็จ! คุณได้รับเครดิตฟรี 100 เครดิต`);
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
                เริ่มต้นใช้งาน MarketPro
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

                    {/* Individual-specific fields */}
                    {selectedAccountType === 'individual' && (
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

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                    >
                      {selectedAccountType === 'corporate'
                        ? 'สมัครบัญชีนิติบุคคล (100 เครดิตฟรี)'
                        : 'สมัครบัญชีส่วนบุคคล (100 เครดิตฟรี)'
                      }
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