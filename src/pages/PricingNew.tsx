import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Shield, Clock, Send, DollarSign, Lock, Users, MessageSquare } from 'lucide-react';

const PricingNew = () => {
  const [selectedPlan, setSelectedPlan] = useState('standard');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto">
            <div className="text-center lg:text-left lg:flex-1">
              <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
                SMS ราคาใหม่ 2025
              </h1>
              <p className="text-2xl md:text-3xl text-primary-foreground/90 mb-4">
                เริ่มต้นที่ 0.24 บาท/เครดิต
              </p>
              <p className="text-lg text-primary-foreground/80 mb-8">
                ส่ง SMS ราคาดีที่สุดในประเทศไทย พร้อมคุณภาพและความน่าเชื่อถือระดับมืออาชีพ
              </p>
            </div>
            <div className="lg:flex-1 flex justify-center lg:justify-end">
              <div className="text-8xl">💬</div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Type Toggle */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center bg-card border border-border rounded-lg p-1 shadow-md">
              <ToggleGroup 
                type="single" 
                value={selectedPlan} 
                onValueChange={setSelectedPlan}
                className="flex"
              >
                <ToggleGroupItem 
                  value="standard" 
                  className="px-10 py-6 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md transition-colors min-h-[80px] flex items-center"
                >
                  <div className="text-center leading-tight">
                    <div className="font-semibold text-base">Standard SMS</div>
                    <div className="text-sm opacity-90 mt-1">ราคาดีที่สุด</div>
                    <div className="text-sm opacity-90">เหมาะกับ SME</div>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="corporate" 
                  className="px-10 py-6 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md transition-colors min-h-[80px] flex items-center"
                >
                  <div className="text-center leading-tight">
                    <div className="font-semibold text-base">Corporate SMS</div>
                    <div className="text-sm opacity-90 mt-1">ฟีเจอร์ครบครัน</div>
                    <div className="text-sm opacity-90">เหมาะกับองค์กรใหญ่</div>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {selectedPlan === 'standard' ? (
              <>
                {/* Package 1 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿1,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.45 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">2,222</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">12 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">3</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Package 2 - Most Popular */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-lg relative hover:shadow-xl transition-shadow">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿10,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.35 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">28,571</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">24 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">10</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Package 3 - Premium */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿100,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.29 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">344,828</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">36 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">ไม่จำกัด</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Corporate SMS packages */
              <>
                {/* Corporate Package 1 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿3,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.40 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">7,500</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">12 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">3</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">API Access</span>
                        <span className="font-medium text-accent">✓</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Corporate Package 2 - Most Popular */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-lg relative hover:shadow-xl transition-shadow">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Enterprise
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿30,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.32 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">93,750</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">24 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">10</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">API Access</span>
                        <span className="font-medium text-accent">✓</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Corporate Package 3 - Premium */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Ultimate
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿300,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.27 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">1,111,111</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">อายุการใช้งาน</span>
                        <span className="font-medium text-card-foreground">36 เดือน</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">ไม่จำกัด</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">API Access</span>
                        <span className="font-medium text-accent">✓</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="py-12 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <div className="text-primary-foreground text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                ส่วนลดพิเศษ 20%
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                ส่วนลดพิเศษ 20% สำหรับการซื้อแพ็กเกจครั้งแรก
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-6xl">👩‍💼</div>
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 text-lg font-semibold">
                สมัครเลย
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table - ตามตารางใหม่ */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              ราคาแพ็กเกจ SMSUP+ (อัปเดตล่าสุด)
            </h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left px-4 py-4 font-semibold text-primary-foreground">Package</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 1,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 3,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 8,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 10,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 30,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 80,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 100,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 300,000</th>
                      <th className="text-center px-3 py-4 font-semibold text-primary-foreground">฿ 800,000</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-muted/50">
                      <td className="px-4 py-4 text-foreground font-medium">ราคาต่อเครดิต</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.45</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.40</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.38</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.35</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.32</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.30</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.29</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.27</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">0.24</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-foreground font-medium">ปริมาณเครดิต</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">2,222</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">7,500</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">21,052</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">28,571</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">93,750</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">266,667</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">344,828</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">1,111,111</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">3,333,333</td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="px-4 py-4 text-foreground font-medium">รองรับ OTP</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                      <td className="px-3 py-4 text-center text-primary">☑️</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-foreground font-medium">อายุการใช้งานเครดิต</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">12 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">12 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">12 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">24 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">24 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">24 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">36 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">36 เดือน</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">36 เดือน</td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="px-4 py-4 text-foreground font-medium">Sender Name</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">3</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">3</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">3</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">10</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">10</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">10</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">ไม่จำกัด</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">ไม่จำกัด</td>
                      <td className="px-3 py-4 text-center text-muted-foreground">ไม่จำกัด</td>
                    </tr>
                    <tr className="bg-muted">
                      <td className="px-4 py-4"></td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <Button className="w-full" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingNew;