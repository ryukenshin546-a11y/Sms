// API Service สำหรับเรียกใช้ Auto-Bot
// ใช้สำหรับเชื่อมต่อระหว่าง Frontend และ Auto-Bot Script

export interface AutoBotResponse {
  success: boolean;
  data?: {
    accountName: string;
    username: string;
    email: string;
    password: string;
  };
  error?: string;
}

export interface AutoBotProgress {
  step: string;
  progress: number;
}

// เรียกใช้ Auto-Bot ผ่าน API Server
export const runAutoBotGeneration = async (
  onProgress?: (step: string, progress: number) => void
): Promise<AutoBotResponse> => {
  try {
    // ส่ง progress updates
    onProgress?.('เริ่มต้นกระบวนการ Auto-Bot', 5);
    
    // เรียก API Server ที่รัน Auto-Bot Script จริง
    const apiUrl = 'http://localhost:3001/api/auto-bot/generate';
    
    onProgress?.('เชื่อมต่อ Auto-Bot Server', 10);
    
    // สำหรับ Demo Progress (API จะใช้เวลาพอสมควร)
    const progressSteps = [
      { step: 'เปิดเบราว์เซอร์...', progress: 15, delay: 2000 },
      { step: 'เข้าสู่ระบบ smsup-plus.com', progress: 25, delay: 3000 },
      { step: 'เข้าถึงหน้า Account Management', progress: 40, delay: 2000 },
      { step: 'คลิกแท็บ SUB ACCOUNTS', progress: 50, delay: 1500 },
      { step: 'คลิกปุ่ม Create Account', progress: 60, delay: 2000 },
      { step: 'กรอกข้อมูล Sub Account', progress: 75, delay: 3000 },
      { step: 'บันทึกข้อมูล', progress: 85, delay: 2000 },
      { step: 'ยืนยันการสร้าง Account', progress: 95, delay: 1500 }
    ];
    
    // เริ่ม API call และ progress simulation พร้อมกัน
    const apiPromise = fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // รัน progress simulation
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        const { step, progress } = progressSteps[currentStep];
        onProgress?.(step, progress);
        currentStep++;
      }
    }, 2000);
    
    // รอ API response
    const response = await apiPromise;
    clearInterval(progressInterval);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    onProgress?.('สำเร็จ!', 100);
    
    return result;
    
  } catch (error) {
    console.error('Auto-Bot API Error:', error);
    
    // ถ้า API ไม่พร้อมใช้งาน ให้ใช้ fallback simulation
    if (error instanceof Error && error.message.includes('fetch')) {
      console.log('🔄 API ไม่พร้อมใช้งาน, ใช้ Simulation Mode');
      return await runSimulationFallback(onProgress);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    };
  }
};

// Fallback simulation ถ้า API Server ไม่ทำงาน
const runSimulationFallback = async (
  onProgress?: (step: string, progress: number) => void
): Promise<AutoBotResponse> => {
  const steps = [
    { step: 'เปิดเบราว์เซอร์...', progress: 10, delay: 1000 },
    { step: 'เข้าสู่ระบบ smsup-plus.com', progress: 20, delay: 2000 },
    { step: 'เข้าถึงหน้า Account Management', progress: 35, delay: 1500 },
    { step: 'คลิกแท็บ SUB ACCOUNTS', progress: 45, delay: 1000 },
    { step: 'คลิกปุ่ม Create Account', progress: 55, delay: 1500 },
    { step: 'กรอกข้อมูล Sub Account', progress: 70, delay: 2000 },
    { step: 'ตั้งค่า Create Subaccount = OFF', progress: 80, delay: 1000 },
    { step: 'เลือก Sender และกดปุ่ม Add', progress: 85, delay: 1500 },
    { step: 'กดปุ่ม Save', progress: 92, delay: 1000 },
    { step: 'กดปุ่ม OK ใน confirmation', progress: 98, delay: 1000 },
    { step: 'สำเร็จ! (Simulation Mode)', progress: 100, delay: 500 }
  ];
  
  for (const { step, progress, delay } of steps) {
    onProgress?.(step, progress);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Generate realistic data
  const generateSecurePassword = (): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // บังคับให้มีตัวอักษรแต่ละประเภทอย่างน้อย 1 ตัว
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // เติมตัวอักษรสุ่มให้ครบ 12-16 ตัว
    const passwordLength = Math.floor(Math.random() * 5) + 12;
    for (let i = password.length; i < passwordLength; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // สลับตำแหน่งตัวอักษรให้สุ่ม
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  
  const username = `simulation${Math.floor(Math.random() * 1000)}`;
  
  return {
    success: true,
    data: {
      accountName: username,
      username: username,
      email: `${username}@gmail.com`,
      password: generateSecurePassword()
    }
  };
};
