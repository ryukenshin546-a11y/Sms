import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Pricing = () => {
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
                SMS ราคาถูก
              </h1>
              <p className="text-2xl md:text-3xl text-primary-foreground/90 mb-4">
                ต่ำกว่า 0.15 บาท/เครดิต
              </p>
              <p className="text-lg text-primary-foreground/80 mb-8">
                ส่ง SMS ราคาถูกที่สุดในประเทศไทย พร้อมคุณภาพและความน่าเชื่อถือระดับมืออาชีพ
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
                    <div className="text-sm opacity-90 mt-1">ราคาถูกที่สุด</div>
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
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿3,500</div>
                    <div className="text-sm text-muted-foreground mb-4">0.41 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">8,537</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">5</span>
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
                    <div className="text-sm text-muted-foreground mb-4">0.32 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">31,250</span>
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
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿1,000,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.17 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">5,882,353</span>
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
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿5,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.38 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">13,158</span>
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

                {/* Corporate Package 2 - Most Popular */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-lg relative hover:shadow-xl transition-shadow">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿25,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.30 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">83,333</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-card-foreground">25</span>
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
                <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Premium
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">฿100,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.25 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-card-foreground">400,000</span>
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
                สิ้นปีนี้ ฉลองด้วยส่วนลดพิเศษ 20%
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

      {/* Detailed Comparison Table - ตามภาพที่ให้มา */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              ราคาแพ็กเกจ
            </h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-primary-foreground">Package</th>
                      <th className="text-center px-6 py-4 font-semibold text-primary-foreground">฿ 1,500</th>
                      <th className="text-center px-6 py-4 font-semibold text-primary-foreground">฿ 3,500</th>
                      <th className="text-center px-6 py-4 font-semibold text-primary-foreground">฿ 10,000</th>
                      <th className="text-center px-6 py-4 font-semibold text-primary-foreground">฿ 30,000</th>
                      <th className="text-center px-6 py-4 font-semibold text-primary-foreground">฿ 150,000</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-muted/50">
                      <td className="px-6 py-4 text-foreground font-medium">ราคาต่อเครดิต</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">0.49</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">0.41</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">0.37</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">0.33</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">0.30</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-foreground font-medium">ปริมาณเครดิต</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">3,061</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">8,537</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">27,027</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">90,910</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">500,000</td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="px-6 py-4 text-foreground font-medium">OTP Ready to use</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-foreground font-medium">อายุการใช้งาน (เดือน)</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">12</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">12</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">24</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">24</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">24</td>
                    </tr>
                    <tr className="bg-muted/50">
                      <td className="px-6 py-4 text-foreground font-medium">จำนวนชื่อผู้ส่ง</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">1</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">1</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">2</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">2</td>
                      <td className="px-6 py-4 text-center text-muted-foreground">5</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-foreground font-medium">Sms Tracking</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-primary">✓</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">รายงานการใช้งานรายเดือน</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                      <td className="px-6 py-4 text-center text-blue-600">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900 font-medium">ราคาการขอชื่อผู้ส่งใหม่</td>
                      <td className="px-6 py-4 text-center text-gray-700">3,000</td>
                      <td className="px-6 py-4 text-center text-gray-700">3,000</td>
                      <td className="px-6 py-4 text-center text-gray-700">2,500</td>
                      <td className="px-6 py-4 text-center text-gray-700">2,000</td>
                      <td className="px-6 py-4 text-center text-gray-700">1,500</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
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

      {/* Growth Packages Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              แพ็กเกจสำหรับธุรกิจขนาดใหญ่และผู้ใช้จำนวนมาก
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900 border-b">Growth Package</th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-900 border-b">฿120,000</th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-900 border-b">฿250,000</th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-900 border-b">฿500,000</th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-900 border-b">฿1,000,000</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">เครดิตที่ได้รับ</td>
                      <td className="px-6 py-4 text-center text-gray-700">500,000</td>
                      <td className="px-6 py-4 text-center text-gray-700">1,086,957</td>
                      <td className="px-6 py-4 text-center text-gray-700">2,380,952</td>
                      <td className="px-6 py-4 text-center text-gray-700">5,000,000</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">ราคาต่อเครดิต</td>
                      <td className="px-6 py-4 text-center text-gray-700">0.24</td>
                      <td className="px-6 py-4 text-center text-gray-700">0.23</td>
                      <td className="px-6 py-4 text-center text-gray-700">0.21</td>
                      <td className="px-6 py-4 text-center text-gray-700">0.20</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">Sender Name</td>
                      <td className="px-6 py-4 text-center text-gray-700">ไม่จำกัด</td>
                      <td className="px-6 py-4 text-center text-gray-700">ไม่จำกัด</td>
                      <td className="px-6 py-4 text-center text-gray-700">ไม่จำกัด</td>
                      <td className="px-6 py-4 text-center text-gray-700">ไม่จำกัด</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
                          <a href="/register">ซื้อแพ็กเกจ</a>
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" asChild>
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

      {/* Contact & Support CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  SMS ราคาถูก
                </h2>
                <p className="text-2xl text-blue-300 mb-4">
                  0.15 บาท/เครดิต
                </p>
                <p className="text-gray-300 text-lg">
                  พร้อมคำปรึกษาฟรีและการสนับสนุนตลอด 24 ชั่วโมง 
                  ให้คำแนะนำที่เหมาะสมกับความต้องการของธุรกิจคุณ
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold mb-2">ติดต่อเรา</p>
                    <p className="text-blue-300">contact@thaibulksms.com</p>
                    <p className="text-blue-300">02-798-6055</p>
                  </div>
                  <div className="flex justify-center md:justify-end">
                    <div className="text-6xl">📱</div>
                  </div>
                  <p className="text-sm text-gray-400">สแกน QR Code เพื่อเข้าสู่ระบบ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMS Solutions Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              บริการ SMS ครบครัน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">SMS Tracking</h3>
                <p className="text-gray-600 mb-4">
                  ติดตามและวิเคราะห์ผลการส่ง SMS แบบละเอียด
                </p>
                <Button variant="outline" className="w-full">
                  เรียนรู้เพิ่มเติม
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">SMS API</h3>
                <p className="text-gray-600 mb-4">
                  เชื่อมต่อกับระบบของคุณได้ง่ายและรวดเร็ว
                </p>
                <Button variant="outline" className="w-full">
                  เรียนรู้เพิ่มเติม
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">SMS Automation</h3>
                <p className="text-gray-600 mb-4">
                  ส่ง SMS อัตโนมัติตามเงื่อนไขที่กำหนด
                </p>
                <Button variant="outline" className="w-full">
                  เรียนรู้เพิ่มเติม
                </Button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">OTP Ready</h3>
                <p className="text-gray-600 mb-4">
                  ระบบ OTP พร้อมใช้งานทันทีและปลอดภัย
                </p>
                <Button variant="outline" className="w-full">
                  เรียนรู้เพิ่มเติม
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;