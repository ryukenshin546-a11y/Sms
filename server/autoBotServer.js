// Auto-Bot API Server  
// Express server สำหรับเรียกใช้ runAutoBotWithDB.js

import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API endpoint สำหรับรัน Auto-Bot
app.post('/api/auto-bot/generate', (req, res) => {
  console.log('🚀 API: รับคำขอ Auto-Bot generation');
  console.log('📝 Script ใหม่จะดึงข้อมูลจาก Database โดยตรง');
  
  // เรียก script ใหม่
  const scriptPath = path.join(__dirname, '..', 'scripts', 'runAutoBotWithDB.js');
  
  console.log('📋 Script path:', scriptPath);
  
  const autoBotProcess = spawn('node', [scriptPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
  
  console.log('🚀 Process spawned successfully');
  
  let outputData = '';
  let errorData = '';
  
  // รับข้อมูลจาก stdout
  autoBotProcess.stdout.on('data', (data) => {
    const output = data.toString();
    outputData += output;
    console.log('🤖 Auto-Bot Output:', output.trim());
  });
  
  // รับข้อมูลจาก stderr
  autoBotProcess.stderr.on('data', (data) => {
    const error = data.toString();
    errorData += error;
    console.error('❌ Auto-Bot Error:', error.trim());
  });
  
  // เมื่อ process เสร็จสิ้น
  autoBotProcess.on('close', (code) => {
    console.log(`🏁 Auto-Bot Process จบด้วย exit code: ${code}`);
    
    if (code === 0) {
      try {
        // หาข้อมูล Account ที่สร้างจาก output
        const accountMatch = outputData.match(/Account Name: (.*?)[\r\n]/);
        const usernameMatch = outputData.match(/Username: (.*?)[\r\n]/);
        const emailMatch = outputData.match(/Email: (.*?)[\r\n]/);
        const passwordMatch = outputData.match(/Password: (.*?)[\r\n]/);
        
        if (accountMatch && usernameMatch && emailMatch && passwordMatch) {
          const result = {
            success: true,
            data: {
              accountName: accountMatch[1].trim(),
              username: usernameMatch[1].trim(),
              email: emailMatch[1].trim(),
              password: passwordMatch[1].trim()
            }
          };
          
          console.log('✅ API: ส่งผลลัพธ์สำเร็จ:', result.data);
          res.json(result);
        } else {
          throw new Error('ไม่สามารถ parse ข้อมูล Account ได้');
        }
        
      } catch (parseError) {
        console.error('❌ API: Parse Error:', parseError.message);
        res.status(500).json({
          success: false,
          error: `Parse Error: ${parseError.message}`,
          rawOutput: outputData
        });
      }
      
    } else {
      console.error('❌ API: Auto-Bot Process ล้มเหลว');
      res.status(500).json({
        success: false,
        error: `Auto-Bot Process ล้มเหลว (exit code: ${code})`,
        stderr: errorData,
        stdout: outputData
      });
    }
  });
  
  // Handle process error
  autoBotProcess.on('error', (error) => {
    console.error('❌ API: Process Error:', error.message);
    res.status(500).json({
      success: false,
      error: `Process Error: ${error.message}`
    });
  });
});

app.listen(port, () => {
  console.log(`🚀 Auto-Bot API Server เริ่มทำงานที่ http://localhost:${port}`);
  console.log(`📡 API Endpoint: http://localhost:${port}/api/auto-bot/generate`);
});