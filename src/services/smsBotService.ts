// SMS Auto-Bot Service - เชื่อมต่อกับ Auto-Bot Puppeteer Script
import { runAutoBotGeneration, AutoBotResponse } from './autoBotApi';

// Generated Account Interface
export interface GeneratedAccount {
  accountName: string;
  username: string;
  email: string;
  password: string;
}

// SMS Bot Service - Main Export Function
export const generateSMSAccount = async (
  onProgress?: (step: string, progress: number) => void
): Promise<GeneratedAccount> => {
  const result = await runAutoBotGeneration(onProgress);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Auto-Bot generation failed');
  }
  
  return result.data;
};

// Legacy SMS Bot Client (kept for reference, not used)
export interface SMSBotClient {
  generateAccount(): Promise<GeneratedAccount>;
}

class LegacySMSBotClient {
  // This is the old implementation, not used anymore
  // New implementation uses runAutoBotGeneration from autoBotApi
}

// Legacy code for reference (เก็บไว้อ้างอิง)
export interface BotConfig {
  headless: boolean;
  timeout: number;
  retryAttempts: number;
  baseUrl: string;
  selectors: {
    loginForm: {
      username: string;
      password: string;
      submitButton: string;
    };
    accountManagement: {
      usersTab: string;
      createUserButton: string;
      userForm: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        saveButton: string;
      };
      confirmDialog: {
        okButton: string;
      };
    };
  };
}

export interface UserGenerationData {
  username: string;
  email: string;
  password: string;
  originalEmail: string;
}

// Bot Configuration สำหรับเว็บไซต์จริง https://web.smsup-plus.com
export const botConfig: BotConfig = {
  headless: false, // เปิดเบราว์เซอร์ให้เห็นการทำงาน
  timeout: 30000,
  retryAttempts: 3,
  baseUrl: 'https://web.smsup-plus.com',
  selectors: {
    loginForm: {
      username: 'input[type="text"]',
      password: 'input[type="password"]',
      submitButton: 'button[type="submit"]'
    },
    accountManagement: {
      usersTab: 'div[role="tab"]:contains("USERS")',
      createUserButton: 'button.ant-btn.ant-btn-primary .fa-plus-circle',
      userForm: {
        username: 'input[placeholder="Username"]',
        email: 'input[placeholder="Email"]',
        password: 'input[placeholder="Password"]',
        confirmPassword: 'input[placeholder="Re-type Password"]',
        saveButton: 'button.ant-btn.ant-btn-primary .fa-plus-circle'
      },
      confirmDialog: {
        okButton: 'button.ant-btn.ant-btn-primary:contains("OK")'
      }
    }
  }
};

// User Data Generation Strategy สำหรับ Sub Account
export const generateUserData = async (userId: string, userInfo: any): Promise<UserGenerationData> => {
  // Generate secure password
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
  
  const baseUsername = `test${Math.floor(Math.random() * 1000)}`;
  
  return {
    username: baseUsername,
    email: `${baseUsername}@gmail.com`,
    password: generateSecurePassword(),
    originalEmail: userInfo.email
  };
};

// Secure Password Generation
export const generateSecurePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$';
  let password = '@Test';
  
  for (let i = 0; i < 4; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

// SMS Bot Client Class สำหรับควบคุมเบราว์เซอร์จริง
export class SMSBotClient {
  private config: BotConfig;
  private browser: any = null;
  private page: any = null;
  private isLoggedIn: boolean = false;
  
  constructor(config: BotConfig = botConfig) {
    this.config = config;
  }
  
  // Initialize Browser Session
  async initBrowser(): Promise<void> {
    try {
      console.log('🤖 Bot: เริ่มต้นเบราว์เซอร์...');
      
      // ใน Production จะใช้ Puppeteer จริง
      // const puppeteer = require('puppeteer');
      // this.browser = await puppeteer.launch({
      //   headless: this.config.headless,
      //   defaultViewport: { width: 1366, height: 768 }
      // });
      // this.page = await this.browser.newPage();
      
      // สำหรับ Demo ใช้ simulation
      await this.simulateDelay(2000);
      console.log('🤖 Bot: เบราว์เซอร์พร้อมใช้งาน');
      
    } catch (error) {
      console.error('🤖 Bot: เริ่มต้นเบราว์เซอร์ล้มเหลว:', error);
      throw new Error('Browser Initialization Failed');
    }
  }
  
  // Auto Login to https://web.smsup-plus.com/login
  async login(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      console.log('🤖 Bot: เริ่มต้น login process...');
      console.log('🤖 Bot: เข้าสู่หน้า https://web.smsup-plus.com/login');
      
      // await this.page.goto(`${this.config.baseUrl}/login`);
      // await this.page.waitForSelector(this.config.selectors.loginForm.username);
      
      await this.simulateDelay(2000);
      
      console.log('🤖 Bot: กรอก username และ password...');
      // await this.page.type(this.config.selectors.loginForm.username, credentials.username);
      // await this.page.type(this.config.selectors.loginForm.password, credentials.password);
      // await this.page.click(this.config.selectors.loginForm.submitButton);
      
      await this.simulateDelay(3000);
      
      console.log('🤖 Bot: Login สำเร็จ');
      this.isLoggedIn = true;
      return true;
      
    } catch (error) {
      console.error('🤖 Bot: Login ล้มเหลว:', error);
      throw new Error('Authentication Failed');
    }
  }
  
  // Navigate to https://web.smsup-plus.com/accountmanagement
  async navigateToAccountManagement(): Promise<void> {
    if (!this.isLoggedIn) {
      throw new Error('Bot not logged in');
    }
    
    try {
      console.log('🤖 Bot: นำทางไปหน้า https://web.smsup-plus.com/accountmanagement');
      
      // await this.page.goto(`${this.config.baseUrl}/accountmanagement`);
      // await this.page.waitForSelector(this.config.selectors.accountManagement.usersTab);
      
      await this.simulateDelay(2000);
      console.log('🤖 Bot: เข้าถึงหน้า Account Management สำเร็จ');
      
    } catch (error) {
      console.error('🤖 Bot: Navigation ล้มเหลว:', error);
      throw new Error('Navigation Failed');
    }
  }
  
  // Click USERS tab: <div role="tab" aria-disabled="false" aria-selected="false" class=" ant-tabs-tab">USERS</div>
  async clickUsersTab(): Promise<void> {
    try {
      console.log('🤖 Bot: คลิกแท็บ USERS...');
      
      // await this.page.click(this.config.selectors.accountManagement.usersTab);
      // await this.page.waitForSelector(this.config.selectors.accountManagement.createUserButton);
      
      await this.simulateDelay(1500);
      console.log('🤖 Bot: แท็บ USERS เปิดสำเร็จ');
      
    } catch (error) {
      console.error('🤖 Bot: Click USERS tab ล้มเหลว:', error);
      throw new Error('Tab Click Failed');
    }
  }
  
  // Click Create User button และกรอกข้อมูล
  async createNewUser(userData: UserGenerationData): Promise<UserGenerationData> {
    try {
      console.log('🤖 Bot: เริ่มสร้างผู้ใช้ใหม่...');
      
      // Click Create User button
      console.log('🤖 Bot: คลิกปุ่ม Create User...');
      // await this.page.click(this.config.selectors.accountManagement.createUserButton);
      // await this.page.waitForSelector(this.config.selectors.accountManagement.userForm.username);
      
      await this.simulateDelay(2000);
      
      // Fill user form ตามข้อมูลที่กำหนด
      console.log('🤖 Bot: กรอกข้อมูลในฟอร์ม...');
      console.log(`   - Username: ${userData.username}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Password: ${userData.password}`);
      
      // await this.page.type(this.config.selectors.accountManagement.userForm.username, userData.username);
      // await this.page.type(this.config.selectors.accountManagement.userForm.email, userData.email);
      // await this.page.type(this.config.selectors.accountManagement.userForm.password, userData.password);
      // await this.page.type(this.config.selectors.accountManagement.userForm.confirmPassword, userData.password);
      
      await this.simulateDelay(2000);
      
      // Click Save button
      console.log('🤖 Bot: คลิกปุ่ม Save...');
      // await this.page.click(this.config.selectors.accountManagement.userForm.saveButton);
      
      await this.simulateDelay(2000);
      
      // Handle confirmation dialog
      console.log('🤖 Bot: กดปุ่ม OK ในแจ้งเตือน...');
      // await this.page.waitForSelector(this.config.selectors.accountManagement.confirmDialog.okButton);
      // await this.page.click(this.config.selectors.accountManagement.confirmDialog.okButton);
      
      await this.simulateDelay(2000);
      
      console.log('🤖 Bot: สร้างผู้ใช้ใหม่สำเร็จ!');
      return userData;
      
    } catch (error) {
      console.error('🤖 Bot: User creation ล้มเหลว:', error);
      throw new Error('User Creation Failed');
    }
  }
  
  // Close browser session
  async closeBrowser(): Promise<void> {
    try {
      if (this.browser) {
        // await this.browser.close();
        console.log('🤖 Bot: ปิดเบราว์เซอร์เรียบร้อย');
      }
    } catch (error) {
      console.error('🤖 Bot: ปิดเบราว์เซอร์ล้มเหลว:', error);
    }
  }
  
  // Simulate delay for realistic bot behavior
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main Bot Process Function สำหรับเว็บไซต์จริง (Legacy - Not Used)
export const generateSMSAccountLegacy = async (
  userId: string, 
  userInfo: any,
  onProgress?: (step: string, progress: number) => void
): Promise<UserGenerationData> => {
  let bot: SMSBotClient | null = null;
  
  try {
    // Update UI to loading state
    onProgress?.('เริ่มต้นกระบวนการ Auto-Bot', 0);
    
    // Check environment mode
    const isProduction = import.meta.env.VITE_BOT_MODE === 'production';
    
    if (isProduction) {
      console.log('🤖 Production Mode: ใช้ Puppeteer จริง');
      // TODO: ใช้ PuppeteerSMSBot สำหรับ production
      // const { createPuppeteerBot } = await import('./puppeteerBot');
      // const puppeteerBot = createPuppeteerBot(botConfig);
      // ... implement real Puppeteer flow
    } else {
      console.log('🤖 Development Mode: ใช้ Simulation');
    }
    
    // Initialize Bot Session (Simulation for now)
    bot = new SMSBotClient();
    await bot.initBrowser();
    onProgress?.('เตรียม Browser Session', 5);
    
    // Auto Login to https://web.smsup-plus.com/login
    await bot.login({
      username: import.meta.env.VITE_SMS_ADMIN_USERNAME || 'Landingpage',
      password: import.meta.env.VITE_SMS_ADMIN_PASSWORD || '@Atoz123'
    });
    onProgress?.('Login สำเร็จ', 25);
    
    // Navigate to https://web.smsup-plus.com/accountmanagement
    await bot.navigateToAccountManagement();
    onProgress?.('เข้าถึงหน้า Account Management', 40);
    
    // Click USERS tab: <div role="tab" class="ant-tabs-tab">USERS</div>
    await bot.clickUsersTab();
    onProgress?.('เปิดแท็บ USERS', 55);
    
    // Generate user data ตามข้อมูลทดสอบที่กำหนด
    const userData = await generateUserData(userId, userInfo);
    onProgress?.('สร้างข้อมูลทดสอบ', 65);
    
    console.log('🎯 ข้อมูลที่จะกรอกในฟอร์ม:');
    console.log(`   Username: ${userData.username}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    
    // Create new user บนเว็บไซต์จริง
    const createdUser = await bot.createNewUser(userData);
    onProgress?.('สร้างบัญชีสำเร็จ', 85);
    
    // Store credentials in database (simulated)
    await saveUserCredentials(userId, createdUser);
    onProgress?.('บันทึกข้อมูลสำเร็จ', 95);
    
    // Close browser
    await bot.closeBrowser();
    onProgress?.('Auto-Bot เสร็จสิ้น', 100);
    
    return createdUser;
    
  } catch (error) {
    console.error('🚫 SMS Account Generation ล้มเหลว:', error);
    
    // Clean up browser session
    if (bot) {
      await bot.closeBrowser();
    }
    
    throw error;
  }
};

// Save user credentials (จะถูกแทนที่ด้วย real database ในโปรดักชั่น)
const saveUserCredentials = async (userId: string, userData: UserGenerationData): Promise<void> => {
  console.log('💾 บันทึกข้อมูล credentials ลงฐานข้อมูล...');
  console.log(`   - User ID: ${userId}`);
  console.log(`   - Username: ${userData.username}`);
  console.log(`   - Email: ${userData.email}`);
  
  // Simulate database save
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✅ บันทึกข้อมูลสำเร็จ');
};
