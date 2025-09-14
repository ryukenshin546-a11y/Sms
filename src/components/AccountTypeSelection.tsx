import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building, Check } from 'lucide-react';

interface AccountTypeSelectionProps {
  selectedType: 'personal' | 'corporate' | null;
  onTypeSelect: (type: 'personal' | 'corporate') => void;
}

const AccountTypeSelection: React.FC<AccountTypeSelectionProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const accountTypes = [
    {
      id: 'personal' as const,
      title: 'บุคคลธรรมดา',
      icon: <User className="h-5 w-5" />,
      benefits: [
        '✓ สมัครง่าย ใช้งานได้ทันที',
        '✓ เครดิตฟรี 100 เครดิต',
        '✓ เหมาะสำหรับธุรกิจเล็ก',
        '✓ ไม่ต้องเอกสารเพิ่มเติม'
      ],
      price: '',
      credits: 100
    },
    {
      id: 'corporate' as const,
      title: 'นิติบุคคล',
      icon: <Building className="h-5 w-5" />,
      benefits: [
        '✓ เครดิตฟรี 100 เครดิต',
        '✓ ออกใบกำกับภาษีได้',
        '✓ Account Manager เฉพาะ',
        '✓ ราคาพิเศษสำหรับ Volume',
        '✓ API Priority Support'
      ],
      price: '',
      credits: 100,
      recommended: true
    }
  ];

  return (
    <div className="account-type-selection mb-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          ประเภทบัญชี
        </h3>
        <p className="text-sm text-muted-foreground">
          เลือกประเภทบัญชีที่ต้องการสมัคร
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountTypes.map((type) => (
          <Card
            key={type.id}
            className={`account-type-card cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedType === type.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    {type.icon}
                  </div>
                  <h4 className="font-semibold text-base">{type.title}</h4>
                </div>
                {type.recommended && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    แนะนำ
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[0.7rem] mb-3">
                {type.benefits.map((benefit, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {type.price}
                </span>
                {selectedType === type.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountTypeSelection;
