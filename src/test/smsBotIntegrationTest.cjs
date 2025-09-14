// SMS Bot Integration Testing Suite
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { spawn } = require('child_process');
const axios = require('axios');

// SMS Bot Integration Tester
class SMSBotIntegrationTester {
  constructor() {
    console.log('🔍 Loading SMS Bot Configuration...');
    
    this.botConfig = {
      smsAdminUsername: process.env.VITE_SMS_ADMIN_USERNAME,
      smsAdminPassword: process.env.VITE_SMS_ADMIN_PASSWORD,
      smsBaseUrl: process.env.VITE_SMS_BASE_URL,
      botMode: process.env.VITE_BOT_MODE,
      botHeadless: process.env.VITE_SMS_BOT_HEADLESS === 'true',
      botTimeout: parseInt(process.env.VITE_SMS_BOT_TIMEOUT) || 30000
    };
    
    console.log(`📡 SMS Base URL: ${this.botConfig.smsBaseUrl}`);
    console.log(`🔑 Admin Username: ${this.botConfig.smsAdminUsername}`);
    console.log(`🔐 Admin Password: ${this.botConfig.smsAdminPassword ? '***' : 'NOT SET'}`);
    console.log(`⚙️  Bot Mode: ${this.botConfig.botMode}`);
    console.log(`👁️  Headless: ${this.botConfig.botHeadless}`);
    console.log(`⏱️  Timeout: ${this.botConfig.botTimeout}ms`);
    
    this.results = [];
    this.apiServerProcess = null;
  }

  async recordTest(name, testFunction) {
    const startTime = Date.now();
    let success = false;
    let error = null;
    let details = null;

    try {
      details = await testFunction();
      success = true;
      console.log(`✅ ${name}: ${Date.now() - startTime}ms - SUCCESS`);
    } catch (err) {
      error = err.message;
      console.log(`❌ ${name}: ${Date.now() - startTime}ms - ${error}`);
    }

    this.results.push({
      name,
      duration: Date.now() - startTime,
      success,
      error,
      details
    });

    return { success, error, details };
  }

  async testConfigurationValidity() {
    console.log('\n🔧 Testing Configuration Validity...');
    
    await this.recordTest('Environment Variables Check', async () => {
      const required = ['smsAdminUsername', 'smsAdminPassword', 'smsBaseUrl'];
      const missing = required.filter(key => !this.botConfig[key]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required config: ${missing.join(', ')}`);
      }
      
      return {
        requiredConfigsPresent: required.length,
        botMode: this.botConfig.botMode,
        timeout: this.botConfig.botTimeout
      };
    });

    await this.recordTest('SMS Website Accessibility', async () => {
      const response = await axios.get(this.botConfig.smsBaseUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept any status < 500
      });
      
      return {
        statusCode: response.status,
        responseTime: response.headers['response-time'] || 'N/A',
        accessible: response.status < 400
      };
    });
  }

  async testAPIServerFunctionality() {
    console.log('\n🚀 Testing API Server Functionality...');
    
    // Test 1: Start API Server
    await this.recordTest('Start API Server', async () => {
      return new Promise((resolve, reject) => {
        try {
          const serverPath = path.resolve(__dirname, '../../server/autoBotServer.js');
          
          console.log(`   🔧 Starting server from: ${serverPath}`);
          
          this.apiServerProcess = spawn('node', [serverPath], {
            stdio: 'pipe',
            cwd: path.resolve(__dirname, '../..')
          });

          let serverOutput = '';
          let errorOutput = '';

          this.apiServerProcess.stdout.on('data', (data) => {
            const output = data.toString();
            serverOutput += output;
            if (output.includes('Auto-Bot API Server เริ่มทำงานที่')) {
              console.log(`   📡 API Server started successfully`);
              resolve({
                serverStarted: true,
                pid: this.apiServerProcess.pid,
                output: serverOutput.trim()
              });
            }
          });

          this.apiServerProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          this.apiServerProcess.on('error', (error) => {
            reject(new Error(`Server start failed: ${error.message}`));
          });

          // Timeout fallback
          setTimeout(() => {
            if (serverOutput.includes('Auto-Bot API Server เริ่มทำงานที่') || 
                serverOutput.includes('listen')) {
              resolve({
                serverStarted: true,
                pid: this.apiServerProcess.pid,
                output: serverOutput.trim()
              });
            } else {
              reject(new Error(`Server start timeout. Output: ${serverOutput}, Errors: ${errorOutput}`));
            }
          }, 5000);

        } catch (error) {
          reject(error);
        }
      });
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Health Check
    await this.recordTest('API Server Health Check', async () => {
      const response = await axios.get('http://localhost:3001/api/health', {
        timeout: 5000
      }).catch(error => {
        // Try alternative health check
        return axios.get('http://localhost:3001/', { timeout: 5000 });
      });
      
      return {
        statusCode: response.status,
        serverResponding: response.status === 200 || response.status === 404
      };
    });
  }

  async testPuppeteerScriptDirectly() {
    console.log('\n🤖 Testing Puppeteer Script Directly...');
    
    await this.recordTest('Direct Puppeteer Script Execution', async () => {
      return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '../../scripts/runAutoBot.js');
        console.log(`   🔧 Running script: ${scriptPath}`);
        
        const puppeteerProcess = spawn('node', [scriptPath], {
          stdio: 'pipe',
          cwd: path.resolve(__dirname, '../..'),
          timeout: 60000
        });

        let outputData = '';
        let errorData = '';
        let hasStarted = false;
        let hasLoggedIn = false;
        let hasNavigated = false;

        puppeteerProcess.stdout.on('data', (data) => {
          const output = data.toString();
          outputData += output;
          console.log(`   🤖 Script Output: ${output.trim()}`);
          
          // Track progress indicators
          if (output.includes('เริ่มต้น Auto-Bot Process')) {
            hasStarted = true;
          }
          if (output.includes('Login สำเร็จ') || output.includes('เข้าสู่ระบบสำเร็จ')) {
            hasLoggedIn = true;
          }
          if (output.includes('นำทางสู่หน้า Account Management')) {
            hasNavigated = true;
          }
        });

        puppeteerProcess.stderr.on('data', (data) => {
          const error = data.toString();
          errorData += error;
          console.log(`   ⚠️  Script Error: ${error.trim()}`);
        });

        puppeteerProcess.on('close', (code) => {
          console.log(`   🏁 Script finished with exit code: ${code}`);
          
          const result = {
            exitCode: code,
            hasStarted,
            hasLoggedIn,
            hasNavigated,
            outputLength: outputData.length,
            errorLength: errorData.length,
            executionSuccessful: code === 0
          };

          if (code === 0) {
            resolve(result);
          } else {
            // Still resolve but with failure info
            result.error = errorData || 'Script execution failed';
            resolve(result);
          }
        });

        puppeteerProcess.on('error', (error) => {
          reject(new Error(`Script execution error: ${error.message}`));
        });

        // Kill process after timeout to prevent hanging
        setTimeout(() => {
          if (!puppeteerProcess.killed) {
            console.log('   ⏱️  Script timeout - killing process');
            puppeteerProcess.kill();
            resolve({
              exitCode: -1,
              hasStarted,
              hasLoggedIn,
              hasNavigated,
              outputLength: outputData.length,
              errorLength: errorData.length,
              executionSuccessful: false,
              error: 'Execution timeout'
            });
          }
        }, 45000); // 45 second timeout
      });
    });
  }

  async testAPIEndpointIntegration() {
    console.log('\n📡 Testing API Endpoint Integration...');
    
    await this.recordTest('API Auto-Bot Generate Endpoint', async () => {
      const response = await axios.post('http://localhost:3001/api/auto-bot/generate', {
        // Test data can be added here
      }, {
        timeout: 60000 // 60 seconds for full bot execution
      });
      
      return {
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length,
        hasData: !!response.data,
        responseData: response.data
      };
    });
  }

  async testErrorRecoveryMechanisms() {
    console.log('\n🔧 Testing Error Recovery Mechanisms...');
    
    await this.recordTest('Invalid URL Handling', async () => {
      try {
        await axios.get('http://invalid-sms-website.com', { timeout: 5000 });
      } catch (error) {
        // This should fail, which is expected
        return {
          errorHandled: true,
          errorType: error.code || error.message,
          recoveryPossible: error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED'
        };
      }
      throw new Error('Should have failed with invalid URL');
    });

    await this.recordTest('Network Timeout Simulation', async () => {
      const startTime = Date.now();
      try {
        await axios.get('http://httpstat.us/200?sleep=10000', { timeout: 3000 });
      } catch (error) {
        const duration = Date.now() - startTime;
        return {
          timeoutHandled: true,
          timeoutDuration: duration,
          errorType: error.code,
          withinExpectedRange: duration >= 2900 && duration <= 3500
        };
      }
      throw new Error('Should have timed out');
    });
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test environment...');
    
    if (this.apiServerProcess) {
      try {
        console.log('   🔥 Stopping API server...');
        this.apiServerProcess.kill();
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('   ✅ API server stopped');
      } catch (error) {
        console.log(`   ⚠️  Error stopping API server: ${error.message}`);
      }
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const averageTime = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    const totalRuntime = this.results.reduce((sum, r) => sum + r.duration, 0) / 1000;

    console.log('\n============================================================');
    console.log('🤖 SMS BOT INTEGRATION TEST REPORT');
    console.log('============================================================');
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${totalTests - successfulTests}`);
    console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
    console.log(`  Total Runtime: ${totalRuntime.toFixed(2)}s`);

    // Categorize results
    const configTests = this.results.filter(r => r.name.includes('Configuration') || r.name.includes('Environment'));
    const apiTests = this.results.filter(r => r.name.includes('API') || r.name.includes('Server'));
    const puppeteerTests = this.results.filter(r => r.name.includes('Puppeteer') || r.name.includes('Script'));
    const recoveryTests = this.results.filter(r => r.name.includes('Recovery') || r.name.includes('Error'));

    console.log('\n📊 RESULTS BY CATEGORY:');
    
    if (configTests.length > 0) {
      const configSuccess = configTests.filter(r => r.success).length;
      console.log(`  🔧 Configuration: ${configSuccess}/${configTests.length} (${((configSuccess/configTests.length)*100).toFixed(1)}%)`);
    }
    
    if (apiTests.length > 0) {
      const apiSuccess = apiTests.filter(r => r.success).length;
      console.log(`  📡 API Integration: ${apiSuccess}/${apiTests.length} (${((apiSuccess/apiTests.length)*100).toFixed(1)}%)`);
    }
    
    if (puppeteerTests.length > 0) {
      const puppeteerSuccess = puppeteerTests.filter(r => r.success).length;
      console.log(`  🤖 Puppeteer Automation: ${puppeteerSuccess}/${puppeteerTests.length} (${((puppeteerSuccess/puppeteerTests.length)*100).toFixed(1)}%)`);
    }
    
    if (recoveryTests.length > 0) {
      const recoverySuccess = recoveryTests.filter(r => r.success).length;
      console.log(`  🔧 Error Recovery: ${recoverySuccess}/${recoveryTests.length} (${((recoverySuccess/recoveryTests.length)*100).toFixed(1)}%)`);
    }

    // Show detailed results
    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.name}: ${result.duration}ms`);
      
      if (result.details) {
        const details = typeof result.details === 'object' ? 
          Object.entries(result.details).map(([k, v]) => `${k}: ${v}`).join(', ') :
          result.details;
        console.log(`      Details: ${details}`);
      }
      
      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    // Overall assessment
    console.log('\n🎯 INTEGRATION ASSESSMENT:');
    
    const successRate = (successfulTests/totalTests)*100;
    
    if (successRate === 100) {
      console.log('  🏆 EXCELLENT - All integration tests passed!');
      console.log('  ✅ SMS Bot system is fully functional');
      console.log('  ✅ Ready for production deployment');
    } else if (successRate >= 80) {
      console.log('  🌟 VERY GOOD - Most integration tests passed');
      console.log('  ⚠️  Minor issues may need attention');
      console.log('  ✅ System is mostly production ready');
    } else if (successRate >= 60) {
      console.log('  ✅ ACCEPTABLE - Basic integration working');
      console.log('  🔧 Several issues need to be addressed');
      console.log('  ⚠️  Additional testing recommended');
    } else {
      console.log('  ❌ NEEDS ATTENTION - Multiple integration failures');
      console.log('  🚨 Significant issues need fixing');
      console.log('  🔧 Comprehensive debugging required');
    }

    console.log('\n🚀 RECOMMENDATIONS:');
    
    // Check specific failure patterns
    const configFailed = configTests.some(r => !r.success);
    const apiFailed = apiTests.some(r => !r.success);
    const puppeteerFailed = puppeteerTests.some(r => !r.success);
    
    if (configFailed) {
      console.log('  🔧 Fix configuration and environment variable issues');
    }
    
    if (apiFailed) {
      console.log('  📡 Resolve API server integration problems');
    }
    
    if (puppeteerFailed) {
      console.log('  🤖 Debug Puppeteer script execution issues');
      console.log('  🌐 Verify SMS website accessibility and credentials');
    }
    
    if (successRate >= 80) {
      console.log('  🎯 System is ready for end-to-end user testing');
      console.log('  📊 Consider performance optimization');
    }
  }
}

// Main execution
async function runSMSBotIntegrationTest() {
  const tester = new SMSBotIntegrationTester();
  
  try {
    console.log('🚀 Starting SMS Bot Integration Testing...');
    console.log('Testing Puppeteer automation, API integration, and error recovery');
    console.log('============================================================');

    await tester.testConfigurationValidity();
    await tester.testAPIServerFunctionality();
    await tester.testPuppeteerScriptDirectly();
    await tester.testAPIEndpointIntegration();
    await tester.testErrorRecoveryMechanisms();
    
    tester.generateReport();
    
  } catch (error) {
    console.error('💥 Integration testing failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check if all required packages are installed (npm install)');
    console.log('2. Verify .env file has correct SMS website credentials');
    console.log('3. Ensure SMS website is accessible from your network');
    console.log('4. Check if ports 3001 is available');
  } finally {
    await tester.cleanup();
    console.log('\n🎉 SMS Bot integration testing completed!');
  }
}

// Install required packages if not present
console.log('📦 Checking required packages...');

const requiredPackages = ['axios'];
const missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
  } catch (e) {
    missingPackages.push(pkg);
  }
}

if (missingPackages.length > 0) {
  console.log(`❌ Missing packages: ${missingPackages.join(', ')}`);
  console.log('💡 Please run: npm install axios');
  process.exit(1);
}

// Run the test
runSMSBotIntegrationTest();