import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, Shield, Users, AlertTriangle, Phone, Mail, Calendar, Download, Loader2 } from 'lucide-react';
import { generateLegalDocumentPDF } from '@/lib/pdfGenerator';

const TermsOfService = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [currentSection, setCurrentSection] = useState('overview');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const lastUpdated = '12 กันยายน 2025';

  const sections = [
    { id: 'overview', title: 'ภาพรวม', icon: <FileText className="h-4 w-4" /> },
    { id: 'user-account', title: 'ข้อมูลผู้ใช้และบัญชี', icon: <Users className="h-4 w-4" /> },
    { id: 'copyright', title: 'ลิขสิทธิ์และทรัพย์สินทางปัญญา', icon: <Shield className="h-4 w-4" /> },
    { id: 'prohibited', title: 'พฤติกรรมต้องห้าม', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'termination', title: 'การระงับและปิดบัญชี', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'liability', title: 'ข้อจำกัดความรับผิด', icon: <Shield className="h-4 w-4" /> },
    { id: 'contact', title: 'ช่องทางติดต่อ', icon: <Phone className="h-4 w-4" /> },
    { id: 'changes', title: 'การเปลี่ยนแปลงข้อกำหนด', icon: <Calendar className="h-4 w-4" /> }
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
      const pdfContent = createPDFContentForTerms(lastUpdated);

      await generateLegalDocumentPDF(pdfContent, 'terms', lastUpdated);
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ฟังก์ชันสำหรับสร้างเนื้อหา PDF ที่เฉพาะเจาะจง
  const createPDFContentForTerms = (lastUpdated: string): HTMLElement => {
    const container = document.createElement('div');

    // Header
    const header = document.createElement('div');

    const title = document.createElement('h1');
    title.textContent = 'ข้อกำหนดการใช้งาน';

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
      <h3>ข้อกำหนดการใช้งานของเรา</h3>
      <p>เพื่อให้การใช้งานบริการเป็นไปอย่างมีประสิทธิภาพและปลอดภัย</p>
      <ul>
        <li>ความปลอดภัย</li>
        <li>ความโปร่งใส</li>
        <li>ความยุติธรรม</li>
        <li>การปฏิบัติตามกฎหมาย</li>
      </ul>
    `;

    // Summary section
    const summarySection = document.createElement('div');
    summarySection.innerHTML = `
      <h2>สรุปข้อกำหนด</h2>
      <p>ข้อกำหนดการใช้งานครอบคลุม:</p>
      <ul>
        <li>การใช้งานบริการอย่างถูกต้องและมีความรับผิดชอบ</li>
        <li>การคุ้มครองข้อมูลส่วนบุคคลและลิขสิทธิ์</li>
        <li>พฤติกรรมที่ยอมรับได้ในการใช้บริการ</li>
        <li>สิทธิ์และหน้าที่ของผู้ใช้บริการ</li>
        <li>การจัดการข้อพิพาทและการระงับบริการ</li>
      </ul>
    `;

    // Main sections
    const sections = [
      {
        title: '1. ภาพรวม',
        content: `
          <p>ยินดีต้อนรับสู่ SMSUP-PLUS ข้อกำหนดการใช้งานนี้ ("ข้อกำหนด") อธิบายถึงกฎและเงื่อนไขในการใช้บริการ SMS Marketing Platform ของเรา รวมถึงเว็บไซต์ smsup-plus.com และแอปพลิเคชันที่เกี่ยวข้อง</p>
          <p>ข้อกำหนดนี้ใช้กับ:</p>
          <ul>
            <li>การเข้าถึงและใช้งานเว็บไซต์ของเรา</li>
            <li>การใช้บริการ SMS Marketing Platform</li>
            <li>การโต้ตอบกับทีมสนับสนุนลูกค้า</li>
            <li>การใช้ API และการผสานรวมระบบ</li>
          </ul>
          <p>โดยการเข้าถึงหรือใช้งานบริการของเรา คุณตกลงที่จะผูกพันตามข้อกำหนดเหล่านี้ หากคุณไม่เห็นด้วยกับข้อกำหนดใด ๆ โปรดหยุดการใช้งานบริการของเรา</p>
          <p>ความมุ่งมั่นของเรา: เรามุ่งมั่นในการให้บริการที่มีคุณภาพและรักษาความปลอดภัยสูงสุดสำหรับผู้ใช้ทุกคน</p>
        `
      },
      {
        title: '2. บัญชีผู้ใช้',
        content: `
          <p>การสร้างและการจัดการบัญชีผู้ใช้เป็นส่วนสำคัญในการใช้งานบริการของเรา</p>

          <h3>2.1 คุณสมบัติของผู้ใช้</h3>
          <p>ในการลงทะเบียนและใช้งานบริการ คุณต้อง:</p>
          <ul>
            <li>มีอายุอย่างน้อย 18 ปี หรือได้รับความยินยอมจากผู้ปกครองหากอายุต่ำกว่า</li>
            <li>เป็นบุคคลธรรมดาหรือนิติบุคคลที่มีสิทธิ์และความสามารถตามกฎหมาย</li>
            <li>ไม่เคยถูกระงับหรือยกเลิกการใช้งานจากบริการของเรา</li>
            <li>ไม่เป็นบุคคลที่ถูกห้ามตามกฎหมายในการใช้บริการนี้</li>
          </ul>

          <h3>2.2 การลงทะเบียนบัญชี</h3>
          <p>ในการใช้งานบริการ คุณต้องลงทะเบียนบัญชีโดย:</p>
          <ul>
            <li>ให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบัน</li>
            <li>ใช้ชื่อจริงหรือชื่อธุรกิจที่ถูกต้อง</li>
            <li>ให้ที่อยู่ อีเมล และข้อมูลติดต่อที่สามารถใช้งานได้</li>
            <li>ยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว</li>
          </ul>

          <h3>2.3 ความปลอดภัยของบัญชี</h3>
          <p>คุณมีหน้าที่รับผิดชอบในการ:</p>
          <ul>
            <li>รักษาความปลอดภัยของชื่อผู้ใช้และรหัสผ่าน</li>
            <li>ไม่เปิดเผยข้อมูลการเข้าสู่ระบบให้กับผู้อื่น</li>
            <li>แจ้งให้เราทราบทันทีหากพบการใช้งานที่ไม่ได้รับอนุญาต</li>
            <li>ออกจากระบบหลังจากใช้งานเสร็จ</li>
          </ul>

          <h3>2.4 การใช้งานหลายบัญชี</h3>
          <p>แต่ละบุคคลหรือนิติบุคคลสามารถมีได้เพียงหนึ่งบัญชีเท่านั้น ยกเว้นได้รับอนุญาตเป็นพิเศษ</p>

          <p>คำเตือน: การให้ข้อมูลเท็จหรือการใช้บัญชีหลายบัญชีโดยไม่ได้รับอนุญาตอาจนำไปสู่การระงับหรือยกเลิกการใช้งาน</p>
        `
      },
      {
        title: '3. ลิขสิทธิ์และทรัพย์สินทางปัญญา',
        content: `
          <p>เนื้อหาและฟีเจอร์ทั้งหมดในบริการของเราได้รับการคุ้มครองโดยกฎหมายลิขสิทธิ์และทรัพย์สินทางปัญญา</p>

          <h3>3.1 สิทธิ์ในทรัพย์สินทางปัญญา</h3>
          <p>SMSUP-PLUS เป็นเจ้าของหรือได้รับอนุญาตให้ใช้:</p>
          <ul>
            <li>ซอฟต์แวร์ แอปพลิเคชัน และระบบทั้งหมด</li>
            <li>โลโก้ เครื่องหมายการค้า และแบรนด์</li>
            <li>ฐานข้อมูลและเนื้อหาทั้งหมด</li>
            <li>เอกสารประกอบและคู่มือการใช้งาน</li>
            <li>เทคโนโลยีและนวัตกรรมที่ใช้ในบริการ</li>
          </ul>

          <h3>3.2 สิทธิ์ในการใช้งาน</h3>
          <p>เรามอบสิทธิ์ที่จำกัด ไม่สามารถโอนได้ และสามารถเพิกถอนได้ในการ:</p>
          <ul>
            <li>เข้าถึงและใช้งานบริการตามวัตถุประสงค์ที่กำหนด</li>
            <li>ดาวน์โหลดและใช้งานเอกสารที่จำเป็น</li>
            <li>ใช้ฟีเจอร์และเครื่องมือที่ให้บริการ</li>
          </ul>

          <h3>3.3 ข้อจำกัดในการใช้งาน</h3>
          <p>คุณไม่ได้รับอนุญาตให้:</p>
          <ul>
            <li>คัดลอก แก้ไข หรือแจกจ่ายซอฟต์แวร์หรือเนื้อหา</li>
            <li>ถอดรหัสหรือพยายามเข้าถึงซอร์สโค้ด</li>
            <li>สร้างงานลอกเลียนแบบหรือผลิตภัณฑ์แข่งขัน</li>
            <li>ใช้เครื่องหมายการค้าหรือแบรนด์โดยไม่ได้รับอนุญาต</li>
            <li>นำเนื้อหาไปใช้เพื่อวัตถุประสงค์ทางการค้า</li>
          </ul>

          <p>การคุ้มครองสิทธิ์: เราจะใช้มาตรการทางกฎหมายอย่างเต็มที่ในการปกป้องทรัพย์สินทางปัญญาของเรา</p>
        `
      },
      {
        title: '4. พฤติกรรมต้องห้าม',
        content: `
          <p>เพื่อให้บริการเป็นไปอย่างปลอดภัยและเป็นธรรมสำหรับทุกคน เรามีข้อห้ามในการใช้งานดังต่อไปนี้</p>

          <h3>4.1 การส่งข้อความ</h3>
          <p>ห้ามใช้บริการเพื่อส่ง:</p>
          <ul>
            <li>ข้อความสแปมหรือข้อความที่ไม่พึงประสงค์</li>
            <li>ข้อความที่มีเนื้อหาไม่เหมาะสมหรือผิดกฎหมาย</li>
            <li>ข้อความที่ละเมิดสิทธิ์ของผู้อื่น</li>
            <li>ข้อความที่เป็นเท็จหรือทำให้เข้าใจผิด</li>
            <li>ข้อความที่มีไวรัสหรือมัลแวร์</li>
          </ul>

          <h3>4.2 การละเมิดระบบ</h3>
          <p>ห้ามพยายาม:</p>
          <ul>
            <li>เข้าถึงระบบโดยไม่ได้รับอนุญาต</li>
            <li>แทรกแซงหรือรบกวนการทำงานของบริการ</li>
            <li>ใช้บอทหรือสคริปต์อัตโนมัติ</li>
            <li>ทำการโจมตี DDoS หรือการโจมตีอื่น ๆ</li>
            <li>แฮ็กหรือพยายามเจาะระบบความปลอดภัย</li>
          </ul>

          <h3>4.3 การละเมิดสิทธิ์ผู้อื่น</h3>
          <p>ห้าม:</p>
          <ul>
            <li>ละเมิดลิขสิทธิ์หรือทรัพย์สินทางปัญญา</li>
            <li>ละเมิดความเป็นส่วนตัวของผู้อื่น</li>
            <li>ใช้ข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต</li>
            <li>สร้างความเสียหายต่อชื่อเสียงของผู้อื่น</li>
            <li>กระทำการที่เป็นการเลือกปฏิบัติหรือมีอคติ</li>
          </ul>

          <h3>4.4 การใช้บริการเพื่อวัตถุประสงค์ผิดกฎหมาย</h3>
          <p>ห้ามใช้บริการเพื่อ:</p>
          <ul>
            <li>กิจกรรมที่ผิดกฎหมายหรือเป็นการฉ้อโกง</li>
            <li>ส่งเสริมการก่อการร้ายหรือความรุนแรง</li>
            <li>แจกจ่ายยาเสพติดหรือสารต้องห้าม</li>
            <li>การพนันหรือกิจกรรมที่ผิดกฎหมายอื่น ๆ</li>
          </ul>

          <p>การละเมิดข้อห้าม: การละเมิดพฤติกรรมต้องห้ามอาจนำไปสู่การระงับบัญชี การยกเลิกการใช้งาน และการดำเนินคดีตามกฎหมาย</p>
        `
      },
      {
        title: '5. การระงับและการยกเลิก',
        content: `
          <p>เราสงวนสิทธิ์ในการจัดการบัญชีผู้ใช้ที่ละเมิดข้อกำหนดเพื่อรักษาคุณภาพและความปลอดภัยของบริการ</p>

          <h3>5.1 การระงับบัญชี</h3>
          <p>เราอาจระงับบัญชีของคุณชั่วคราวในกรณีต่อไปนี้:</p>
          <ul>
            <li>พบพฤติกรรมที่สงสัยว่าจะละเมิดข้อกำหนด</li>
            <li>จำเป็นต้องตรวจสอบข้อมูลหรือกิจกรรม</li>
            <li>เพื่อป้องกันความเสียหายต่อระบบหรือผู้ใช้รายอื่น</li>
            <li>ตามคำสั่งของหน่วยงานราชการหรือตามกฎหมาย</li>
          </ul>

          <h3>5.2 การยกเลิกบัญชี</h3>
          <p>เราอาจยกเลิกบัญชีของคุณถาวรในกรณีต่อไปนี้:</p>
          <ul>
            <li>ละเมิดข้อกำหนดการใช้งานอย่างร้ายแรง</li>
            <li>ใช้บริการเพื่อวัตถุประสงค์ผิดกฎหมาย</li>
            <li>ให้ข้อมูลเท็จในการลงทะเบียน</li>
            <li>ไม่มีการใช้งานบัญชีเป็นระยะเวลานาน</li>
            <li>ตามคำขอของผู้ใช้</li>
          </ul>

          <h3>5.3 กระบวนการแจ้งเตือน</h3>
          <p>ก่อนการระงับหรือยกเลิก เราจะ:</p>
          <ul>
            <li>แจ้งให้คุณทราบล่วงหน้า 7 วัน (หากเป็นไปได้)</li>
            <li>ส่งการแจ้งเตือนไปยังอีเมลที่ลงทะเบียนไว้</li>
            <li>ให้เหตุผลและหลักฐานในการดำเนินการ</li>
            <li>ให้โอกาสในการแก้ไขหรืออุทธรณ์</li>
          </ul>

          <h3>5.4 ผลของการระงับ/ยกเลิก</h3>
          <p>เมื่อบัญชีถูกระงับหรือยกเลิก:</p>
          <ul>
            <li>ไม่สามารถเข้าถึงบริการได้</li>
            <li>ข้อมูลและแคมเปญอาจถูกเก็บรักษาหรือลบ</li>
            <li>ไม่สามารถเรียกคืนข้อมูลหลังยกเลิกได้</li>
            <li>อาจมีค่าปรับหรือค่าธรรมเนียม</li>
          </ul>

          <p>สิทธิ์ในการอุทธรณ์: คุณมีสิทธิ์อุทธรณ์คำตัดสินภายใน 30 วันหลังจากได้รับแจ้ง</p>
        `
      },
      {
        title: '6. ข้อจำกัดความรับผิด',
        content: `
          <p>เรามุ่งมั่นในการให้บริการที่มีคุณภาพ แต่มีข้อจำกัดในการรับผิดชอบตามกฎหมาย</p>

          <h3>6.1 การให้บริการตามสภาพที่เป็นอยู่</h3>
          <p>บริการของเราให้ "ตามสภาพที่เป็นอยู่" และ "ตามที่มี" โดยไม่มีการรับประกันใด ๆ รวมถึง:</p>
          <ul>
            <li>การทำงานที่ไม่มีข้อผิดพลาดหรือไม่ขาดช่วง</li>
            <li>ความเหมาะสมสำหรับวัตถุประสงค์เฉพาะ</li>
            <li>ความปลอดภัยจากไวรัสหรือภัยคุกคามอื่น ๆ</li>
            <li>ความถูกต้องและความครบถ้วนของข้อมูล</li>
          </ul>

          <h3>6.2 ข้อจำกัดความรับผิด</h3>
          <p>เราจะไม่รับผิดชอบต่อ:</p>
          <ul>
            <li>ความเสียหายทางอ้อม พิเศษ หรือเป็นผลสืบเนื่อง</li>
            <li>การสูญเสียข้อมูล รายได้ หรือโอกาสทางธุรกิจ</li>
            <li>ความล่าช้าหรือการขัดข้องในการให้บริการ</li>
            <li>การกระทำของผู้ใช้รายอื่น</li>
            <li>ปัญหาจากบุคคลที่สามหรือพันธมิตร</li>
          </ul>

          <h3>6.3 ความรับผิดสูงสุด</h3>
          <p>ความรับผิดของเราจะไม่เกินจำนวนเงินที่คุณชำระให้เราในช่วง 12 เดือนก่อนเกิดเหตุการณ์</p>

          <h3>6.4 ข้อยกเว้น</h3>
          <p>ข้อจำกัดนี้ไม่ครอบคลุมถึง:</p>
          <ul>
            <li>ความเสียหายที่เกิดจากความประมาทเลินเล่อของเรา</li>
            <li>การละเมิดสัญญาที่จงใจ</li>
            <li>การฝ่าฝืนกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
            <li>ความเสียหายต่อชีวิต ร่างกาย หรือสุขภาพ</li>
          </ul>

          <p>ความยุติธรรม: ข้อจำกัดความรับผิดนี้เป็นไปตามกฎหมายและแนวปฏิบัติที่เป็นธรรม</p>
        `
      },
      {
        title: '7. ช่องทางติดต่อ',
        content: `
          <p>หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน สิทธิ์ในการใช้งาน หรือต้องการติดต่อเรา สามารถใช้ช่องทางต่อไปนี้:</p>

          <h4>อีเมล</h4>
          <p>legal@smsup-plus.com</p>
          <p>สำหรับเรื่องกฎหมายและข้อกำหนดการใช้งาน</p>

          <h4>โทรศัพท์</h4>
          <p>02-123-4567</p>
          <p>จันทร์-ศุกร์ 9:00-18:00 น.</p>

          <h4>ที่อยู่</h4>
          <p>123 ถนนสุขุมวิท แขวงคลองเตย</p>
          <p>เขตคลองเตย กรุงเทพมหานคร 10110</p>

          <p>เราจะตอบกลับคำขอของคุณภายใน 7 วันทำการ และอาจขอข้อมูลเพิ่มเติมเพื่อให้บริการที่ดีที่สุด</p>
        `
      },
      {
        title: '8. การเปลี่ยนแปลงข้อกำหนด',
        content: `
          <p>ข้อกำหนดการใช้งานนี้อาจมีการเปลี่ยนแปลงเพื่อให้สอดคล้องกับการพัฒนาบริการและกฎหมายที่เกี่ยวข้อง</p>

          <h3>8.1 การแจ้งเตือนการเปลี่ยนแปลง</h3>
          <p>เราจะแจ้งการเปลี่ยนแปลงที่สำคัญล่วงหน้า:</p>
          <ul>
            <li>แจ้งทางอีเมลถึงผู้ใช้ที่ลงทะเบียนไว้</li>
            <li>ประกาศในเว็บไซต์และแอปพลิเคชัน</li>
            <li>แสดงข้อความแจ้งเตือนในระบบ</li>
            <li>ให้เวลาปรับตัวอย่างน้อย 30 วัน</li>
          </ul>

          <h3>8.2 ผลของการเปลี่ยนแปลง</h3>
          <p>การใช้งานต่อหลังจากที่มีการเปลี่ยนแปลง ถือว่าคุณยอมรับข้อกำหนดใหม่ หากคุณไม่เห็นด้วย สามารถยกเลิกบัญชีได้ตามที่ระบุไว้</p>

          <h3>8.3 การตรวจสอบข้อกำหนด</h3>
          <p>เราขอแนะนำให้คุณตรวจสอบข้อกำหนดนี้เป็นประจำ โดยเฉพาะก่อนการใช้งานครั้งใหม่ ข้อกำหนดนี้มีผลบังคับใช้ตั้งแต่วันที่ ${lastUpdated}</p>

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

    container.appendChild(header);
    container.appendChild(trustSection);
    container.appendChild(summarySection);
    container.appendChild(content);

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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 no-print"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      <Navigation />

      <section ref={contentRef} className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                ข้อกำหนดการใช้งาน
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
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">📋 สรุปข้อสำคัญ</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• ต้องมีอายุอย่างน้อย 18 ปีในการใช้งาน</li>
                        <li>• ต้องใช้ข้อมูลจริงและถูกต้องในการสมัคร</li>
                        <li>• ห้ามใช้บริการเพื่อวัตถุประสงค์ผิดกฎหมาย</li>
                        <li>• บริษัทมีสิทธิ์ระงับบัญชีหากพบการละเมิด</li>
                        <li>• ข้อมูลส่วนบุคคลได้รับการปกป้องตามกฎหมาย PDPA</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <ScrollArea className="h-[400px] md:h-[600px] lg:h-[700px] pr-4">
                  {/* Overview Section */}
                  <section id="overview" className="mb-8" aria-labelledby="overview-heading">
                    <h2 id="overview-heading" className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <FileText className="h-6 w-6" />
                      <span>1. ภาพรวม</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        ยินดีต้อนรับสู่เว็บไซต์ SMSUP-PLUS ข้อกำหนดการใช้งานนี้ ("ข้อกำหนด") อธิบายถึงกฎและเงื่อนไขในการใช้บริการ SMS Marketing Platform ของเรา
                      </p>
                      <p className="mb-4">
                        การเข้าถึงหรือใช้งานเว็บไซต์และบริการของเราแสดงว่าคุณตกลงที่จะผูกพันตามข้อกำหนดเหล่านี้ หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ โปรดหยุดการใช้งานทันที
                      </p>
                      <p className="mb-4">
                        ข้อกำหนดนี้ใช้กับผู้ใช้ทุกประเภท รวมถึงบุคคลธรรมดาและนิติบุคคลที่ใช้บริการของเรา
                      </p>
                      <p>
                        กรุณาอ่านข้อกำหนดนี้อย่างละเอียดก่อนใช้งานบริการ เพื่อให้แน่ใจว่าคุณเข้าใจสิทธิ์และหน้าที่ของคุณ
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* User Account Section */}
                  <section id="user-account" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Users className="h-6 w-6" />
                      <span>2. ข้อมูลผู้ใช้และบัญชี</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <h3 className="text-lg font-semibold mb-2">2.1 การสมัครสมาชิก</h3>
                      <p className="mb-4">
                        เพื่อใช้บริการ คุณต้องสมัครสมาชิกและสร้างบัญชีผู้ใช้ โดยต้อง:
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>มีอายุอย่างน้อย 18 ปี</li>
                        <li>ใช้ข้อมูลจริงและถูกต้องในการสมัคร</li>
                        <li>สร้างรหัสผ่านที่ปลอดภัยและไม่ซ้ำกับบัญชีอื่น</li>
                        <li>ยอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว</li>
                        <li>ให้ข้อมูลติดต่อที่ถูกต้องสำหรับการยืนยันตัวตน</li>
                      </ul>

                      <h3 className="text-lg font-semibold mb-2">2.2 ความรับผิดชอบของผู้ใช้</h3>
                      <p className="mb-4">
                        คุณมีหน้าที่รักษาความลับของข้อมูลบัญชีและรหัสผ่าน หากพบการใช้งานที่ผิดปกติหรือสงสัยว่ามีการเข้าถึงโดยไม่ได้รับอนุญาต ต้องแจ้งให้เราทราบทันที
                      </p>
                      <p className="mb-4">
                        คุณต้องรับผิดชอบต่อการใช้งานบัญชีของคุณทั้งหมด รวมถึงกิจกรรมที่เกิดขึ้นภายใต้บัญชีของคุณ
                      </p>
                      <p>
                        ห้ามโอนหรือให้ผู้อื่นใช้งานบัญชีของคุณโดยไม่ได้รับอนุญาตจากเรา
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Copyright Section */}
                  <section id="copyright" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>3. ลิขสิทธิ์และทรัพย์สินทางปัญญา</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        เนื้อหา โลโก้ ซอฟต์แวร์ แอปพลิเคชัน และทรัพย์สินทางปัญญาอื่นๆ ในเว็บไซต์และบริการนี้เป็นทรัพย์สินของ SMSUP-PLUS หรือได้รับอนุญาตให้ใช้จากเจ้าของลิขสิทธิ์
                      </p>
                      <p className="mb-4">
                        คุณไม่สามารถคัดลอก ดัดแปลง แจกจ่าย เผยแพร่ หรือใช้เนื้อหาเหล่านี้เพื่อวัตถุประสงค์ทางการค้าโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากเรา
                      </p>
                      <p className="mb-4">
                        การใช้เครื่องหมายการค้า ชื่อทางการค้า หรือโลโก้ของเราโดยไม่ได้รับอนุญาตถือเป็นการละเมิดสิทธิ์ในทรัพย์สินทางปัญญา
                      </p>
                      <p>
                        เราสงวนสิทธิ์ในการดำเนินการทางกฎหมายกับผู้ที่ละเมิดสิทธิ์ในทรัพย์สินทางปัญญาของเรา
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Prohibited Activities Section */}
                  <section id="prohibited" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span>4. พฤติกรรมต้องห้าม</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">ห้ามใช้บริการเพื่อวัตถุประสงค์ต่อไปนี้:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>ส่ง SMS สแปม ขยะ หรือไม่พึงประสงค์</li>
                        <li>ส่งเนื้อหาที่ผิดกฎหมาย ลามก อนาจาร หรือมีเนื้อหาที่สร้างความเสียหาย</li>
                        <li>พยายามเจาะระบบ เข้าถึงข้อมูลโดยไม่ได้รับอนุญาต หรือทำลายระบบ</li>
                        <li>ใช้ข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
                        <li>ละเมิดสิทธิ์ของบุคคลที่สาม รวมถึงสิทธิ์ในทรัพย์สินทางปัญญา</li>
                        <li>ส่งไวรัส มัลแวร์ หรือโค้ดที่เป็นอันตราย</li>
                        <li>ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือไม่ชอบด้วยกฎหมาย</li>
                        <li>สร้างบัญชีปลอมหรือใช้ข้อมูลเท็จในการสมัคร</li>
                      </ul>
                      <p>
                        การละเมิดข้อห้ามเหล่านี้ถือเป็นการผิดสัญญาและอาจถูกดำเนินการทางกฎหมาย
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Termination Section */}
                  <section id="termination" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span>5. การระงับและปิดบัญชี</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        บริษัทมีสิทธิ์ระงับ ปิดใช้งาน หรือยกเลิกบัญชีผู้ใช้ได้ทุกเมื่อ หากพบการละเมิดข้อกำหนด โดยจะแจ้งให้ทราบล่วงหน้า 7 วัน ยกเว้นกรณีฉุกเฉินหรือการละเมิดที่ร้ายแรง
                      </p>
                      <p className="mb-4">
                        ผู้ใช้มีสิทธิ์ยกเลิกบัญชีได้ทุกเมื่อผ่านระบบหรือติดต่อฝ่ายบริการลูกค้า โดยจะได้รับการยืนยันการยกเลิกภายใน 24 ชั่วโมง
                      </p>
                      <p className="mb-4">
                        หลังจากยกเลิกบัญชี ข้อมูลส่วนบุคคลของคุณจะถูกเก็บรักษาหรือลบตามนโยบายความเป็นส่วนตัว ยกเว้นข้อมูลที่ต้องเก็บรักษาตามกฎหมาย
                      </p>
                      <p>
                        การยกเลิกบัญชีไม่กระทบต่อสิทธิ์ในการเรียกร้องความรับผิดชอบสำหรับการละเมิดที่เกิดขึ้นก่อนการยกเลิก
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Liability Section */}
                  <section id="liability" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>6. ข้อจำกัดความรับผิด</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        บริการนี้จัดทำขึ้น "ตามสภาพที่เป็นอยู่" และ "ตามที่มีอยู่" โดยไม่มีการรับประกันใดๆ รวมถึงแต่ไม่จำกัดเพียง การไม่มีข้อผิดพลาด การทำงานได้อย่างต่อเนื่อง ความเหมาะสมสำหรับวัตถุประสงค์เฉพาะ หรือความปลอดภัย
                      </p>
                      <p className="mb-4">
                        บริษัทจะไม่รับผิดชอบต่อความเสียหายทางตรง ทางอ้อม ผลกำไรที่สูญหาย ข้อมูลที่สูญหาย หรือความเสียหายอื่นใดที่เกิดจากการใช้บริการ ไม่ว่ากรณีใดๆ รวมถึงแต่ไม่จำกัดเพียง การหยุดชะงักของบริการ ความล้มเหลวทางเทคนิค หรือการสูญหายของข้อมูล
                      </p>
                      <p className="mb-4">
                        ความรับผิดทั้งหมดของบริษัทจะไม่เกินจำนวนเงินที่คุณชำระให้กับเราในช่วง 12 เดือนก่อนเกิดเหตุการณ์ที่ทำให้เกิดความเสียหาย
                      </p>
                      <p>
                        บางเขตอำนาจไม่อนุญาตให้มีการยกเว้นหรือจำกัดความรับผิดชอบ ดังนั้นข้อจำกัดข้างต้นอาจไม่ใช้บังคับกับคุณ
                      </p>
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
                      <p className="mb-4">หากมีคำถามหรือข้อสงสัยเกี่ยวกับข้อกำหนดนี้ สามารถติดต่อเราได้ที่:</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>บริษัท:</strong> SMSUP-PLUS CO., LTD.</p>
                        <p><strong>อีเมล:</strong> legal@smsup-plus.com</p>
                        <p><strong>โทรศัพท์:</strong> 02-123-4567</p>
                        <p><strong>เวลาทำการ:</strong> จันทร์-ศุกร์ 9:00-18:00 น. (ยกเว้นวันหยุดราชการ)</p>
                        <p><strong>ที่อยู่:</strong> 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</p>
                      </div>
                      <p className="mt-4">
                        เราจะพยายามตอบกลับคำถามของคุณภายใน 48 ชั่วโมงทำการ
                      </p>
                    </div>
                  </section>

                  <Separator className="my-8" />

                  {/* Changes Section */}
                  <section id="changes" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                      <Calendar className="h-6 w-6" />
                      <span>8. การเปลี่ยนแปลงข้อกำหนด</span>
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="mb-4">
                        บริษัทมีสิทธิ์แก้ไขข้อกำหนดนี้ได้ทุกเมื่อ โดยจะแจ้งให้ทราบล่วงหน้า 30 วัน ผ่านทางอีเมลที่ได้ลงทะเบียนไว้หรือประกาศในเว็บไซต์
                      </p>
                      <p className="mb-4">
                        การใช้งานต่อหลังจากที่มีการเปลี่ยนแปลง ถือว่าคุณยอมรับข้อกำหนดใหม่ หากคุณไม่เห็นด้วยกับการเปลี่ยนแปลง สามารถยกเลิกบัญชีได้ตามที่ระบุในข้อ 5
                      </p>
                      <p className="mb-4">
                        การแก้ไขข้อกำหนดจะมีผลบังคับใช้ตั้งแต่วันที่ระบุในประกาศ ยกเว้นกรณีที่มีการระบุวันที่มีผลบังคับใช้เป็นอย่างอื่น
                      </p>
                      <p>
                        ข้อกำหนดนี้มีผลบังคับใช้ตั้งแต่วันที่ {lastUpdated} และแทนที่ข้อกำหนดก่อนหน้านี้ทั้งหมด
                      </p>
                    </div>
                  </section>
                </ScrollArea>

                {/* Acceptance Section */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="accept-terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <Label htmlFor="accept-terms" className="text-sm">
                        ฉันได้อ่านและยอมรับ{" "}
                        <a href="/terms" className="text-primary hover:underline">
                          ข้อกำหนดการใช้งาน
                        </a>{" "}
                        และ{" "}
                        <a href="/privacy" className="text-primary hover:underline">
                          นโยบายความเป็นส่วนตัว
                        </a>
                      </Label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        className="flex-1"
                        disabled={!acceptTerms}
                        onClick={() => {
                          if (acceptTerms) {
                            alert('ขอบคุณที่ยอมรับข้อกำหนด! คุณสามารถใช้งานบริการได้แล้ว');
                          }
                        }}
                      >
                        ยอมรับและดำเนินการต่อ
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <a href="/">กลับหน้าหลัก</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
