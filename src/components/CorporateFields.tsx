import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText } from 'lucide-react';

interface CorporateFieldsProps {
  formData: {
    companyRegistration: string;
    companyNameTh: string;
    companyNameEn: string;
    companyAddress: string;
    taxId: string;
    companyPhone: string;
    authorizedPerson: string;
    position: string;
    username: string;
    businessType: string;
    useSameAddressForBilling: boolean;
    billingAddress: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  errors: Record<string, string>;
}

const CorporateFields: React.FC<CorporateFieldsProps> = ({
  formData,
  onChange,
  errors
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log(`Uploading ${fieldName}:`, file.name);
    }
  };

  return (
    <Card className="mt-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>ข้อมูลบริษัท</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          กรุณากรอกข้อมูลบริษัทให้ครบถ้วน
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Registration */}
        <div className="space-y-2">
          <Label htmlFor="companyRegistration">
            เลขทะเบียนบริษัท <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyRegistration"
            value={formData.companyRegistration}
            onChange={(e) => onChange('companyRegistration', e.target.value)}
            placeholder="0123456789123"
            pattern="[0-9]{13}"
            maxLength={13}
            className={errors.companyRegistration ? 'border-red-500' : ''}
          />
          <p className="text-xs text-muted-foreground">
            เลขทะเบียนบริษัท 13 หลัก
          </p>
          {errors.companyRegistration && (
            <p className="text-xs text-red-500">{errors.companyRegistration}</p>
          )}
        </div>

        {/* Company Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyNameTh">
              ชื่อบริษัท (ภาษาไทย) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyNameTh"
              value={formData.companyNameTh}
              onChange={(e) => onChange('companyNameTh', e.target.value)}
              placeholder="บริษัท ตัวอย่าง จำกัด"
              className={errors.companyNameTh ? 'border-red-500' : ''}
            />
            {errors.companyNameTh && (
              <p className="text-xs text-red-500">{errors.companyNameTh}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyNameEn">
              ชื่อบริษัท (ภาษาอังกฤษ)
            </Label>
            <Input
              id="companyNameEn"
              value={formData.companyNameEn}
              onChange={(e) => onChange('companyNameEn', e.target.value)}
              placeholder="Example Company Limited"
            />
          </div>
        </div>

        {/* Company Address */}
        <div className="space-y-2">
          <Label htmlFor="companyAddress">
            ที่อยู่บริษัท <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="companyAddress"
            value={formData.companyAddress}
            onChange={(e) => onChange('companyAddress', e.target.value)}
            placeholder="123 ถนน... ตำบล/แขวง... อำเภอ/เขต... จังหวัด... รหัสไปรษณีย์..."
            rows={3}
            className={errors.companyAddress ? 'border-red-500' : ''}
          />
          {errors.companyAddress && (
            <p className="text-xs text-red-500">{errors.companyAddress}</p>
          )}
        </div>

        {/* Tax ID and Company Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxId">
              เลขประจำตัวผู้เสียภาษี
            </Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => onChange('taxId', e.target.value)}
              placeholder="1234567890123"
              pattern="[0-9]{13}"
              maxLength={13}
            />
            <p className="text-xs text-muted-foreground">
              สำหรับออกใบกำกับภาษี
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone">
              เบอร์โทรบริษัท <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyPhone"
              value={formData.companyPhone}
              onChange={(e) => onChange('companyPhone', e.target.value)}
              placeholder="02-xxx-xxxx"
              className={errors.companyPhone ? 'border-red-500' : ''}
            />
            {errors.companyPhone && (
              <p className="text-xs text-red-500">{errors.companyPhone}</p>
            )}
          </div>
        </div>

        {/* Authorized Person and Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="authorizedPerson">
              ชื่อผู้มีอำนาจลงนาม <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authorizedPerson"
              value={formData.authorizedPerson}
              onChange={(e) => onChange('authorizedPerson', e.target.value)}
              placeholder="นาย/นาง/นางสาว ชื่อ นามสกุล"
              className={errors.authorizedPerson ? 'border-red-500' : ''}
            />
            {errors.authorizedPerson && (
              <p className="text-xs text-red-500">{errors.authorizedPerson}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              ตำแหน่ง <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.position}
              onValueChange={(value) => onChange('position', value)}
            >
              <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือกตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceo">ประธานเจ้าหน้าที่บริหาร (CEO)</SelectItem>
                <SelectItem value="md">กรรมการผู้จัดการ (MD)</SelectItem>
                <SelectItem value="director">กรรมการ (Director)</SelectItem>
                <SelectItem value="manager">ผู้จัดการ (Manager)</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-xs text-red-500">{errors.position}</p>
            )}
          </div>
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType">
            ประเภทธุรกิจ <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => onChange('businessType', value)}
          >
            <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
              <SelectValue placeholder="เลือกประเภทธุรกิจ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finance">ธุรกิจการเงิน / ธนาคาร / สินเชื่อ / ประกันภัย</SelectItem>
              <SelectItem value="healthcare">การแพทย์ / โรงพยาบาล / คลินิก / ธุรกิจเภสัชกรรม</SelectItem>
              <SelectItem value="entertainment">ธุรกิจความบันเทิง / รายการโทรทัศน์ / ธุรกิจการแสดง</SelectItem>
              <SelectItem value="beauty-fashion">ธุรกิจเสริมความงาม / เครื่องสำอาง / แฟชั่น / เครื่องประดับ / เสื้อผ้า</SelectItem>
              <SelectItem value="software-tech">ธุรกิจ Software / เว็บไซต์ / แอปพลิเคชันบนมือถือ</SelectItem>
              <SelectItem value="retail-mall">ห้างสรรพสินค้า / ศูนย์แสดงสินค้า / ตลาด</SelectItem>
              <SelectItem value="real-estate">ธุรกิจอสังหาริมทรัพย์ / คอนโด / หมู่บ้าน / หอพัก</SelectItem>
              <SelectItem value="media-marketing">ธุรกิจสื่อและโฆษณา / ธุรกิจการตลาด / เอเจนซี่</SelectItem>
              <SelectItem value="food-beverage">ธุรกิจอาหาร และเครื่องดื่ม / ร้านอาหาร / คาเฟ่</SelectItem>
              <SelectItem value="telecommunication">การสื่อสาร / โทรคมนาคม</SelectItem>
              <SelectItem value="government">หน่วยงานราชการ / รัฐวิสาหกิจ / องค์กร</SelectItem>
              <SelectItem value="construction">ธุรกิจการก่อสร้าง / รับเหมา / ตกแต่งภายใน</SelectItem>
              <SelectItem value="petrochemical">ธุรกิจปิโตรเคมีและเคมีภัณฑ์</SelectItem>
              <SelectItem value="education">สถาบันการศึกษา / โรงเรียน / มหาวิทยาลัย / สถาบันกวดวิชา</SelectItem>
              <SelectItem value="sports-fitness">ธุรกิจกีฬา / ฟิตเนส / ธุรกิจด้านสุขภาพ</SelectItem>
              <SelectItem value="electronics">ธุรกิจอุปกรณ์คอมพิวเตอร์ / โทรศัพท์ / อิเล็กทรอนิกส์ และอุปกรณ์ไฟฟ้า</SelectItem>
              <SelectItem value="automotive">ธุรกิจขายยนต์ / คาร์แคร์ / ศูนย์ซ่อม</SelectItem>
              <SelectItem value="tourism-hotel">ธุรกิจการท่องเที่ยว / โรงแรม / ทัวร์</SelectItem>
              <SelectItem value="logistics">ธุรกิจการขนส่งและโลจิสติกส์ / เดลิเวอรี่</SelectItem>
              <SelectItem value="trading">ธุรกิจจัดจำหน่าย / ธุรกิจเทรดดิ้ง นำเข้า - ส่งออก</SelectItem>
              <SelectItem value="consulting">ธุรกิจที่ปรึกษาทางกฎหมาย / บัญชี</SelectItem>
              <SelectItem value="other">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessType && (
            <p className="text-xs text-red-500">{errors.businessType}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useSameAddressForBilling"
              checked={formData.useSameAddressForBilling}
              onCheckedChange={(checked) => {
                onChange('useSameAddressForBilling', checked);
              }}
            />
            <Label htmlFor="useSameAddressForBilling" className="text-sm">
              ใช้ที่อยู่บริษัทเดียวกันสำหรับออกใบเสร็จ
            </Label>
          </div>
        </div>

        {!formData.useSameAddressForBilling && (
          <div className="space-y-2">
            <Label htmlFor="billingAddress">
              ที่อยู่สำหรับออกใบเสร็จ <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => onChange('billingAddress', e.target.value)}
              placeholder="ที่อยู่สำหรับออกใบเสร็จ"
              className={errors.billingAddress ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.billingAddress && (
              <p className="text-xs text-red-500">{errors.billingAddress}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">
            ชื่อผู้ใช้ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => onChange('username', e.target.value)}
            placeholder="ชื่อผู้ใช้ของคุณ"
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username}</p>
          )}
        </div>

        {/* Document Upload Section */}
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold mb-2">เอกสารประกอบ (ไม่บังคับ)</h4>
          <p className="text-sm text-muted-foreground mb-4">
            อัปโหลดเอกสารเพื่อเร่งการอนุมัติบัญชี
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyCert" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    หนังสือรับรองบริษัท
                  </span>
                </div>
              </Label>
              <Input
                id="companyCert"
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleFileUpload(e, 'companyCert')}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCard" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    สำเนาบัตรประชาชน
                  </span>
                </div>
              </Label>
              <Input
                id="idCard"
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleFileUpload(e, 'idCard')}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorporateFields;
