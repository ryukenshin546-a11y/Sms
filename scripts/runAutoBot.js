// Node.js Script สำหรับรัน Auto-Bot จริงด้วย Puppeteer
// รันคำสั่ง: node scripts/runAutoBot.js

import puppeteer from 'puppeteer';

const botConfig = {
  headless: false, // เปิดเบราว์เซอร์ให้เห็นการทำงาน
  timeout: 30000,
  baseUrl: 'https://web.smsup-plus.com'
};

// Test data สำหรับ Sub Account
const generateSecurePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // บังคับให้มีตัวอักษรแต่ละประเภทอย่างน้อย 1 ตัว
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length)); // ตัวเล็ก
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length)); // ตัวใหญ่
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));     // ตัวเลข
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));     // สัญลักษณ์
  
  // เติมตัวอักษรสุ่มให้ครบ 12-16 ตัว
  const passwordLength = Math.floor(Math.random() * 5) + 12; // 12-16 ตัวอักษร
  for (let i = password.length; i < passwordLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // สลับตำแหน่งตัวอักษรให้สุ่ม
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

const testUserData = {
  get accountName() { return this._username; },
  get username() { return this._username; },
  _username: 'test' + Math.floor(Math.random() * 1000),
  email: 'test' + Math.floor(Math.random() * 1000) + '@gmail.com',
  password: generateSecurePassword(),
  get confirmPassword() { return this.password; }, // ใช้ getter เพื่อให้ password ตรงกัน
};

// Admin credentials
const adminCredentials = {
  username: 'Landingpage', // หรือใส่ username ที่คุณมี
  password: '@Atoz123'      // หรือใส่ password ที่คุณมี
};

async function runAutoBot() {
  let browser = null;
  
  try {
    console.log('🤖 เริ่มต้น Auto-Bot Process...');
    
    // 1. เปิดเบราว์เซอร์
    console.log('🤖 เปิดเบราว์เซอร์...');
    browser = await puppeteer.launch({
      headless: botConfig.headless,
      defaultViewport: { width: 1366, height: 768 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 2. เข้าสู่หน้า Login
    console.log('🤖 เข้าสู่หน้า https://web.smsup-plus.com/login');
    await page.goto(`${botConfig.baseUrl}/login`, {
      waitUntil: 'networkidle2',
      timeout: botConfig.timeout
    });
    
    // 3. Login ด้วย Admin Credentials
    console.log('🤖 กรอก username และ password...');
    await page.waitForSelector('input', { timeout: botConfig.timeout });
    
    // หา input fields โดยตรง
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].type(adminCredentials.username); // username field
      await inputs[1].type(adminCredentials.password); // password field
    } else {
      throw new Error('Cannot find username/password input fields');
    }
    
    console.log('🤖 กดปุ่ม Login...');
    // หาปุ่ม submit โดยใช้ text หรือ class
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
        // ถ้าไม่เจอ ให้กด Enter ใน password field
        const passwordInput = document.querySelector('input[type="password"]');
        if (passwordInput) {
          passwordInput.focus();
          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          passwordInput.dispatchEvent(enterEvent);
        }
      }
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // 4. เข้าสู่หน้า Account Management
    console.log('🤖 เข้าสู่หน้า Account Management...');
    await page.goto(`${botConfig.baseUrl}/accountmanagement`, {
      waitUntil: 'networkidle2',
      timeout: botConfig.timeout
    });
    
    // 5. คลิกแท็บ SUB ACCOUNTS
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
    
    // รอให้ปุ่ม Create Account ปรากฏ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. คลิกปุ่ม Create Account
    console.log('🤖 คลิกปุ่ม Create Account...');
    try {
      // ใช้ selector ที่แน่นอน
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
    
    // 7. กรอกข้อมูลในฟอร์ม Sub Account
    console.log('🤖 รอฟอร์มปรากฏและกรอกข้อมูล...');
    await page.waitForSelector('input[placeholder="Account name"]', { timeout: botConfig.timeout });
    
    console.log(`🤖 กรอกข้อมูลตามที่กำหนด:`);
    console.log(`   - Account Name: ${testUserData.accountName}`);
    console.log(`   - Username: ${testUserData.username}`);
    console.log(`   - Email: ${testUserData.email}`);
    console.log(`   - Password: ${testUserData.password}`);
    
    // รอให้ฟอร์มโหลดเสร็จ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // กรอกข้อมูลทั้งหมดด้วย page.type() แทน evaluate
    console.log('🤖 กรอกข้อมูล Sub Account ทั้งหมด...');
    
    // CSS Selectors สำหรับ Sub Account Form
    const accountNameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(1) > input';
    const usernameSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(2) > input';
    const emailSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(4) > input';
    const passwordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(5) > span > input';
    const confirmPasswordSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(6) > span > input';
    
    // กรอก Account Name
    try {
      await page.waitForSelector(accountNameSelector);
      await page.focus(accountNameSelector);
      await page.click(accountNameSelector, { clickCount: 3 });
      await page.type(accountNameSelector, testUserData.accountName);
      console.log('✅ กรอก Account Name:', testUserData.accountName);
    } catch (error) {
      console.error('❌ กรอก Account Name ล้มเหลว:', error.message);
    }
    
    // กรอก Username
    try {
      await page.waitForSelector(usernameSelector);
      await page.focus(usernameSelector);
      await page.click(usernameSelector, { clickCount: 3 });
      await page.type(usernameSelector, testUserData.username);
      console.log('✅ กรอก Username:', testUserData.username);
    } catch (error) {
      console.error('❌ กรอก Username ล้มเหลว:', error.message);
    }
    
    // กรอก Email
    try {
      await page.waitForSelector(emailSelector);
      await page.focus(emailSelector);
      await page.click(emailSelector, { clickCount: 3 });
      await page.type(emailSelector, testUserData.email);
      console.log('✅ กรอก Email:', testUserData.email);
    } catch (error) {
      console.error('❌ กรอก Email ล้มเหลว:', error.message);
    }
    
    // กรอก Password
    try {
      await page.waitForSelector(passwordSelector);
      await page.focus(passwordSelector);
      await page.click(passwordSelector, { clickCount: 3 });
      await page.type(passwordSelector, testUserData.password);
      console.log('✅ กรอก Password:', testUserData.password);
    } catch (error) {
      console.error('❌ กรอก Password ล้มเหลว:', error.message);
    }
    
    // กรอก Confirm Password
    try {
      await page.waitForSelector(confirmPasswordSelector);
      await page.focus(confirmPasswordSelector);
      await page.click(confirmPasswordSelector, { clickCount: 3 });
      await page.type(confirmPasswordSelector, testUserData.password);
      console.log('✅ กรอก Confirm Password:', testUserData.password);
    } catch (error) {
      console.error('❌ กรอก Confirm Password ล้มเหลว:', error.message);
    }
    
    // รออีกสักครู่ให้ฟอร์มอัพเดท
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 8. ตั้งค่า Create Subaccount เป็น OFF
    console.log('🤖 ตั้งค่า Create Subaccount เป็น OFF...');
    try {
      const subaccountOffSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(7) > div > label:nth-child(1)';
      await page.waitForSelector(subaccountOffSelector);
      await page.click(subaccountOffSelector);
      console.log('✅ ตั้งค่า Create Subaccount เป็น OFF สำเร็จ');
    } catch (error) {
      console.error('❌ ตั้งค่า Create Subaccount ล้มเหลว:', error.message);
    }
    
    // 9. เลือก Sender จาก Dropdown
    console.log('🤖 เลือก Sender จาก dropdown...');
    try {
      const senderDropdownSelector = 'body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div:nth-child(13) > div > div';
      await page.waitForSelector(senderDropdownSelector);
      await page.click(senderDropdownSelector);
      console.log('✅ เปิด dropdown sender สำเร็จ');
      
      // รอให้ dropdown options ปรากฏ
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // เลือก option แรกที่เจอ (สุ่มจาก 3 ตัวเลือก)
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
    
    // รอให้ dropdown ปิด
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 10. คลิกปุ่ม Add
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
    
    // รอให้การเพิ่ม sender เสร็จสิ้น
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // ตรวจสอบค่าในฟอร์มอีกครั้ง
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // ใช้ selector ที่แน่นอนสำหรับ Sub Account Save button
      await page.waitForSelector('body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > div > div:nth-child(2) > button', { timeout: 5000 });
      await page.click('body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > div > div:nth-child(2) > button');
      console.log('✅ กดปุ่ม Save สำเร็จ (ด้วย selector)');
    } catch (error) {
      console.log('⚠️ Selector แรกไม่ทำงาน ลองใช้วิธีอื่น...');
      // ลองหาปุ่ม Save ด้วยวิธีอื่น
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // คลิกปุ่ม OK ตาม selector ที่คุณให้มาสำหรับ Sub Account
      await page.waitForSelector('body > div:nth-child(9) > div > div.ant-modal-wrap.popup-question > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary', { timeout: 5000 });
      await page.click('body > div:nth-child(9) > div > div.ant-modal-wrap.popup-question > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary');
      console.log('✅ กดปุ่ม OK สำเร็จ (ด้วย selector)');
    } catch (error) {
      console.log('⚠️ Selector OK แรกไม่ทำงาน ลองใช้วิธีอื่น...');
      // ลองหาปุ่ม OK ด้วยวิธีอื่น
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Auto-Bot เสร็จสิ้น! สร้าง Sub Account สำเร็จ');
    console.log('📋 ข้อมูล Sub Account ที่สร้าง:');
    console.log(`   Account Name: ${testUserData.accountName}`);
    console.log(`   Username: ${testUserData.username}`);
    console.log(`   Email: ${testUserData.email}`);
    console.log(`   Password: ${testUserData.password}`);
    
    // รอสักครู่ให้ดูผลลัพธ์
    await new Promise(resolve => setTimeout(resolve, 5000));
    
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
