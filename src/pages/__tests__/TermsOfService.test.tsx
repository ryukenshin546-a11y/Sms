import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TermsOfService from '../TermsOfService';
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

describe('TermsOfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<TermsOfService />);

    // Check main heading
    expect(screen.getByRole('heading', { name: 'ข้อกำหนดการใช้งาน' })).toBeInTheDocument();
    expect(screen.getByText('เว็บไซต์ smsup-plus')).toBeInTheDocument();

    // Check navigation and footer are rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Check skip link for accessibility
    expect(screen.getByText('ข้ามไปยังเนื้อหาหลัก')).toBeInTheDocument();
  });

  it('displays all navigation sections', () => {
    render(<TermsOfService />);

    const sections = [
      'ภาพรวม',
      'ข้อมูลผู้ใช้และบัญชี',
      'ลิขสิทธิ์และทรัพย์สินทางปัญญา',
      'พฤติกรรมต้องห้าม',
      'การระงับและปิดบัญชี',
      'ข้อจำกัดความรับผิด',
      'ช่องทางติดต่อ',
      'การเปลี่ยนแปลงข้อกำหนด'
    ];

    sections.forEach(section => {
      const elements = screen.getAllByText(section);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('shows mobile navigation on small screens', () => {
    render(<TermsOfService />);

    // Check if mobile navigation exists - look for the heading in mobile nav
    const mobileNavCards = screen.getAllByRole('heading', { name: 'สารบัญ' });
    expect(mobileNavCards.length).toBeGreaterThan(0);
  });

  it('displays summary information', () => {
    render(<TermsOfService />);

    expect(screen.getByText('📋 สรุปข้อสำคัญ')).toBeInTheDocument();
    expect(screen.getByText(/ต้องมีอายุอย่างน้อย 18 ปี/)).toBeInTheDocument();
    expect(screen.getByText(/ต้องใช้ข้อมูลจริงและถูกต้อง/)).toBeInTheDocument();
    expect(screen.getByText(/ห้ามใช้บริการเพื่อวัตถุประสงค์ผิดกฎหมาย/)).toBeInTheDocument();
  });

  it('renders all content sections', () => {
    render(<TermsOfService />);

    // Check section headings
    expect(screen.getByText('1. ภาพรวม')).toBeInTheDocument();
    expect(screen.getByText('2. ข้อมูลผู้ใช้และบัญชี')).toBeInTheDocument();
    expect(screen.getByText('3. ลิขสิทธิ์และทรัพย์สินทางปัญญา')).toBeInTheDocument();
    expect(screen.getByText('4. พฤติกรรมต้องห้าม')).toBeInTheDocument();
    expect(screen.getByText('5. การระงับและปิดบัญชี')).toBeInTheDocument();
    expect(screen.getByText('6. ข้อจำกัดความรับผิด')).toBeInTheDocument();
    expect(screen.getByText('7. ช่องทางติดต่อ')).toBeInTheDocument();
    expect(screen.getByText('8. การเปลี่ยนแปลงข้อกำหนด')).toBeInTheDocument();
  });

  it('handles section navigation', async () => {
    const user = userEvent.setup();
    render(<TermsOfService />);

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

  it('handles checkbox state changes', async () => {
    const user = userEvent.setup();
    render(<TermsOfService />);

    const checkbox = screen.getByRole('checkbox', { name: /ฉันได้อ่านและยอมรับ/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('enables accept button when terms are accepted', async () => {
    const user = userEvent.setup();
    render(<TermsOfService />);

    const checkbox = screen.getByRole('checkbox', { name: /ฉันได้อ่านและยอมรับ/ });
    const acceptButton = screen.getByText('ยอมรับและดำเนินการต่อ');

    // Button should be disabled initially
    expect(acceptButton).toBeDisabled();

    // Check the checkbox
    await user.click(checkbox);

    // Button should now be enabled
    expect(acceptButton).toBeEnabled();
  });

  it('handles download PDF button click', async () => {
    const user = userEvent.setup();
    const mockGeneratePDF = vi.mocked(generateLegalDocumentPDF);

    render(<TermsOfService />);

    const downloadButton = screen.getByRole('button', { name: /ดาวน์โหลด PDF/i });
    await user.click(downloadButton);

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(mockGeneratePDF).toHaveBeenCalledWith(
      expect.any(Object),
      'terms',
      '12 กันยายน 2025'
    );
  });

  it('handles print button click', async () => {
    const user = userEvent.setup();
    render(<TermsOfService />);

    const printButton = screen.getByRole('button', { name: /พิมพ์เอกสาร/ });
    await user.click(printButton);

    expect(mockPrint).toHaveBeenCalled();
  });

  it('displays contact information correctly', () => {
    render(<TermsOfService />);

    expect(screen.getByText('SMSUP-PLUS CO., LTD.')).toBeInTheDocument();
    expect(screen.getByText('legal@smsup-plus.com')).toBeInTheDocument();
    expect(screen.getByText('02-123-4567')).toBeInTheDocument();
    expect(screen.getByText('123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110')).toBeInTheDocument();
  });

  it('displays last updated date', () => {
    render(<TermsOfService />);

    expect(screen.getByText('อัปเดตล่าสุด: 12 กันยายน 2025')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<TermsOfService />);

    // Check skip link
    const skipLink = screen.getByText('ข้ามไปยังเนื้อหาหลัก');
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Check main content has id
    const mainContent = screen.getByText(/ยินดีต้อนรับสู่เว็บไซต์/);
    expect(mainContent).toBeInTheDocument();
  });

  it('renders action buttons in header', () => {
    render(<TermsOfService />);

    expect(screen.getByText('ดาวน์โหลด PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /พิมพ์เอกสาร/ })).toBeInTheDocument();
  });

  it('handles accept button click with alert', async () => {
    const user = userEvent.setup();
    render(<TermsOfService />);

    const checkbox = screen.getByRole('checkbox', { name: /ฉันได้อ่านและยอมรับ/ });
    const acceptButton = screen.getByText('ยอมรับและดำเนินการต่อ');

    // Check terms first
    await user.click(checkbox);

    // Click accept button
    await user.click(acceptButton);

    expect(mockAlert).toHaveBeenCalledWith('ขอบคุณที่ยอมรับข้อกำหนด! คุณสามารถใช้งานบริการได้แล้ว');
  });
});
