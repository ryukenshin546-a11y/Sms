import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // FAQ data organized by categories
  const faqData = {
    'การใช้งานทั่วไป': [
      {
        question: 'Standard SMS กับ Corporate SMS ต่างกันอย่างไร?',
        answer: 'Standard SMS เน้นการส่งข้อความในราคาที่ถูกกว่าและมีฟีเจอร์พื้นฐานครบถ้วน ส่วน Corporate SMS จะมีฟีเจอร์ขั้นสูงสำหรับธุรกิจ เช่น การคืนเครดิตเมื่อส่งไม่สำเร็จ และระบบ OTP พร้อมใช้งาน'
      },
      {
        question: 'สามารถออกใบกำกับภาษีได้หรือไม่?',
        answer: 'สามารถทำได้ โดยแจ้งรายละเอียดบริษัทและเลขประจำตัวผู้เสียภาษีมาทางอีเมล [email protected] และต้องเป็นการซื้อในนามนิติบุคคลเท่านั้น'
      },
      {
        question: 'ชำระเงินด้วยวิธีใดได้บ้าง?',
        answer: 'สามารถชำระเงินผ่านการโอนเงินผ่านธนาคาร, ตัดบัตรเครดิตออนไลน์ หรือสแกน QR Code ผ่านหน้าเว็บไซต์ได้โดยตรง'
      }
    ],
    'ปัญหาทางเทคนิค': [
      {
        question: 'ทำไมข้อความส่งไม่ถึง?',
        answer: 'ปัญหาการส่งข้อความไม่ถึงอาจเกิดจากหลายสาเหตุ เช่น หมายเลขโทรศัพท์ไม่ถูกต้อง, เครดิตไม่เพียงพอ, หรือเครือข่ายมีปัญหา กรุณาตรวจสอบและติดต่อทีมงานหากปัญหายังคงอยู่'
      }
    ],
    'การชำระเงิน': [
      {
        question: 'เมื่อไหร่จะได้รับเครดิตหลังชำระเงิน?',
        answer: 'หากชำระเงินผ่านบัตรเครดิตหรือ QR Code จะได้รับเครดิตทันที หากโอนเงินผ่านธนาคาร จะได้รับเครดิตภายใน 1-2 ชั่วโมงในเวลาทำการ'
      }
    ],
    'การขอ Whitelist': [
      {
        question: 'การขอ Whitelist คืออะไร?',
        answer: 'การขอ Whitelist เป็นขั้นตอนการลงทะเบียนเพื่อให้สามารถส่งข้อความใน Corporate SMS ได้ โดยต้องส่งเอกสารประกอบการขอมาให้ทีมงานตรวจสอบก่อน'
      }
    ]
  };

  // Filter FAQ items based on search query
  const filterFAQs = (faqs: typeof faqData[keyof typeof faqData]) => {
    if (!searchQuery) return faqs;
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              ศูนย์ความช่วยเหลือ
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              ค้นหาคำตอบสำหรับคำถามที่พบบ่อย หรือติดต่อทีมงานเพื่อขอความช่วยเหลือ
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="ค้นหาคำถาม..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-card border-border focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {Object.entries(faqData).map(([category, faqs]) => {
              const filteredFAQs = filterFAQs(faqs);
              
              // Don't show category if no FAQs match search
              if (filteredFAQs.length === 0 && searchQuery) return null;
              
              return (
                <div key={category} className="bg-card border border-border rounded-lg shadow-soft overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4">
                    <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                  </div>
                  
                  <div className="p-6">
                    {filteredFAQs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFAQs.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`${category}-${index}`}
                            className="border-b border-border last:border-b-0"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <span className="font-semibold text-foreground pr-4">
                                {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        ไม่พบคำถามในหมวดหมู่นี้
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* No results message */}
            {searchQuery && Object.values(faqData).every(faqs => filterFAQs(faqs).length === 0) && (
              <div className="text-center py-16">
                <div className="text-muted-foreground text-lg mb-4">
                  ไม่พบผลลัพธ์สำหรับ "{searchQuery}"
                </div>
                <p className="text-muted-foreground">
                  ลองใช้คำค้นหาอื่น หรือติดต่อทีมงานเพื่อขอความช่วยเหลือ
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ยังไม่พบคำตอบที่ต้องการ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              ทีมงานของเราพร้อมให้ความช่วยเหลือคุณ
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-foreground mb-2">ติดต่อทีมงาน</h3>
                <p className="text-muted-foreground mb-4">
                  ส่งคำถามมาที่อีเมลแล้วเราจะตอบกลับภายใน 24 ชั่วโมง
                </p>
                <a 
                  href="mailto:support@marketpro.com" 
                  className="text-primary font-medium hover:text-primary-hover transition-professional"
                >
                  support@marketpro.com
                </a>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-foreground mb-2">โทรหาเรา</h3>
                <p className="text-muted-foreground mb-4">
                  โทรติดต่อทีมงานในเวลาทำการ จันทร์-ศุกร์ 9:00-18:00
                </p>
                <a 
                  href="tel:021234567" 
                  className="text-primary font-medium hover:text-primary-hover transition-professional"
                >
                  02-123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;