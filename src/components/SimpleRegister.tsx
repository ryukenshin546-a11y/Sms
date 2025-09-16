// ระบบสมาชิกใหม่ - Frontend Component ที่เรียบง่าย
// แทนที่ Register.tsx ที่มี 900+ บรรทัด

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RegistrationForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: 'personal' | 'business';
  
  // Business fields
  companyName?: string;
  taxId?: string;
  businessAddress?: string;
}

export const SimpleRegister = () => {
  const [formData, setFormData] = useState<RegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    accountType: 'personal'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('รหัสผ่านไม่ตรงกัน');
      }

      // Step 1: Create auth user with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            account_type: formData.accountType,
            ...(formData.accountType === 'business' && {
              company_name: formData.companyName,
              tax_id: formData.taxId,
              business_address: formData.businessAddress
            })
          }
        }
      });

      if (error) throw error;

      setMessage('กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ');
      
    } catch (error: any) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">สมัครสมาชิก</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic fields */}
        <input
          type="email"
          placeholder="อีเมล"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="w-full p-3 border rounded-md"
        />
        
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          className="w-full p-3 border rounded-md"
        />
        
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
          className="w-full p-3 border rounded-md"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="ชื่อ"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            className="p-3 border rounded-md"
          />
          
          <input
            type="text"
            placeholder="นามสกุล"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            className="p-3 border rounded-md"
          />
        </div>
        
        <input
          type="tel"
          placeholder="เบอร์โทรศัพท์"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full p-3 border rounded-md"
        />

        {/* Account type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">ประเภทบัญชี</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="personal"
                checked={formData.accountType === 'personal'}
                onChange={(e) => setFormData({...formData, accountType: e.target.value as 'personal'})}
                className="mr-2"
              />
              บุคคลธรรมดา
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="business"
                checked={formData.accountType === 'business'}
                onChange={(e) => setFormData({...formData, accountType: e.target.value as 'business'})}
                className="mr-2"
              />
              นิติบุคคล
            </label>
          </div>
        </div>

        {/* Business fields (conditional) */}
        {formData.accountType === 'business' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md">
            <input
              type="text"
              placeholder="ชื่อบริษัท"
              value={formData.companyName || ''}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              className="w-full p-3 border rounded-md"
            />
            
            <input
              type="text"
              placeholder="เลขประจำตัวผู้เสียภาษี"
              value={formData.taxId || ''}
              onChange={(e) => setFormData({...formData, taxId: e.target.value})}
              className="w-full p-3 border rounded-md"
            />
            
            <textarea
              placeholder="ที่อยู่บริษัท"
              value={formData.businessAddress || ''}
              onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
              rows={3}
              className="w-full p-3 border rounded-md"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-center ${
          message.includes('เกิดข้อผิดพลาด') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SimpleRegister;