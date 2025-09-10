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
      
      {/* Header Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              ราคาแพ็กเกจ SMS
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ ยิ่งซื้อเยอะ ยิ่งถูกลง
            </p>

            {/* Plan Toggle */}
            <div className="inline-flex items-center justify-center mb-16">
              <ToggleGroup 
                type="single" 
                value={selectedPlan} 
                onValueChange={setSelectedPlan}
                className="bg-card border border-border rounded-lg p-1 shadow-soft"
              >
                <ToggleGroupItem 
                  value="standard" 
                  className="px-6 py-3 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Standard SMS
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="corporate" 
                  className="px-6 py-3 text-sm font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Corporate SMS
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {selectedPlan === 'standard' ? (
              <>
                {/* Card 1 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿1,500</div>
                    <div className="text-sm text-muted-foreground mb-4">0.41 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">3,659</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">5</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿3,500</div>
                    <div className="text-sm text-muted-foreground mb-4">0.35 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">10,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">10</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Card 3 - Most Popular */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-large relative hover:shadow-xl transition-professional">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      ยอดนิยม
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿10,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.31 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">32,258</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">15</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿30,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.28 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">107,143</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">20</span>
                      </div>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <a href="/register">ซื้อแพ็กเกจ</a>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Corporate SMS cards */
              <>
                {/* Corporate Card 1 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿5,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.38 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">13,158</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">10</span>
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

                {/* Corporate Card 2 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿15,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.32 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">46,875</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">25</span>
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

                {/* Corporate Card 3 - Most Popular */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-large relative hover:shadow-xl transition-professional">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      ยอดนิยม
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿50,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.29 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">172,414</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">50</span>
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

                {/* Corporate Card 4 */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-professional">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">฿100,000</div>
                    <div className="text-sm text-muted-foreground mb-4">0.26 บาท/เครดิต</div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">เครดิต</span>
                        <span className="font-medium text-foreground">384,615</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Sender Names</span>
                        <span className="font-medium text-foreground">100</span>
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

      {/* Feature Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              เปรียบเทียบความสามารถ
            </h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center px-6 py-4 font-semibold text-foreground">Standard SMS</th>
                      <th className="text-center px-6 py-4 font-semibold text-foreground">Corporate SMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">ส่งข้อความราคาถูก</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">ดูรายงานการส่งข้อความ</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">เครื่องมือวัดผลแคมเปญ</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">คืนเครดิตเมื่อส่งไม่ถึง</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-500 text-lg">❌</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">ส่ง OTP ด้วยระบบพร้อมใช้</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-500 text-lg">❌</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-foreground">เช็กสถานะการส่งละเอียดกว่า</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-500 text-lg">❌</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-500 text-lg">✅</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              คำถามที่พบบ่อย
            </h2>
            <div className="bg-card border border-border rounded-lg shadow-soft">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-border px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-foreground">Standard SMS กับ Corporate SMS ต่างกันอย่างไร?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    Standard SMS เน้นการส่งข้อความในราคาที่ถูกกว่าและมีฟีเจอร์พื้นฐานครบถ้วน ส่วน Corporate SMS จะมีฟีเจอร์ขั้นสูงสำหรับธุรกิจ เช่น การคืนเครดิตเมื่อส่งไม่สำเร็จ และระบบ OTP พร้อมใช้งาน
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-b border-border px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-foreground">สามารถออกใบกำกับภาษีได้หรือไม่?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    สามารถทำได้ โดยแจ้งรายละเอียดบริษัทและเลขประจำตัวผู้เสียภาษีมาทางอีเมล [email protected] และต้องเป็นการซื้อในนามนิติบุคคลเท่านั้น
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-foreground">ชำระเงินด้วยวิธีใดได้บ้าง?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    สามารถชำระเงินผ่านการโอนเงินผ่านธนาคาร, ตัดบัตรเครดิตออนไลน์ หรือสแกน QR Code ผ่านหน้าเว็บไซต์ได้โดยตรง
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;