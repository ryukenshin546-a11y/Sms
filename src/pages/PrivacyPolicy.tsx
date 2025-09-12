import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Database,
  Cookie,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Lock,
  Trash2,
  Download,
  Loader2
} from 'lucide-react';
import { generateLegalDocumentPDF } from '@/lib/pdfGenerator';

const PrivacyPolicy = () => {
  const [currentSection, setCurrentSection] = useState('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const lastUpdated = '12 กันยายน 2025';

  const sections = [
    { id: 'overview', title: 'ภาพรวม', icon: <Shield className="h-4 w-4" /> },
    { id: 'data-collected', title: 'ข้อมูลที่เราเก็บ', icon: <Database className="h-4 w-4" /> },
    { id: 'data-usage', title: 'วิธีการใช้ข้อมูล', icon: <Eye className="h-4 w-4" /> },
    { id: 'data-sharing', title: 'การแบ่งปันข้อมูล', icon: <UserCheck className="h-4 w-4" /> },
    { id: 'cookies', title: 'การใช้ Cookies', icon: <Cookie className="h-4 w-4" /> },
    { id: 'user-rights', title: 'สิทธิ์ของผู้ใช้', icon: <Lock className="h-4 w-4" /> },
    { id: 'contact', title: 'ช่องทางติดต่อ', icon: <Phone className="h-4 w-4" /> },
    { id: 'changes', title: 'การเปลี่ยนแปลงนโยบาย', icon: <Calendar className="h-4 w-4" /> }
  ];

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError(null);

    try {
      // รอให้ DOM render เสร็จ
      await new Promise(resolve => setTimeout(resolve, 100));

      // สร้าง content เฉพาะสำหรับ PDF
      const pdfContent = createPDFContentForPrivacy(lastUpdated);

      await generateLegalDocumentPDF(pdfContent, 'privacy', lastUpdated);
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ฟังก์ชันสำหรับสร้างเนื้อหา PDF ที่เฉพาะเจาะจง
  const createPDFContentForPrivacy = (lastUpdated: string): HTMLElement => {
    const container = document.createElement('div');

    // Header
    const header = document.createElement('div');

    const title = document.createElement('h1');
    title.textContent = 'นโยบายความเป็นส่วนตัว';

    const subtitle = document.createElement('p');
    subtitle.textContent = 'เว็บไซต์ smsup-plus';

    const date = document.createElement('p');
    date.textContent = `อัปเดตล่าสุด: ${lastUpdated}`;

    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(date);

    // Content sections
    const content = document.createElement('div');

    // Trust indicators section
    const trustSection = document.createElement('div');
    trustSection.innerHTML = `
      <h3>นโยบายความเป็นส่วนตัวของเรา</h3>
      <p>เรามุ่งมั่นในการปกป้องข้อมูลส่วนบุคคลของคุณด้วยมาตรฐานสูงสุด</p>
      <ul>
        <li>เข้ารหัส SSL</li>
        <li>ไม่ขายข้อมูล</li>
        <li>ปฏิบัติตาม PDPA</li>
        <li>ควบคุมข้อมูลเอง</li>
      </ul>
    `;

    // Summary section
    const summarySection = document.createElement('div');
    summarySection.innerHTML = `
      <h2>สรุปนโยบาย</h2>
      <p>นโยบายความเป็นส่วนตัวนี้ครอบคลุม:</p>
      <ul>
        <li>การเก็บรวบรวมข้อมูลอย่างปลอดภัยและโปร่งใส</li>
        <li>การใช้ข้อมูลเพื่อปรับปรุงบริการและประสบการณ์การใช้งาน</li>
        <li>การปกป้องข้อมูลด้วยเทคโนโลยีและกระบวนการที่ทันสมัย</li>
        <li>สิทธิ์ของผู้ใช้ในการเข้าถึง แก้ไข และลบข้อมูล</li>
        <li>การปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
      </ul>
    `;

    // Main sections
    const sections = [
      {
        title: '1. ภาพรวม',
        content: `
          <p>นโยบายความเป็นส่วนตัวนี้ ("นโยบาย") อธิบายถึงวิธีที่ SMSUP-PLUS เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้บริการ SMS Marketing Platform ของเรา รวมถึงเว็บไซต์ smsup-plus.com และแอปพลิเคชันที่เกี่ยวข้อง</p>
          <p>นโยบายนี้ใช้กับข้อมูลที่เราเก็บรวบรวมผ่าน:</p>
          <ul>
            <li>เว็บไซต์และแอปพลิเคชันของเรา</li>
            <li>การโต้ตอบกับบริการลูกค้า</li>
            <li>การใช้ API และการผสานรวมระบบ</li>
            <li>การเข้าร่วมกิจกรรมทางการตลาด</li>
          </ul>
          <p>เราปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และกฎหมายอื่นที่เกี่ยวข้องในการจัดการข้อมูลส่วนบุคคลของคุณ</p>
          <p>ความมุ่งมั่นของเรา: เรามุ่งมั่นในการปกป้องข้อมูลส่วนบุคคลของคุณด้วยมาตรฐานความปลอดภัยสูงสุด และใช้ข้อมูลเพื่อวัตถุประสงค์ที่ชอบด้วยกฎหมายเท่านั้น</p>
        `
      },
      {
        title: '2. ข้อมูลที่เราเก็บรวบรวม',
        content: `
          <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลจากหลายช่องทางเพื่อให้บริการที่ดีที่สุดแก่คุณ:</p>

          <h3>2.1 ข้อมูลที่คุณให้เราโดยตรง</h3>
          <p>เมื่อคุณลงทะเบียนหรือใช้บริการของเรา เราอาจเก็บรวบรวม:</p>
          <ul>
            <li><strong>ข้อมูลการลงทะเบียน:</strong> ชื่อ อีเมล ที่อยู่ เบอร์โทรศัพท์ บริษัท และตำแหน่งงาน</li>
            <li><strong>ข้อมูลโปรไฟล์:</strong> รูปภาพประจำตัว การตั้งค่าบัญชี และการกำหนดลักษณะส่วนตัว</li>
            <li><strong>ข้อมูลการชำระเงิน:</strong> ข้อมูลบัตรเครดิตหรือบัญชีธนาคาร (ผ่านผู้ให้บริการชำระเงินที่ปลอดภัย)</li>
            <li><strong>เนื้อหาที่คุณสร้าง:</strong> ข้อความ SMS แคมเปญ และเนื้อหาการตลาดที่คุณอัปโหลด</li>
            <li><strong>ข้อมูลการติดต่อ:</strong> ข้อความ แชท และการสนทนากับทีมสนับสนุน</li>
          </ul>

          <h3>2.2 ข้อมูลที่เราเก็บรวบรวมโดยอัตโนมัติ</h3>
          <p>เมื่อคุณใช้บริการของเรา ระบบจะเก็บรวบรวมข้อมูลต่อไปนี้โดยอัตโนมัติ:</p>
          <ul>
            <li><strong>ข้อมูลการใช้งาน:</strong> วันที่และเวลาการเข้าถึง การกระทำที่ดำเนินการ และฟีเจอร์ที่ใช้</li>
            <li><strong>ข้อมูลอุปกรณ์:</strong> ประเภทอุปกรณ์ ระบบปฏิบัติการ เบราว์เซอร์ และที่อยู่ IP</li>
            <li><strong>ข้อมูลตำแหน่ง:</strong> ตำแหน่งทางภูมิศาสตร์โดยประมาณ (หากได้รับอนุญาต)</li>
            <li><strong>ข้อมูลประสิทธิภาพ:</strong> ความเร็วการโหลด เวลาในการตอบสนอง และข้อผิดพลาดของระบบ</li>
            <li><strong>Cookies และเทคโนโลยีติดตาม:</strong> ข้อมูลการตั้งค่าและการใช้งานเว็บไซต์</li>
          </ul>

          <h3>2.3 ข้อมูลจากแหล่งอื่น</h3>
          <p>เราอาจได้รับข้อมูลจากแหล่งอื่นเพื่อปรับปรุงบริการ:</p>
          <ul>
            <li><strong>พันธมิตรทางธุรกิจ:</strong> ข้อมูลการตรวจสอบและการยืนยันตัวตน</li>
            <li><strong>แพลตฟอร์มโซเชียลมีเดีย:</strong> ข้อมูลโปรไฟล์เมื่อคุณเชื่อมต่อบัญชี</li>
            <li><strong>ผู้ให้บริการภายนอก:</strong> ข้อมูลการวิเคราะห์และการตลาด</li>
            <li><strong>ฐานข้อมูลสาธารณะ:</strong> ข้อมูลที่สามารถเข้าถึงได้โดยสาธารณะเพื่อวัตถุประสงค์ทางธุรกิจที่ชอบด้วยกฎหมาย</li>
          </ul>

          <p>โปร่งใสในการเก็บข้อมูล: เราจะแจ้งให้คุณทราบอย่างชัดเจนทุกครั้งที่เราต้องการเก็บรวบรวมข้อมูลส่วนบุคคลเพิ่มเติม</p>
        `
      },
      {
        title: '3. วิธีการใช้ข้อมูล',
        content: `
          <p>เราใช้ข้อมูลส่วนบุคคลของคุณเพื่อวัตถุประสงค์ต่อไปนี้เท่านั้น:</p>

          <h3>3.1 การให้บริการและการสนับสนุน</h3>
          <ul>
            <li>สร้างและจัดการบัญชีผู้ใช้</li>
            <li>ให้บริการ SMS Marketing Platform</li>
            <li>ดำเนินการส่งข้อความและจัดการแคมเปญ</li>
            <li>ให้การสนับสนุนทางเทคนิคและลูกค้า</li>
            <li>ดำเนินการธุรกรรมและการชำระเงิน</li>
          </ul>

          <h3>3.2 การปรับปรุงและพัฒนาบริการ</h3>
          <ul>
            <li>วิเคราะห์พฤติกรรมการใช้งานเพื่อปรับปรุงประสบการณ์</li>
            <li>พัฒนาและทดสอบฟีเจอร์ใหม่</li>
            <li>แก้ไขปัญหาด้านเทคนิคและปรับปรุงประสิทธิภาพ</li>
            <li>ทำการวิจัยและพัฒนาเพื่อนวัตกรรมบริการ</li>
          </ul>

          <h3>3.3 การสื่อสารและการตลาด</h3>
          <ul>
            <li>ส่งการแจ้งเตือนเกี่ยวกับบริการและบัญชี</li>
            <li>แจ้งข่าวสารและอัปเดตที่สำคัญ</li>
            <li>ส่งข้อมูลทางการตลาดและโปรโมชั่น (หากได้รับความยินยอม)</li>
            <li>สำรวจความคิดเห็นเพื่อปรับปรุงบริการ</li>
          </ul>

          <h3>3.4 การปฏิบัติตามกฎหมายและความปลอดภัย</h3>
          <ul>
            <li>ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง</li>
            <li>ป้องกันการฉ้อโกงและการละเมิด</li>
            <li>ตรวจสอบและยืนยันตัวตน</li>
            <li>จัดการข้อพิพาทและการร้องเรียน</li>
            <li>เก็บรักษาบันทึกเพื่อวัตถุประสงค์ทางกฎหมาย</li>
          </ul>

          <p>การใช้ข้อมูลอย่างมีประโยชน์: เราจะใช้ข้อมูลของคุณเพื่อสร้างคุณค่าและประสบการณ์ที่ดีที่สุดในการใช้บริการ SMS Marketing Platform</p>
        `
      },
      {
        title: '4. การแบ่งปันข้อมูล',
        content: `
          <p>เรามุ่งมั่นในการปกป้องข้อมูลส่วนบุคคลของคุณและจะไม่ขายหรือให้เช่าข้อมูลให้กับบุคคลที่สามโดยไม่ได้รับความยินยอม เว้นแต่ในกรณีที่จำเป็นและชอบด้วยกฎหมาย</p>

          <h3>4.1 กรณีที่เราแบ่งปันข้อมูล</h3>
          <p>เราอาจแบ่งปันข้อมูลส่วนบุคคลของคุณในสถานการณ์ต่อไปนี้:</p>
          <ul>
            <li><strong>ผู้ให้บริการที่ได้รับอนุญาต:</strong> บริษัทที่ช่วยเราให้บริการ เช่น ผู้ให้บริการโฮสติ้ง ผู้ให้บริการอีเมล และผู้ให้บริการวิเคราะห์ข้อมูล</li>
            <li><strong>พันธมิตรทางธุรกิจ:</strong> บริษัทที่ร่วมมือกับเราในการให้บริการ SMS หรือการตลาด (ภายใต้สัญญาความลับ)</li>
            <li><strong>ผู้ให้บริการทางการเงิน:</strong> ธนาคารหรือผู้ให้บริการชำระเงินสำหรับดำเนินการธุรกรรม</li>
            <li><strong>ที่ปรึกษากฎหมาย:</strong> ทนายความและที่ปรึกษาเมื่อจำเป็นสำหรับการดำเนินคดีหรือการปฏิบัติตามกฎหมาย</li>
          </ul>

          <h3>4.2 การโอนข้อมูลข้ามพรมแดน</h3>
          <p>ในบางกรณี เราอาจต้องโอนข้อมูลส่วนบุคคลของคุณไปยังประเทศอื่นเพื่อวัตถุประสงค์ในการให้บริการ การโอนข้อมูลดังกล่าวจะดำเนินการภายใต้การคุ้มครองที่เหมาะสมตามกฎหมาย PDPA</p>

          <h3>4.3 การไม่ขายข้อมูล</h3>
          <p>เราไม่ขาย ขายต่อ หรือให้เช่าข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาดโดยไม่ได้รับความยินยอมจากคุณอย่างชัดเจน</p>

          <p>ความมุ่งมั่นในการปกป้อง: เราจะแบ่งปันข้อมูลเฉพาะเมื่อมีความจำเป็นและภายใต้การคุ้มครองที่เข้มงวด</p>
        `
      },
      {
        title: '5. การใช้คุกกี้และเทคโนโลยีติดตาม',
        content: `
          <p>เราใช้คุกกี้และเทคโนโลยีติดตามอื่นเพื่อปรับปรุงประสบการณ์การใช้งานและให้บริการที่ดีที่สุด</p>

          <h3>5.1 ประเภทของคุกกี้ที่เราใช้</h3>
          <ul>
            <li><strong>คุกกี้ที่จำเป็น:</strong> ใช้สำหรับการทำงานพื้นฐานของเว็บไซต์ เช่น การเข้าสู่ระบบและความปลอดภัย</li>
            <li><strong>คุกกี้วิเคราะห์:</strong> ช่วยเราเข้าใจว่าผู้ใช้ใช้เว็บไซต์อย่างไรเพื่อปรับปรุงประสบการณ์</li>
            <li><strong>คุกกี้การตลาด:</strong> ใช้เพื่อแสดงโฆษณาที่เกี่ยวข้องและติดตามประสิทธิภาพแคมเปญ</li>
            <li><strong>คุกกี้ฟังก์ชัน:</strong> จดจำการตั้งค่าและการกำหนดลักษณะส่วนตัวของคุณ</li>
          </ul>

          <h3>5.2 การจัดการคุกกี้</h3>
          <p>คุณสามารถจัดการการตั้งค่าคุกกี้ได้หลายวิธี:</p>
          <ul>
            <li>ตั้งค่าเบราว์เซอร์ให้ปฏิเสธคุกกี้ทั้งหมดหรือเฉพาะบางประเภท</li>
            <li>ลบคุกกี้ที่มีอยู่ผ่านการตั้งค่าเบราว์เซอร์</li>
            <li>ใช้โหมดไม่ติดตาม (Do Not Track) ในเบราว์เซอร์</li>
            <li>ติดต่อเราหากต้องการความช่วยเหลือในการจัดการคุกกี้</li>
          </ul>

          <p>โปรดทราบว่าการปิดใช้งานคุกกี้บางประเภทอาจส่งผลต่อการทำงานของเว็บไซต์และประสบการณ์การใช้งาน</p>

          <p>เครื่องมือจัดการคุกกี้: คุณสามารถจัดการการตั้งค่าคุกกี้ได้ทุกเมื่อผ่านการตั้งค่าในบัญชีของคุณหรือติดต่อทีมสนับสนุน</p>
        `
      },
      {
        title: '6. สิทธิ์ของผู้ใช้',
        content: `
          <p>ตามกฎหมาย PDPA คุณมีสิทธิ์หลายประการในการจัดการข้อมูลส่วนบุคคลของคุณ:</p>

          <h3>6.1 สิทธิ์ในการเข้าถึงข้อมูล</h3>
          <p>คุณมีสิทธิ์ขอรับสำเนาข้อมูลส่วนบุคคลที่เราเก็บรวบรวมเกี่ยวกับคุณ รวมถึง:</p>
          <ul>
            <li>ข้อมูลที่คุณให้เราโดยตรง</li>
            <li>ข้อมูลที่เราเก็บรวบรวมโดยอัตโนมัติ</li>
            <li>ข้อมูลจากแหล่งอื่น</li>
            <li>วัตถุประสงค์ในการเก็บรวบรวมและการใช้ข้อมูล</li>
          </ul>

          <h3>6.2 สิทธิ์ในการแก้ไขข้อมูล</h3>
          <p>คุณมีสิทธิ์ขอให้เราแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง ไม่ครบถ้วน หรือไม่เป็นปัจจุบัน</p>

          <h3>6.3 สิทธิ์ในการลบข้อมูล</h3>
          <p>คุณมีสิทธิ์ขอให้เราลบข้อมูลส่วนบุคคลของคุณในกรณีต่อไปนี้:</p>
          <ul>
            <li>ข้อมูลไม่จำเป็นสำหรับวัตถุประสงค์ที่เก็บรวบรวม</li>
            <li>คุณถอนความยินยอมและไม่มีฐานกฎหมายอื่นในการเก็บข้อมูล</li>
            <li>ข้อมูลถูกประมวลผลโดยไม่ชอบด้วยกฎหมาย</li>
            <li>จำเป็นต้องลบเพื่อปฏิบัติตามกฎหมาย</li>
          </ul>

          <h3>6.4 สิทธิ์ในการปฏิเสธ</h3>
          <p>คุณมีสิทธิ์คัดค้านการประมวลผลข้อมูลส่วนบุคคลของคุณในบางกรณี เช่น การประมวลผลเพื่อวัตถุประสงค์ทางการตลาด</p>

          <h3>6.5 สิทธิ์ในการโอนย้ายข้อมูล</h3>
          <p>คุณมีสิทธิ์ขอรับข้อมูลส่วนบุคคลของคุณในรูปแบบที่สามารถอ่านได้ด้วยเครื่องและโอนไปยังผู้ควบคุมข้อมูลรายอื่น</p>

          <h3>6.6 สิทธิ์ในการถอนความยินยอม</h3>
          <p>หากการประมวลผลข้อมูลส่วนบุคคลของคุณอิงอยู่กับความยินยอม คุณมีสิทธิ์ถอนความยินยอมได้ทุกเมื่อ</p>

          <p>วิธีใช้สิทธิ์: ติดต่อเราได้ที่ privacy@smsup-plus.com หรือโทร 02-123-4567</p>
        `
      },
      {
        title: '7. ช่องทางติดต่อ',
        content: `
          <p>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สิทธิ์ในการจัดการข้อมูลส่วนบุคคล หรือต้องการใช้สิทธิ์ตาม PDPA สามารถติดต่อเราได้ที่:</p>

          <h4>อีเมล</h4>
          <p>privacy@smsup-plus.com</p>
          <p>สำหรับเรื่องความเป็นส่วนตัวและข้อมูลส่วนบุคคล</p>

          <h4>โทรศัพท์</h4>
          <p>02-123-4567</p>
          <p>จันทร์-ศุกร์ 9:00-18:00 น.</p>

          <h4>ที่อยู่</h4>
          <p>123 ถนนสุขุมวิท แขวงคลองเตย</p>
          <p>เขตคลองเตย กรุงเทพมหานคร 10110</p>

          <p>เราจะตอบกลับคำขอของคุณภายใน 30 วันตามที่กฎหมายกำหนด และอาจขอข้อมูลเพิ่มเติมเพื่อยืนยันตัวตนของคุณ</p>
        `
      },
      {
        title: '8. การเปลี่ยนแปลงนโยบาย',
        content: `
          <p>เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางเทคโนโลยี กฎหมาย หรือแนวปฏิบัติในการปกป้องข้อมูล</p>

          <h3>8.1 การแจ้งเตือนการเปลี่ยนแปลง</h3>
          <p>การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้คุณทราบล่วงหน้า 30 วัน ผ่านทาง:</p>
          <ul>
            <li>อีเมลที่ได้ลงทะเบียนไว้ในระบบ</li>
            <li>ประกาศในเว็บไซต์และแอปพลิเคชัน</li>
            <li>การแจ้งเตือนในแพลตฟอร์ม</li>
            <li>ช่องทางสื่อสารอื่นที่เราใช้</li>
          </ul>

          <h3>8.2 ผลของการเปลี่ยนแปลง</h3>
          <p>การใช้งานต่อหลังจากที่มีการเปลี่ยนแปลง ถือว่าคุณยอมรับนโยบายใหม่ หากคุณไม่เห็นด้วยกับการเปลี่ยนแปลง สามารถยกเลิกบัญชีได้ตามที่ระบุในข้อกำหนดการใช้งาน</p>

          <h3>8.3 การตรวจสอบนโยบาย</h3>
          <p>เราขอแนะนำให้คุณตรวจสอบนโยบายนี้เป็นประจำเพื่อติดตามการเปลี่ยนแปลง นโยบายนี้มีผลบังคับใช้ตั้งแต่วันที่ ${lastUpdated} และแทนที่นโยบายก่อนหน้านี้ทั้งหมด</p>

          <p>ติดตามการเปลี่ยนแปลง: เราจะแจ้งให้คุณทราบทุกการเปลี่ยนแปลงที่สำคัญเพื่อให้คุณสามารถตัดสินใจได้อย่างมีข้อมูล</p>
        `
      }
    ];

    sections.forEach(section => {
      const sectionDiv = document.createElement('div');

      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = section.title;

      const sectionContent = document.createElement('div');
      sectionContent.innerHTML = section.content;

      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(sectionContent);
      content.appendChild(sectionDiv);
    });

    // FAQ Section
    const faqSection = document.createElement('div');
    faqSection.innerHTML = `
      <h2>คำถามที่พบบ่อย</h2>

      <h4>ข้อมูลของฉันปลอดภัยแค่ไหน?</h4>
      <p>เราปกป้องข้อมูลของคุณด้วยการเข้ารหัส SSL, การควบคุมการเข้าถึงที่เข้มงวด, และการตรวจสอบความปลอดภัยเป็นประจำ รวมถึงการปฏิบัติตามมาตรฐานความปลอดภัยระดับสากล</p>

      <h4>ฉันสามารถขอให้ลบข้อมูลได้หรือไม่?</h4>
      <p>ได้ คุณมีสิทธิ์ขอให้ลบข้อมูลส่วนบุคคลได้ทุกเมื่อ โดยติดต่อเราผ่านช่องทางที่ระบุไว้ เราจะดำเนินการตามคำขอภายใน 30 วัน</p>

      <h4>ข้อมูลของฉันถูกใช้เพื่ออะไรบ้าง?</h4>
      <p>ใช้เพื่อให้บริการ ปรับปรุงประสบการณ์การใช้งาน และปฏิบัติตามกฎหมายเท่านั้น เราจะไม่ใช้ข้อมูลของคุณเพื่อวัตถุประสงค์อื่นโดยไม่ได้รับความยินยอม</p>

      <h4>ฉันจะจัดการการตั้งค่าคุกกี้ได้อย่างไร?</h4>
      <p>คุณสามารถจัดการคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์ หรือติดต่อทีมสนับสนุนของเราเพื่อขอความช่วยเหลือในการตั้งค่า</p>
    `;

    container.appendChild(header);
    container.appendChild(trustSection);
    container.appendChild(summarySection);
    container.appendChild(content);
    container.appendChild(faqSection);

    return container;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      <Navigation />

      <section ref={contentRef} className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                นโยบายความเป็นส่วนตัว
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                เว็บไซต์ smsup-plus
              </p>
              <p className="text-sm text-muted-foreground">
                อัปเดตล่าสุด: {lastUpdated}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  🖨️ พิมพ์เอกสาร
                </Button>
              </div>
              {pdfError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{pdfError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">สารบัญ</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="grid grid-cols-2 gap-2" aria-label="สารบัญ">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          aria-label={`ไปยังส่วน ${section.title}`}
                          className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm ${
                            currentSection === section.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {section.icon}
                          <span className="truncate">{section.title}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Table of Contents - Desktop Sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">สารบัญ</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1" aria-label="สารบัญ">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          aria-label={`ไปยังส่วน ${section.title}`}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                            currentSection === section.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {section.icon}
                          <span className="text-sm">{section.title}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div id="main-content" className="lg:col-span-3">
                {/* Trust Infobox */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">🔒 ข้อมูลของคุณปลอดภัย</h3>
                      </div>
                      <p className="text-sm text-green-800 mb-3">
                        เรามุ่งมั่นปกป้องข้อมูลส่วนบุคคลของคุณตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA) และ GDPR
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          PDPA Compliant
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          SSL Encrypted
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Regular Audits
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ScrollArea className="h-[400px] md:h-[600px] lg:h-[700px] pr-4">
                  {/* Overview Section */}
                  <section id="overview" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>1. ภาพรวม</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        นโยบายความเป็นส่วนตัวนี้ ("นโยบาย") อธิบายถึงวิธีที่ SMSUP-PLUS เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณเมื่อคุณใช้บริการ SMS Marketing Platform ของเรา
                      </p>
                      <p className="mb-4">
                        เรามุ่งมั่นที่จะปกป้องความเป็นส่วนตัวและข้อมูลส่วนบุคคลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) และกฎหมายคุ้มครองข้อมูลส่วนบุคคลของสหภาพยุโรป (GDPR)
                      </p>
                      <p className="mb-4">
                        นโยบายนี้ใช้กับข้อมูลส่วนบุคคลที่เราเก็บรวบรวมผ่านเว็บไซต์ แอปพลิเคชัน และบริการของเรา รวมถึงข้อมูลที่คุณให้กับเราโดยตรงหรือที่เราเก็บรวบรวมโดยอัตโนมัติ
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>💡 เคล็ดลับ:</strong> หากคุณมีคำถามเกี่ยวกับนโยบายนี้ สามารถติดต่อเจ้าหน้าที่คุ้มครองข้อมูลได้ทุกเมื่อ
                        </p>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Data Collected Section */}
                  <section id="data-collected" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Database className="h-6 w-6" />
                      <span>2. ข้อมูลที่เราเก็บ</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <h3 className="text-lg font-semibold mb-2">2.1 ข้อมูลที่คุณให้เราโดยตรง</h3>
                      <ul className="list-disc pl-6 mb-4">
                        <li>ข้อมูลการสมัครสมาชิก (ชื่อ, นามสกุล, อีเมล, เบอร์โทรศัพท์)</li>
                        <li>ข้อมูลโปรไฟล์ (ที่อยู่, ประเภทธุรกิจ, ขนาดองค์กร)</li>
                        <li>ข้อมูลการชำระเงิน (สำหรับบริการแบบเสียค่าใช้จ่าย)</li>
                        <li>เนื้อหาที่คุณส่งผ่านฟอร์มติดต่อ แชท หรือการสนับสนุน</li>
                        <li>ข้อมูลการตั้งค่าและการใช้งานบริการ</li>
                      </ul>

                      <h3 className="text-lg font-semibold mb-2">2.2 ข้อมูลที่เราเก็บรวบรวมโดยอัตโนมัติ</h3>
                      <ul className="list-disc pl-6 mb-4">
                        <li>ข้อมูลการใช้งาน (หน้าเว็บที่เข้าชม, เวลาที่ใช้, การคลิก)</li>
                        <li>ข้อมูลอุปกรณ์ (IP Address, ประเภทเบราว์เซอร์, ระบบปฏิบัติการ)</li>
                        <li>Cookies และเทคโนโลยีติดตามอื่นๆ</li>
                        <li>ข้อมูลตำแหน่งทางภูมิศาสตร์ (ถ้าคุณอนุญาต)</li>
                        <li>ข้อมูลประสิทธิภาพและข้อผิดพลาดของระบบ</li>
                      </ul>

                      <h3 className="text-lg font-semibold mb-2">2.3 ข้อมูลจากแหล่งอื่น</h3>
                      <ul className="list-disc pl-6 mb-4">
                        <li>ข้อมูลจากพันธมิตรทางธุรกิจ (ถ้ามี)</li>
                        <li>ข้อมูลสาธารณะที่สามารถเข้าถึงได้</li>
                        <li>ข้อมูลจากเครือข่ายสังคมออนไลน์ (ถ้าคุณเชื่อมต่อ)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Data Usage Section */}
                  <section id="data-usage" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Eye className="h-6 w-6" />
                      <span>3. วิธีการใช้ข้อมูล</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">เราใช้ข้อมูลของคุณเพื่อวัตถุประสงค์ต่อไปนี้:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">🎯 บริการหลัก</h4>
                          <ul className="text-sm space-y-1">
                            <li>• สร้างและจัดการบัญชีผู้ใช้</li>
                            <li>• ให้บริการ SMS Marketing Platform</li>
                            <li>• ตอบคำถามและให้การสนับสนุนลูกค้า</li>
                            <li>• ประมวลผลการชำระเงิน</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">📊 ปรับปรุงและพัฒนาบริการ</h4>
                          <ul className="text-sm space-y-1">
                            <li>• วิเคราะห์การใช้งานและประสิทธิภาพ</li>
                            <li>• พัฒนาและปรับปรุงฟีเจอร์ใหม่</li>
                            <li>• ป้องกันการละเมิดและการฉ้อโกง</li>
                            <li>• ทำการสำรองข้อมูลและกู้คืน</li>
                          </ul>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">📧 การสื่อสาร</h4>
                          <ul className="text-sm space-y-1">
                            <li>• ส่งการแจ้งเตือนและอัปเดต</li>
                            <li>• ตอบกลับคำถามและข้อร้องเรียน</li>
                            <li>• ส่งข่าวสารทางการตลาด (ถ้าคุณยินยอม)</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">⚖️ การปฏิบัติตามกฎหมาย</h4>
                          <ul className="text-sm space-y-1">
                            <li>• ปฏิบัติตามกฎหมายและข้อบังคับ</li>
                            <li>• ตอบสนองต่อคำร้องขอทางกฎหมาย</li>
                            <li>• บังคับใช้ข้อกำหนดการใช้งาน</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Data Sharing Section */}
                  <section id="data-sharing" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <UserCheck className="h-6 w-6" />
                      <span>4. การแบ่งปันข้อมูล</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม ยกเว้นในกรณีต่อไปนี้:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li><strong>พันธมิตรทางธุรกิจ:</strong> เฉพาะที่จำเป็นสำหรับให้บริการ (เช่น ระบบชำระเงิน)</li>
                        <li><strong>ตามกฎหมาย:</strong> เมื่อถูกเรียกร้องโดยหน่วยงานราชการ</li>
                        <li><strong>ด้วยความยินยอม:</strong> เมื่อคุณอนุญาตให้เราแบ่งปัน</li>
                        <li><strong>การควบรวมกิจการ:</strong> ในกรณีที่บริษัทถูกซื้อกิจการ</li>
                      </ul>
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ สิ่งสำคัญ:</strong> เราจะแจ้งให้คุณทราบก่อนการแบ่งปันข้อมูลทุกครั้ง
                        </p>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Cookies Section */}
                  <section id="cookies" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Cookie className="h-6 w-6" />
                      <span>5. การใช้ Cookies</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        Cookies ช่วยให้เราให้บริการที่ดีขึ้นและปรับแต่งประสบการณ์การใช้งานของคุณ
                      </p>
                      <h3 className="text-lg font-semibold mb-2">ประเภท Cookies ที่เราใช้:</h3>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-green-700">🍪 Essential Cookies</h4>
                          <p className="text-sm text-gray-600">จำเป็นสำหรับการทำงานของเว็บไซต์</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-blue-700">📊 Analytics Cookies</h4>
                          <p className="text-sm text-gray-600">วิเคราะห์การใช้งานเพื่อปรับปรุงบริการ</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h4 className="font-semibold text-purple-700">🎯 Marketing Cookies</h4>
                          <p className="text-sm text-gray-600">แสดงโฆษณาที่เกี่ยวข้อง (เฉพาะที่คุณยินยอม)</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        คุณสามารถจัดการการตั้งค่า Cookies ได้ในเบราว์เซอร์ของคุณ
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* User Rights Section */}
                  <section id="user-rights" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Lock className="h-6 w-6" />
                      <span>6. สิทธิ์ของผู้ใช้</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        ตาม PDPA คุณมีสิทธิ์ต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของคุณ:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold">สิทธิ์ในการเข้าถึง</h4>
                              <p className="text-sm text-gray-600">ขอสำเนาข้อมูลที่เราเก็บ</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold">สิทธิ์ในการลบ</h4>
                              <p className="text-sm text-gray-600">ขอให้ลบข้อมูลส่วนบุคคล</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold">สิทธิ์ในการแก้ไข</h4>
                              <p className="text-sm text-gray-600">ขอให้แก้ไขข้อมูลที่ไม่ถูกต้อง</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold">สิทธิ์ในการปฏิเสธ</h4>
                              <p className="text-sm text-gray-600">ปฏิเสธการประมวลผลข้อมูล</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                        <p className="text-sm text-green-800">
                          <strong>📞 วิธีใช้สิทธิ์:</strong> ติดต่อเราได้ที่ privacy@smsup-plus.com หรือโทร 02-123-4567
                        </p>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Contact Section */}
                  <section id="contact" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Phone className="h-6 w-6" />
                      <span>7. ช่องทางติดต่อ</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเราได้ที่:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold">อีเมล</h4>
                          </div>
                          <p className="text-sm">privacy@smsup-plus.com</p>
                          <p className="text-xs text-gray-600">สำหรับเรื่องความเป็นส่วนตัว</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold">โทรศัพท์</h4>
                          </div>
                          <p className="text-sm">02-123-4567</p>
                          <p className="text-xs text-gray-600">จันทร์-ศุกร์ 9:00-18:00 น.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Changes Section */}
                  <section id="changes" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Calendar className="h-6 w-6" />
                      <span>8. การเปลี่ยนแปลงนโยบาย</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการเปลี่ยนแปลงทางเทคโนโลยี กฎหมาย หรือแนวปฏิบัติในการปกป้องข้อมูล
                      </p>
                      <p className="mb-4">
                        การเปลี่ยนแปลงที่สำคัญจะถูกแจ้งให้คุณทราบล่วงหน้า 30 วัน ผ่านทางอีเมลที่ได้ลงทะเบียนไว้และประกาศในเว็บไซต์
                      </p>
                      <p className="mb-4">
                        การใช้งานต่อหลังจากที่มีการเปลี่ยนแปลง ถือว่าคุณยอมรับนโยบายใหม่ หากคุณไม่เห็นด้วยกับการเปลี่ยนแปลง สามารถยกเลิกบัญชีได้ตามที่ระบุในข้อกำหนดการใช้งาน
                      </p>
                      <p className="mb-4">
                        เราขอแนะนำให้คุณตรวจสอบนโยบายนี้เป็นประจำเพื่อติดตามการเปลี่ยนแปลง
                      </p>
                      <p>
                        นโยบายนี้มีผลบังคับใช้ตั้งแต่วันที่ {lastUpdated} และแทนที่นโยบายก่อนหน้านี้ทั้งหมด
                      </p>
                    </div>
                  </section>

                  {/* FAQ Section */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">❓ คำถามที่พบบ่อย</h2>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">ข้อมูลของฉันปลอดภัยแค่ไหน?</h4>
                        <p className="text-sm text-gray-600">
                          เราปกป้องข้อมูลของคุณด้วยการเข้ารหัส SSL, การควบคุมการเข้าถึงที่เข้มงวด, และการตรวจสอบความปลอดภัยเป็นประจำ
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">ฉันสามารถขอให้ลบข้อมูลได้หรือไม่?</h4>
                        <p className="text-sm text-gray-600">
                          ได้ คุณมีสิทธิ์ขอให้ลบข้อมูลส่วนบุคคลได้ทุกเมื่อ โดยติดต่อเราผ่านช่องทางที่ระบุไว้
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">ข้อมูลของฉันถูกใช้เพื่ออะไรบ้าง?</h4>
                        <p className="text-sm text-gray-600">
                          ใช้เพื่อให้บริการ, ปรับปรุงประสบการณ์การใช้งาน, และปฏิบัติตามกฎหมายเท่านั้น
                        </p>
                      </div>
                    </div>
                  </section>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
