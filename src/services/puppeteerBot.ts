// Puppeteer Bot Service สำหรับการทำงานจริงบนเว็บไซต์ https://web.smsup-plus.com
// ไฟล์นี้ใช้เมื่อต้องการรัน Auto-Bot จริงใน Production Environment

import puppeteer from 'puppeteer';
import type { BotConfig, UserGenerationData } from './smsBotService';

export class PuppeteerSMSBot {
  private browser: any = null;
  private page: any = null;
  private config: BotConfig;
  
  constructor(config: BotConfig) {
    this.config = config;
  }
  
  // Initialize Real Browser
  async initBrowser(): Promise<void> {
    try {
      console.log('🤖 Puppeteer: เริ่มต้นเบราว์เซอร์...');
      
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        defaultViewport: { width: 1366, height: 768 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      console.log('🤖 Puppeteer: เบราว์เซอร์พร้อมใช้งาน');
      
    } catch (error) {
      console.error('🤖 Puppeteer: เริ่มต้นเบราว์เซอร์ล้มเหลว:', error);
      throw new Error('Browser Initialization Failed');
    }
  }
  
  // Login to https://web.smsup-plus.com/login
  async login(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      console.log('🤖 Puppeteer: เข้าสู่หน้า login...');
      
      await this.page.goto(`${this.config.baseUrl}/login`, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });
      
      // Wait for login form
      await this.page.waitForSelector('input[type="text"]', { timeout: this.config.timeout });
      await this.page.waitForSelector('input[type="password"]', { timeout: this.config.timeout });
      
      // Fill credentials
      console.log('🤖 Puppeteer: กรอก username และ password...');
      await this.page.type('input[type="text"]', credentials.username);
      await this.page.type('input[type="password"]', credentials.password);
      
      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log('🤖 Puppeteer: Login สำเร็จ');
      return true;
      
    } catch (error) {
      console.error('🤖 Puppeteer: Login ล้มเหลว:', error);
      throw new Error('Authentication Failed');
    }
  }
  
  // Navigate to Account Management
  async navigateToAccountManagement(): Promise<void> {
    try {
      console.log('🤖 Puppeteer: เข้าสู่หน้า Account Management...');
      
      await this.page.goto(`${this.config.baseUrl}/accountmanagement`, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });
      
      // Wait for the page to load
      await this.page.waitForSelector('div[role="tab"]', { timeout: this.config.timeout });
      
      console.log('🤖 Puppeteer: เข้าถึงหน้า Account Management สำเร็จ');
      
    } catch (error) {
      console.error('🤖 Puppeteer: Navigation ล้มเหลว:', error);
      throw new Error('Navigation Failed');
    }
  }
  
  // Click USERS tab
  async clickUsersTab(): Promise<void> {
    try {
      console.log('🤖 Puppeteer: คลิกแท็บ USERS...');
      
      // Find and click USERS tab
      await this.page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('div[role="tab"]'));
        const usersTab = tabs.find(tab => tab.textContent?.includes('USERS'));
        if (usersTab) {
          (usersTab as HTMLElement).click();
        } else {
          throw new Error('USERS tab not found');
        }
      });
      
      // Wait for the Create User button to appear
      await this.page.waitForSelector('button.ant-btn.ant-btn-primary', { timeout: this.config.timeout });
      
      console.log('🤖 Puppeteer: แท็บ USERS เปิดสำเร็จ');
      
    } catch (error) {
      console.error('🤖 Puppeteer: Click USERS tab ล้มเหลว:', error);
      throw new Error('Tab Click Failed');
    }
  }
  
  // Create new user
  async createNewUser(userData: UserGenerationData): Promise<UserGenerationData> {
    try {
      console.log('🤖 Puppeteer: เริ่มสร้างผู้ใช้ใหม่...');
      
      // Click Create User button
      console.log('🤖 Puppeteer: คลิกปุ่ม Create User...');
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const createButton = buttons.find(btn => 
          btn.querySelector('.fa-plus-circle') && 
          btn.textContent?.includes('Create User')
        );
        if (createButton) {
          (createButton as HTMLElement).click();
        } else {
          throw new Error('Create User button not found');
        }
      });
      
      // Wait for the form popup to appear
      await this.page.waitForSelector('input[placeholder="Username"]', { timeout: this.config.timeout });
      
      // Fill user form
      console.log('🤖 Puppeteer: กรอกข้อมูลในฟอร์ม...');
      console.log(`   - Username: ${userData.username}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Password: ${userData.password}`);
      
      // Clear and fill username
      await this.page.click('input[placeholder="Username"]', { clickCount: 3 });
      await this.page.type('input[placeholder="Username"]', userData.username);
      
      // Clear and fill email
      await this.page.click('input[placeholder="Email"]', { clickCount: 3 });
      await this.page.type('input[placeholder="Email"]', userData.email);
      
      // Clear and fill password
      await this.page.click('input[placeholder="Password"]', { clickCount: 3 });
      await this.page.type('input[placeholder="Password"]', userData.password);
      
      // Clear and fill confirm password
      await this.page.click('input[placeholder="Re-type Password"]', { clickCount: 3 });
      await this.page.type('input[placeholder="Re-type Password"]', userData.password);
      
      // Click Save button
      console.log('🤖 Puppeteer: คลิกปุ่ม Save...');
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const saveButton = buttons.find(btn => 
          btn.querySelector('.fa-plus-circle') && 
          btn.textContent?.includes('Save')
        );
        if (saveButton) {
          (saveButton as HTMLElement).click();
        } else {
          throw new Error('Save button not found');
        }
      });
      
      // Wait for confirmation dialog and click OK
      console.log('🤖 Puppeteer: รอและคลิกปุ่ม OK...');
      await this.page.waitForSelector('button.ant-btn.ant-btn-primary', { timeout: this.config.timeout });
      
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const okButton = buttons.find(btn => btn.textContent?.includes('OK'));
        if (okButton) {
          (okButton as HTMLElement).click();
        }
      });
      
      // Wait a moment for the action to complete
      await this.page.waitForTimeout(2000);
      
      console.log('🤖 Puppeteer: สร้างผู้ใช้ใหม่สำเร็จ!');
      return userData;
      
    } catch (error) {
      console.error('🤖 Puppeteer: User creation ล้มเหลว:', error);
      throw new Error('User Creation Failed');
    }
  }
  
  // Close browser
  async closeBrowser(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('🤖 Puppeteer: ปิดเบราว์เซอร์เรียบร้อย');
      }
    } catch (error) {
      console.error('🤖 Puppeteer: ปิดเบราว์เซอร์ล้มเหลว:', error);
    }
  }
}

// Export function สำหรับใช้ใน Production
export const createPuppeteerBot = (config: BotConfig): PuppeteerSMSBot => {
  return new PuppeteerSMSBot(config);
};
