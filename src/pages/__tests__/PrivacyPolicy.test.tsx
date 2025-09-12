import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivacyPolicy from '../PrivacyPolicy';
import { generateLegalDocumentPDF } from '@/lib/pdfGenerator';

// Mock window methods
const mockOpen = vi.fn();
const mockPrint = vi.fn();
const mockAlert = vi.fn();

Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
});

Object.defineProperty(window, 'print', {
  writable: true,
  value: mockPrint,
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert,
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock PDF generator
vi.mock('@/lib/pdfGenerator', () => ({
  generateLegalDocumentPDF: vi.fn(),
}));

// Mock Navigation and Footer components
vi.mock('@/components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<PrivacyPolicy />);

    // Check main heading
    expect(screen.getByText('นโยบายความเป็นส่วนตัว')).toBeInTheDocument();
    expect(screen.getByText('เว็บไซต์ smsup-plus')).toBeInTheDocument();

    // Check navigation and footer are rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Check skip link for accessibility
    expect(screen.getByText('ข้ามไปยังเนื้อหาหลัก')).toBeInTheDocument();
  });

  it('displays trust indicators', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('🔒 ข้อมูลของคุณปลอดภัย')).toBeInTheDocument();
    expect(screen.getByText('PDPA Compliant')).toBeInTheDocument();
    expect(screen.getByText('SSL Encrypted')).toBeInTheDocument();
    expect(screen.getByText('Regular Audits')).toBeInTheDocument();
  });

  it('displays all navigation sections', () => {
    render(<PrivacyPolicy />);

    const sections = [
      'ภาพรวม',
      'ข้อมูลที่เราเก็บ',
      'วิธีการใช้ข้อมูล',
      'การแบ่งปันข้อมูล',
      'การใช้ Cookies',
      'สิทธิ์ของผู้ใช้',
      'ช่องทางติดต่อ',
      'การเปลี่ยนแปลงนโยบาย'
    ];

    sections.forEach(section => {
      const elements = screen.getAllByText(section);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('renders all content sections', () => {
    render(<PrivacyPolicy />);

    // Check section headings
    expect(screen.getByText('1. ภาพรวม')).toBeInTheDocument();
    expect(screen.getByText('2. ข้อมูลที่เราเก็บ')).toBeInTheDocument();
    expect(screen.getByText('3. วิธีการใช้ข้อมูล')).toBeInTheDocument();
    expect(screen.getByText('4. การแบ่งปันข้อมูล')).toBeInTheDocument();
    expect(screen.getByText('5. การใช้ Cookies')).toBeInTheDocument();
    expect(screen.getByText('6. สิทธิ์ของผู้ใช้')).toBeInTheDocument();
    expect(screen.getByText('7. ช่องทางติดต่อ')).toBeInTheDocument();
    expect(screen.getByText('8. การเปลี่ยนแปลงนโยบาย')).toBeInTheDocument();
  });

  it('handles section navigation', async () => {
    const user = userEvent.setup();
    render(<PrivacyPolicy />);

    // Find navigation buttons - look for buttons with specific aria-label
    const overviewButtons = screen.getAllByRole('button', { name: 'ไปยังส่วน ภาพรวม' });
    const overviewButton = overviewButtons[0]; // Get the first one (mobile nav)
    await user.click(overviewButton);

    // Check if scrollIntoView was called
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('handles download PDF button click', async () => {
    const user = userEvent.setup();
    const mockGeneratePDF = vi.mocked(generateLegalDocumentPDF);

    render(<PrivacyPolicy />);

    const downloadButton = screen.getByRole('button', { name: /ดาวน์โหลด PDF/i });
    await user.click(downloadButton);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(mockGeneratePDF).toHaveBeenCalledWith(
      expect.any(Object),
      'privacy',
      '12 กันยายน 2025'
    );
  });

  it('handles print button click', async () => {
    const user = userEvent.setup();
    render(<PrivacyPolicy />);

    const printButton = screen.getByRole('button', { name: /พิมพ์เอกสาร/ });
    await user.click(printButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  it('displays contact information correctly', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('privacy@smsup-plus.com')).toBeInTheDocument();
    expect(screen.getByText('02-123-4567')).toBeInTheDocument();
  });

  it('displays last updated date', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('อัปเดตล่าสุด: 12 กันยายน 2025')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('❓ คำถามที่พบบ่อย')).toBeInTheDocument();
    expect(screen.getByText('ข้อมูลของฉันปลอดภัยแค่ไหน?')).toBeInTheDocument();
    expect(screen.getByText('ฉันสามารถขอให้ลบข้อมูลได้หรือไม่?')).toBeInTheDocument();
    expect(screen.getByText('ข้อมูลของฉันถูกใช้เพื่ออะไรบ้าง?')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<PrivacyPolicy />);

    // Check skip link
    const skipLink = screen.getByText('ข้ามไปยังเนื้อหาหลัก');
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Check main content has id
    const mainContent = screen.getByRole('heading', { name: 'นโยบายความเป็นส่วนตัว' });
    expect(mainContent).toBeInTheDocument();
  });

  it('renders action buttons in header', () => {
    render(<PrivacyPolicy />);

    // Check download PDF button
    const downloadButton = screen.getByRole('button', { name: /ดาวน์โหลด PDF/i });
    expect(downloadButton).toBeInTheDocument();

    // Check print button
    const printButton = screen.getByRole('button', { name: /พิมพ์เอกสาร/i });
    expect(printButton).toBeInTheDocument();
  });

  it('displays user rights information', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('สิทธิ์ในการเข้าถึง')).toBeInTheDocument();
    expect(screen.getByText('สิทธิ์ในการแก้ไข')).toBeInTheDocument();
    expect(screen.getByText('สิทธิ์ในการลบ')).toBeInTheDocument();
    expect(screen.getByText('สิทธิ์ในการปฏิเสธ')).toBeInTheDocument();
  });

  it('displays data usage categories', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('🎯 บริการหลัก')).toBeInTheDocument();
    expect(screen.getByText('📊 ปรับปรุงและพัฒนาบริการ')).toBeInTheDocument();
    expect(screen.getByText('📧 การสื่อสาร')).toBeInTheDocument();
    expect(screen.getByText('⚖️ การปฏิบัติตามกฎหมาย')).toBeInTheDocument();
  });

  it('displays data collection categories', () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText('2.1 ข้อมูลที่คุณให้เราโดยตรง')).toBeInTheDocument();
    expect(screen.getByText('2.2 ข้อมูลที่เราเก็บรวบรวมโดยอัตโนมัติ')).toBeInTheDocument();
    expect(screen.getByText('2.3 ข้อมูลจากแหล่งอื่น')).toBeInTheDocument();
  });

  it('shows mobile navigation on small screens', () => {
    render(<PrivacyPolicy />);

    // Check if mobile navigation exists - look for the heading in mobile nav
    const mobileNavCards = screen.getAllByRole('heading', { name: 'สารบัญ' });
    expect(mobileNavCards.length).toBeGreaterThan(0);
  });
});
