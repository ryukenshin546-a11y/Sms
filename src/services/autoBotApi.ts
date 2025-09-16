// Auto-Bot API Integration
// เชื่อมต่อกับ Express API Server ที่รัน Puppeteer Script

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

// เรียก Auto-Bot Generation API
export const runAutoBotGeneration = async (
  onProgress?: (step: string, progress: number) => void
): Promise<AutoBotResponse> => {
  try {
    // Update progress: เริ่มต้นกระบวนการ
    if (onProgress) onProgress('เริ่มต้นเชื่อมต่อ API Server...', 10);

    const response = await fetch('http://localhost:3001/api/auto-bot/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    // Update progress: เชื่อมต่อ API สำเร็จ
    if (onProgress) onProgress('เชื่อมต่อ API Server สำเร็จ, กำลังรัน Auto-Bot...', 20);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // Update progress: รับผลลัพธ์จาก API
    if (onProgress) onProgress('รับผลลัพธ์จาก Auto-Bot...', 90);

    if (result.success && result.data) {
      // Update progress: สำเร็จ
      if (onProgress) onProgress('Auto-Bot Generation สำเร็จ!', 100);
      
      return {
        success: true,
        data: {
          accountName: result.data.accountName,
          username: result.data.username,
          email: result.data.email,
          password: result.data.password
        }
      };
    } else {
      throw new Error(result.error || 'Auto-Bot generation failed');
    }

  } catch (error) {
    console.error('Auto-Bot API Error:', error);
    
    // Update progress: เกิดข้อผิดพลาด
    if (onProgress) onProgress('Auto-Bot Generation ล้มเหลว', 0);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};