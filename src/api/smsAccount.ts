// SMS Account Generation API endpoints

export interface SMSAccountCredentials {
  username: string;
  email: string;
  password: string;
  originalEmail: string;
  createdAt: string;
}

export interface GenerationStatus {
  status: 'not-generated' | 'generating' | 'generated' | 'error';
  progress?: number;
  currentStep?: string;
  credentials?: SMSAccountCredentials;
  error?: string;
}

// Mock API functions - จะถูกแทนที่ด้วย real API calls ในโปรดักชั่น
export const smsAccountAPI = {
  // เริ่มต้น process สร้าง SMS account
  async generateAccount(userId: string): Promise<{ jobId: string }> {
    const jobId = `job_${userId}_${Date.now()}`;
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ jobId });
      }, 500);
    });
  },

  // ตรวจสอบสถานะการสร้าง account
  async getGenerationStatus(jobId: string): Promise<GenerationStatus> {
    // Simulate different stages of generation
    const progress = Math.random();
    
    if (progress < 0.3) {
      return {
        status: 'generating',
        progress: 30,
        currentStep: 'เชื่อมต่อระบบ SMS'
      };
    } else if (progress < 0.6) {
      return {
        status: 'generating',
        progress: 60,
        currentStep: 'สร้างบัญชีผู้ใช้'
      };
    } else if (progress < 0.9) {
      return {
        status: 'generating',
        progress: 90,
        currentStep: 'ตั้งค่าบัญชี'
      };
    } else {
      return {
        status: 'generated',
        progress: 100,
        currentStep: 'เสร็จสิ้น',
        credentials: {
          username: 'test123',
          email: 'test123@gmail.com',
          password: '@Test1234',
          originalEmail: 'user@example.com',
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  // ดึงข้อมูล SMS account ที่มีอยู่
  async getSMSAccount(userId: string): Promise<GenerationStatus> {
    // Simulate checking existing account
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: บางครั้งมีบัญชีอยู่แล้ว บางครั้งไม่มี
        const hasAccount = Math.random() > 0.5;
        
        if (hasAccount) {
          resolve({
            status: 'generated',
            credentials: {
              username: 'existing_user123',
              email: 'existing@gmail.com',
              password: '@ExistingPass123',
              originalEmail: 'user@example.com',
              createdAt: '2023-01-01T00:00:00.000Z'
            }
          });
        } else {
          resolve({
            status: 'not-generated'
          });
        }
      }, 300);
    });
  },

  // รีเซ็ท SMS account
  async resetSMSAccount(userId: string): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};
