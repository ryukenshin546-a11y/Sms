// Optimized Node.js Script สำหรับรัน Auto-Bot ด้วย Performance Improvements
// ใช้ FLOW และ SELECTOR เดียวกันกับ Original แต่เพิ่มความเร็ว
// รันคำสั่ง: node scripts/runAutoBotOptimized.js

import puppeteer from 'puppeteer';

const botConfig = {
  headless: false, // เหมือน original
  timeout: 20000, // ✅ ลดจาก 30000ms เป็น 20000ms (เร็วขึ้น 33%)
  baseUrl: 'https://web.smsup-plus.com'
};

// ✅ ใช้ password generation เดียวกันกับ original
const generateSecurePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  // เหมือน original - เริ่มจากตัวอักษรใหญ่
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // เหมือน original - สร้างความยาว 12-16 ตัว
  const passwordLength = 12 + Math.floor(Math.random() * 5);
  
  for (let i = password.length; i < passwordLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // เหมือน original - สลับตำแหน่งตัวอักษรให้สุ่ม
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ✅ ใช้ test data structure เดียวกันกับ original
const testUserData = {
  get accountName() { return this._username; },
  get username() { return this._username; },
  _username: 'test' + Math.floor(Math.random() * 1000),
  email: 'test' + Math.floor(Math.random() * 1000) + '@gmail.com',
  password: generateSecurePassword(),
  get confirmPassword() { return this.password; },
};

// ✅ ใช้ admin credentials เดียวกันกับ original
const adminCredentials = {
  username: 'Landingpage',
  password: '@Atoz123'
};

async function runAutoBot() {
  let browser = null;
  
  try {
    console.log('🤖 เริ่มต้น Auto-Bot Process...');
    
    // ✅ 1. เปิดเบราว์เซอร์ - เหมือน original แต่เพิ่ม optimization flags
    console.log('🤖 เปิดเบราว์เซอร์...');
    browser = await puppeteer.launch({
      headless: botConfig.headless,
      defaultViewport: { width: 1366, height: 768 }, // เหมือน original
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security', // ✅ เพิ่มเพื่อความเร็ว
        '--disable-features=TranslateUI'  // ✅ เพิ่มเพื่อความเร็ว
      ]
    });
    
    const page = await browser.newPage();
    
    // ✅ 2. เข้าสู่หน้า Login - เหมือน original
    console.log('🤖 เข้าสู่หน้า https://web.smsup-plus.com/login');
    await page.goto(`${botConfig.baseUrl}/login`, {
      waitUntil: 'networkidle2', // เหมือน original
      timeout: botConfig.timeout
    });
    
    // ✅ 3. Login ด้วย Admin Credentials - เหมือน original
    console.log('🤖 กรอก username และ password...');
    await page.waitForSelector('input', { timeout: botConfig.timeout });
    
    // ✅ หา input fields โดยตรง - เหมือน original
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type(adminCredentials.username, { delay: 10 }); // ✅ เพิ่มความเร็ว - delay น้อยลง
      await inputs[1].type(adminCredentials.password, { delay: 10 }); // ✅ เพิ่มความเร็ว - delay น้อยลง
    } else {
      throw new Error('Cannot find username/password input fields');
    }
    
    console.log('🤖 กดปุ่ม Login...');
    // ✅ หาปุ่ม submit - เหมือน original
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginButton = buttons.find(btn => 
        btn.textContent?.includes('Login') || 
        btn.textContent?.includes('เข้าสู่ระบบ') ||
        btn.type === 'submit'
      );
      if (loginButton) {
        loginButton.click();
      } else {
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
          passwordInput.focus();
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          passwordInput.dispatchEvent(enterEvent);
        }
      }
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // ✅ 4. เข้าสู่หน้า Account Management - เหมือน original
    console.log('🤖 เข้าสู่หน้า Account Management...');
    await page.goto(`${botConfig.baseUrl}/accountmanagement`, {
      waitUntil: 'networkidle2', // เหมือน original
      timeout: botConfig.timeout
    });
    
    // ✅ 5. คลิกแท็บ SUB ACCOUNTS - เหมือน original
    console.log('🤖 คลิกแท็บ SUB ACCOUNTS...');
    await page.waitForSelector('div[role="tab"]', { timeout: botConfig.timeout });
    
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('div[role="tab"]'));
      const subAccountsTab = tabs.find(tab => tab.textContent?.includes('SUB ACCOUNTS'));
      if (subAccountsTab) {
        subAccountsTab.click();
      } else {
        throw new Error('SUB ACCOUNTS tab not found');
      }
    });
    
    // ✅ รอให้ปุ่ม Create Account ปรากฏ - เหมือน original แต่ลดเวลา
    await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ ลดจาก 2000ms เหลือ 1000ms
    
    // ✅ 6. คลิกปุ่ม Create Account - เหมือน original
    console.log('🤖 คลิกปุ่ม Create Account...');
    try {
      await page.waitForSelector('#main > div:nth-child(4) > div > button', { timeout: botConfig.timeout });
      await page.click('#main > div:nth-child(4) > div > button');
      console.log('✅ คลิกปุ่ม Create Account สำเร็จ (ด้วย selector)');
    } catch (error) {
      console.log('⚠️ ลองหาปุ่ม Create Account ด้วยวิธีอื่น...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const createButton = buttons.find(btn => 
          btn.querySelector('.fa-plus-circle') && 
          btn.textContent?.includes('Create Account')
        );
        if (createButton) {
          createButton.click();
        } else {
          throw new Error('Create Account button not found');
        }
      });
    }
    
    // ✅ 7. กรอกข้อมูลในฟอร์ม Sub Account - เหมือน original
    console.log('🤖 รอฟอร์มปรากฏและกรอกข้อมูล...');
    await page.waitForSelector('input[placeholder="Account name"]', { timeout: botConfig.timeout });
    
    console.log(`🤖 กรอกข้อมูลตามที่กำหนด:`);
    console.log(`   - Account Name: ${testUserData.accountName}`);
    console.log(`   - Username: ${testUserData.username}`);
    console.log(`   - Email: ${testUserData.email}`);
    console.log(`   - Password: ${testUserData.password}`);
    
    // ✅ รอให้ฟอร์มโหลดเสร็จ - เหมือน original แต่ลดเวลา
    await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ ลดจาก 2000ms เหลือ 1000ms
    
    console.log('🤖 กรอกข้อมูล Sub Account ทั้งหมด...');
    
    // ✅ CSS Selectors สำหรับ Sub Account Form - เหมือน original
    const accountNameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(1) > input';
    const usernameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(2) > input';
    const emailSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(4) > input';
    const passwordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(5) > span > input';
    const confirmPasswordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(6) > span > input';
    
    // ✅ กรอก Account Name - เหมือน original แต่เพิ่มความเร็ว
    try {
      await page.waitForSelector(accountNameSelector);
      await page.focus(accountNameSelector);
      await page.click(accountNameSelector, { clickCount: 3 });
      await page.type(accountNameSelector, testUserData.accountName, { delay: 10 }); // ✅ เร็วขึ้น
      console.log('✅ กรอก Account Name:', testUserData.accountName);
    } catch (error) {
      console.error('❌ กรอก Account Name ล้มเหลว:', error.message);
    }
    
    // ✅ กรอก Username - เหมือน original แต่เพิ่มความเร็ว
    try {
      await page.waitForSelector(usernameSelector);
      await page.focus(usernameSelector);
      await page.click(usernameSelector, { clickCount: 3 });
      await page.type(usernameSelector, testUserData.username, { delay: 10 }); // ✅ เร็วขึ้น
      console.log('✅ กรอก Username:', testUserData.username);
    } catch (error) {
      console.error('❌ กรอก Username ล้มเหลว:', error.message);
    }
    
    // ✅ กรอก Email - เหมือน original แต่เพิ่มความเร็ว
    try {
      await page.waitForSelector(emailSelector);
      await page.focus(emailSelector);
      await page.click(emailSelector, { clickCount: 3 });
      await page.type(emailSelector, testUserData.email, { delay: 10 }); // ✅ เร็วขึ้น
      console.log('✅ กรอก Email:', testUserData.email);
    } catch (error) {
      console.error('❌ กรอก Email ล้มเหลว:', error.message);
    }
    
    // ✅ กรอก Password - เหมือน original แต่เพิ่มความเร็ว
    try {
      await page.waitForSelector(passwordSelector);
      await page.focus(passwordSelector);
      await page.click(passwordSelector, { clickCount: 3 });
      await page.type(passwordSelector, testUserData.password, { delay: 10 }); // ✅ เร็วขึ้น
      console.log('✅ กรอก Password:', testUserData.password);
    } catch (error) {
      console.error('❌ กรอก Password ล้มเหลว:', error.message);
    }
    
    // ✅ กรอก Confirm Password - เหมือน original แต่เพิ่มความเร็ว
    try {
      await page.waitForSelector(confirmPasswordSelector);
      await page.focus(confirmPasswordSelector);
      await page.click(confirmPasswordSelector, { clickCount: 3 });
      await page.type(confirmPasswordSelector, testUserData.password, { delay: 10 }); // ✅ เร็วขึ้น
      console.log('✅ กรอก Confirm Password:', testUserData.password);
    } catch (error) {
      console.error('❌ กรอก Confirm Password ล้มเหลว:', error.message);
    }
    
    // ✅ รอให้ฟอร์มอัพเดท - เหมือน original แต่ลดเวลา
    await new Promise(resolve => setTimeout(resolve, 800)); // ✅ ลดจาก 1500ms เหลือ 800ms
    
    // ✅ 8. ตั้งค่า Create Subaccount เป็น OFF - เหมือน original
    console.log('🤖 ตั้งค่า Create Subaccount เป็น OFF...');
    try {
      const subaccountOffSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(7) > div > label:nth-child(1)';
      await page.waitForSelector(subaccountOffSelector);
      await page.click(subaccountOffSelector);
      console.log('✅ ตั้งค่า Create Subaccount เป็น OFF สำเร็จ');
    } catch (error) {
      console.error('❌ ตั้งค่า Create Subaccount ล้มเหลว:', error.message);
    }
    
    // ✅ 9. เลือก Sender จาก Dropdown - เหมือน original
    console.log('🤖 เลือก Sender จาก dropdown...');
    try {
      const senderDropdownSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(13) > div > div';
      await page.waitForSelector(senderDropdownSelector);
      await page.click(senderDropdownSelector);
      console.log('✅ เปิด dropdown sender สำเร็จ');
      
      // ✅ รอให้ dropdown options ปรากฏ - เหมือน original แต่ลดเวลา
      await new Promise(resolve => setTimeout(resolve, 800)); // ✅ ลดจาก 1500ms เหลือ 800ms
      
      // ✅ เลือก option แรกที่เจอ - เหมือน original
      await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('.ant-select-dropdown-menu-item'));
        if (options.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(3, options.length));
          options[randomIndex].click();
          console.log('✅ เลือก sender option:', randomIndex + 1);
        } else {
          throw new Error('Sender options not found');
        }
      });
      
      console.log('✅ เลือก Sender สำเร็จ');
    } catch (error) {
      console.error('❌ เลือก Sender ล้มเหลว:', error.message);
    }
    
    // ✅ รอให้ dropdown ปิด - เหมือน original แต่ลดเวลา
    await new Promise(resolve => setTimeout(resolve, 500)); // ✅ ลดจาก 1000ms เหลือ 500ms
    
    // ✅ 10. คลิกปุ่ม Add - เหมือน original
    console.log('🤖 คลิกปุ่ม Add...');
    try {
      const addButtonSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-24.ant-col-lg-24.ant-col-xl-16 > button';
      await page.waitForSelector(addButtonSelector);
      await page.click(addButtonSelector);
      console.log('✅ คลิกปุ่ม Add สำเร็จ');
    } catch (error) {
      console.log('⚠️ ลองหาปุ่ม Add ด้วยวิธีอื่น...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const addButton = buttons.find(btn => 
          btn.querySelector('.fa-plus-circle') && 
          btn.textContent?.includes('Add')
        );
        if (addButton) {
          addButton.click();
        } else {
          throw new Error('Add button not found');
        }
      });
    }
    
    // ✅ รอให้การเพิ่ม sender เสร็จสิ้น - เหมือน original แต่ลดเวลา
    await new Promise(resolve => setTimeout(resolve, 800)); // ✅ ลดจาก 1500ms เหลือ 800ms
    
    // ตรวจสอบค่าในฟอร์มอีกครั้ง (เหมือน original)
    await page.evaluate(() => {
      const accountNameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(1) > input';
      const usernameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(2) > input';
      const emailSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(4) > input';
      const passwordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(5) > span > input';
      const confirmPasswordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(6) > span > input';
      
      const accountNameInput = document.querySelector(accountNameSelector);
      const usernameInput = document.querySelector(usernameSelector);
      const emailInput = document.querySelector(emailSelector);
      const passwordInput = document.querySelector(passwordSelector);
      const confirmPasswordInput = document.querySelector(confirmPasswordSelector);
      
      console.log('🔍 ตรวจสอบค่าในฟอร์ม Sub Account:');
      console.log('   Account Name:', accountNameInput?.value || 'ว่าง');
      console.log('   Username:', usernameInput?.value || 'ว่าง');
      console.log('   Email:', emailInput?.value || 'ว่าง');
      console.log('   Password:', passwordInput?.value || 'ว่าง');
      console.log('   Confirm Password:', confirmPasswordInput?.value || 'ว่าง');
    });
    
    // ตรวจสอบว่าข้อมูลถูกกรอกครบแล้วหรือไม่
    console.log('🤖 ตรวจสอบข้อมูลใน Sub Account Form...');
    const formData = await page.evaluate(() => {
      const accountName = document.querySelector('input[placeholder="Account name"]')?.value || '';
      const username = document.querySelector('input[placeholder="Username"]')?.value || '';
      const emailSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(4) > input';
      const email = document.querySelector(emailSelector)?.value || '';
      const passwordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(5) > span > input';
      const password = document.querySelector(passwordSelector)?.value || '';
      const confirmPasswordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(6) > span > input';
      const confirmPassword = document.querySelector(confirmPasswordSelector)?.value || '';
      return { accountName, username, email, password, confirmPassword };
    });
    
    console.log('✅ ข้อมูลในฟอร์ม Sub Account ตอนนี้:', formData);
    
    // รอสักครู่ให้ฟอร์มอัพเดท
    await new Promise(resolve => setTimeout(resolve, 500)); // ✅ ลดจาก 1000ms เหลือ 500ms
    
    console.log('✅ กรอกข้อมูลครบถ้วนแล้ว');
    
    // ตรวจสอบข้อมูลสุดท้ายก่อนกด Save
    const finalFormData = await page.evaluate(() => {
      const accountName = document.querySelector('input[placeholder="Account name"]')?.value || '';
      const username = document.querySelector('input[placeholder="Username"]')?.value || '';
      const emailSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(4) > input';
      const email = document.querySelector(emailSelector)?.value || '';
      const passwordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(5) > span > input';
      const password = document.querySelector(passwordSelector)?.value || '';
      const confirmPasswordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(6) > span > input';
      const confirmPassword = document.querySelector(confirmPasswordSelector)?.value || '';
      return { accountName, username, email, password, confirmPassword };
    });
    
    console.log('🤖 ข้อมูลสุดท้ายใน Sub Account Form:', finalFormData);
    
    // 11. คลิกปุ่ม Save ตาม selector ที่แน่นอน
    console.log('🤖 คลิกปุ่ม Save...');
    
    // รอสักครู่ให้ข้อมูลอัพเดท
    await new Promise(resolve => setTimeout(resolve, 500)); // ✅ ลดจาก 1000ms เหลือ 500ms
    
    try {
      await page.waitForSelector('body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > div > div:nth-child(2) > button', { timeout: 5000 });
      await page.click('body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > div > div:nth-child(2) > button');
      console.log('✅ กดปุ่ม Save สำเร็จ (ด้วย selector)');
    } catch (error) {
      console.log('⚠️ Selector แรกไม่ทำงาน ลองใช้วิธีอื่น...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const saveButton = buttons.find(btn => 
          btn.querySelector('.fa-plus-circle') && 
          btn.textContent?.includes('Save')
        );
        if (saveButton) {
          saveButton.click();
          console.log('✅ กดปุ่ม Save สำเร็จ (วิธีที่ 2)');
        } else {
          throw new Error('Save button not found');
        }
      });
    }
    
    // 12. รอและคลิกปุ่ม OK ใน confirmation popup
    console.log('🤖 รอ popup confirmation และคลิกปุ่ม OK...');
    
    // รอให้ confirmation popup ปรากฏ
    await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ ลดจาก 3000ms เหลือ 2000ms
    
    try {
      await page.waitForSelector('body > div:nth-child(9) > div > div.ant-modal-wrap.popup-question > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary', { timeout: 5000 });
      await page.click('body > div:nth-child(9) > div > div.ant-modal-wrap.popup-question > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary');
      console.log('✅ กดปุ่ม OK สำเร็จ (ด้วย selector)');
    } catch (error) {
      console.log('⚠️ Selector OK แรกไม่ทำงาน ลองใช้วิธีอื่น...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.ant-btn.ant-btn-primary'));
        const okButton = buttons.find(btn => btn.textContent?.includes('OK'));
        if (okButton) {
          okButton.click();
          console.log('✅ กดปุ่ม OK สำเร็จ (วิธีที่ 2)');
        } else {
          throw new Error('OK button not found');
        }
      });
    }
    
    // รอให้การดำเนินการเสร็จสิ้น
    await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ ลดจาก 3000ms เหลือ 2000ms
    
    console.log('✅ Auto-Bot เสร็จสิ้น! สร้าง Sub Account สำเร็จ');
    console.log('📋 ข้อมูล Sub Account ที่สร้าง:');
    console.log(`   Account Name: ${testUserData.accountName}`);
    console.log(`   Username: ${testUserData.username}`);
    console.log(`   Email: ${testUserData.email}`);
    console.log(`   Password: ${testUserData.password}`);
    
    // รอสักครู่ให้ดูผลลัพธ์
    await new Promise(resolve => setTimeout(resolve, 1500)); // ✅ ลดจาก 3000ms เหลือ 1500ms
    
    // ========== เริ่มขั้นตอนแอด CREDITS ==========
    console.log('🤖 เริ่มขั้นตอนแอด Credits...');
    
    // 13. คลิกแท็บ CREDITS MOVEMENT
    console.log('🤖 คลิกแท็บ CREDITS MOVEMENT...');
    try {
      // รอให้หน้าโหลดเสร็จก่อน
      await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ ลดจาก 2000ms เหลือ 1000ms
      
      await page.waitForSelector('#root > div > div > div > div > main > div > div > div.content > div > div > div > div.ant-tabs-bar.ant-tabs-top-bar > div > div > div > div > div:nth-child(1) > div:nth-child(4)', { timeout: 10000 });
      await page.click('#root > div > div > div > div > main > div > div > div.content > div > div > div > div.ant-tabs-bar.ant-tabs-top-bar > div > div > div > div > div:nth-child(1) > div:nth-child(4)');
      console.log('✅ คลิกแท็บ CREDITS MOVEMENT สำเร็จ');
    } catch (error) {
      console.log('⚠️ ลองหาแท็บ CREDITS MOVEMENT ด้วยวิธีอื่น...');
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('div[role="tab"]'));
        const creditsTab = tabs.find(tab => tab.textContent?.includes('CREDITS MOVEMENT'));
        if (creditsTab) {
          creditsTab.click();
          console.log('✅ คลิกแท็บ CREDITS MOVEMENT สำเร็จ (วิธีที่ 2)');
        } else {
          throw new Error('CREDITS MOVEMENT tab not found');
        }
      });
    }
    
    // รอให้แท็บโหลดเสร็จ
    await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ ลดจาก 3000ms เหลือ 2000ms
    
    // 14. เลือก Account Name ที่สร้างไว้
    console.log(`🤖 เลือก Account Name: ${testUserData.accountName}...`);
    try {
      await page.waitForSelector('div.ant-select-selection__placeholder', { timeout: 10000 });
      
      await page.click('div.ant-select-selection__placeholder');
      console.log('✅ คลิก dropdown Account สำเร็จ');
      
      await new Promise(resolve => setTimeout(resolve, 500)); // ✅ ลดจาก 1000ms เหลือ 500ms
      
      await page.keyboard.type(testUserData.accountName, { delay: 20 }); // ✅ เพิ่มความเร็ว
      console.log(`✅ พิมพ์ Account Name: ${testUserData.accountName}`);
      
      await new Promise(resolve => setTimeout(resolve, 800)); // ✅ ลดจาก 1500ms เหลือ 800ms
      
      await page.evaluate((accountName) => {
        const dropdownOptions = Array.from(document.querySelectorAll('.ant-select-dropdown-menu-item'));
        const targetOption = dropdownOptions.find(option => 
          option.textContent?.includes(accountName)
        );
        if (targetOption) {
          targetOption.click();
          console.log(`✅ เลือก Account: ${accountName} สำเร็จ`);
        } else {
          throw new Error(`Account ${accountName} not found in dropdown`);
        }
      }, testUserData.accountName);
      
    } catch (error) {
      console.log('⚠️ ลองเลือก Account ด้วย Enter...');
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, 500)); // ✅ ลดจาก 1000ms เหลือ 500ms
    }
    
    console.log('✅ เลือก Account Name สำเร็จ - พร้อมสำหรับขั้นตอนต่อไป');
    
    // รอสักครู่ให้ form อัพเดท
    await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ ลดจาก 2000ms เหลือ 1000ms
    
    // 15. กรอกจำนวน Credits
    console.log('🤖 กรอกจำนวน Credits: 10...');
    try {
      await page.waitForSelector('input[role="spinbutton"][placeholder="Amount Credits"]', { timeout: 10000 });
      
      await page.click('input[role="spinbutton"][placeholder="Amount Credits"]');
      
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');
      
      await page.type('input[role="spinbutton"][placeholder="Amount Credits"]', '10', { delay: 20 }); // ✅ เพิ่มความเร็ว
      console.log('✅ กรอกจำนวน Credits: 10 สำเร็จ');
      
    } catch (error) {
      console.log('⚠️ ลองหา input field ด้วย selector ที่แน่นอน...');
      await page.waitForSelector('#main > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-12.ant-col-lg-12.ant-col-xl-7 > div.ant-row > div > div.ant-input-number-input-wrap > input', { timeout: 5000 });
      await page.click('#main > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-12.ant-col-lg-12.ant-col-xl-7 > div.ant-row > div > div.ant-input-number-input-wrap > input');
      
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');
      
      await page.type('#main > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-12.ant-col-lg-12.ant-col-xl-7 > div.ant-row > div > div.ant-input-number-input-wrap > input', '10', { delay: 20 });
      console.log('✅ กรอกจำนวน Credits: 10 สำเร็จ (ด้วย selector แน่นอน)');
    }
    
    // รอให้ระบบประมวลผลและแสดงปุ่ม Save
    await new Promise(resolve => setTimeout(resolve, 1000)); // ✅ ลดจาก 2000ms เหลือ 1000ms
    
    // 16. คลิกปุ่ม Save ในหน้า Credits tab
    console.log('🤖 คลิกปุ่ม Save ในหน้า Credits...');
    try {
      await page.waitForSelector('#main > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-24.ant-col-lg-24.ant-col-xl-2 > div.ant-row-flex.ant-row-flex-end > button', { timeout: 10000 });
      await page.click('#main > div.ant-col.ant-col-xs-24.ant-col-sm-24.ant-col-md-24.ant-col-lg-24.ant-col-xl-2 > div.ant-row-flex.ant-row-flex-end > button');
      console.log('✅ คลิกปุ่ม Save ในหน้า Credits สำเร็จ');
      
    } catch (error) {
      console.log('⚠️ ลองหาปุ่ม Save ในหน้า Credits ด้วยวิธีอื่น...');
      await page.evaluate(() => {
        const saveButtonContainer = document.querySelector('#main .ant-row-flex.ant-row-flex-end');
        if (saveButtonContainer) {
          const saveButton = saveButtonContainer.querySelector('button.ant-btn.ant-btn-primary');
          if (saveButton) {
            saveButton.click();
            console.log('✅ คลิกปุ่ม Save ในหน้า Credits สำเร็จ (วิธีที่ 2)');
          } else {
            throw new Error('Save button in Credits section not found');
          }
        } else {
          throw new Error('Save button container in Credits section not found');
        }
      });
    }
    
    // รอให้ confirmation popup ปรากฏ
    await new Promise(resolve => setTimeout(resolve, 3000)); // ✅ ลดจาก 5000ms เหลือ 3000ms
    
    // 17. คลิกปุ่ม OK ใน confirmation popup ของ CREDITS โดยเฉพาะ
    console.log('🤖 คลิกปุ่ม OK ใน confirmation popup ของ CREDITS...');
    try {
      await page.evaluate(() => {
        console.log('🔍 ตรวจสอบ popup ที่ปรากฏ:');
        const modals = document.querySelectorAll('.ant-modal-wrap.popup-question');
        modals.forEach((modal, index) => {
          const content = modal.textContent || '';
          console.log(`   Modal ${index + 1}: ${content.substring(0, 100)}...`);
        });
      });
      
      const creditPopupFound = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.ant-modal-wrap.popup-question'));
        
        const creditModal = modals.find(modal => {
          const content = modal.textContent?.toLowerCase() || '';
          return content.includes('credit') || 
                 content.includes('เครดิต') || 
                 content.includes('amount') ||
                 content.includes('จำนวน');
        });
        
        if (creditModal) {
          const okButton = creditModal.querySelector('button.ant-btn.ant-btn-primary');
          if (okButton && okButton.textContent?.includes('OK')) {
            okButton.click();
            console.log('✅ คลิกปุ่ม OK ของ Credits popup สำเร็จ');
            return true;
          }
        }
        return false;
      });
      
      if (!creditPopupFound) {
        throw new Error('Credits confirmation popup not found');
      }
      
    } catch (error) {
      console.log('⚠️ ลองหาปุ่ม OK ของ Credits ด้วยวิธีอื่น...');
      
      await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.ant-modal-wrap'));
        
        const visibleModals = modals.filter(modal => {
          const style = window.getComputedStyle(modal);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        if (visibleModals.length > 0) {
          const lastModal = visibleModals[visibleModals.length - 1];
          const okButton = lastModal.querySelector('button.ant-btn.ant-btn-primary');
          
          if (okButton && okButton.textContent?.includes('OK')) {
            okButton.click();
            console.log('✅ คลิกปุ่ม OK ของ Credits popup สำเร็จ (วิธีที่ 2)');
          } else {
            throw new Error('OK button in Credits popup not found');
          }
        } else {
          throw new Error('No visible popup found');
        }
      });
    }
    
    // รอให้การดำเนินการ Credits เสร็จสิ้น
    await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ ลดจาก 3000ms เหลือ 2000ms
    
    console.log('🎉 เพิ่ม Credits สำเร็จ!');
    console.log('📋 สรุปการดำเนินการ:');
    console.log(`   ✅ สร้าง Sub Account: ${testUserData.accountName}`);
    console.log(`   ✅ เพิ่ม Credits: 10 หน่วย`);
    console.log(`   ✅ Account ที่ได้รับ Credits: ${testUserData.accountName}`);
    
    // รอสักครู่ให้ดูผลลัพธ์สุดท้าย
    await new Promise(resolve => setTimeout(resolve, 1500)); // ✅ ลดจาก 3000ms เหลือ 1500ms
    
  } catch (error) {
    console.error('🚫 Auto-Bot ล้มเหลว:', error);
  } finally {
    // ปิดเบราว์เซอร์
    if (browser) {
      await browser.close();
      console.log('🤖 ปิดเบราว์เซอร์เรียบร้อย');
    }
  }
}

// รัน Auto-Bot
runAutoBot().catch(console.error);