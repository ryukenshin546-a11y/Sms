// Queue System สำหรับ SMS Account Generation Job Management

export interface QueueJob {
  id: string;
  type: 'sms_account_generation';
  payload: {
    userId: string;
    userInfo: any;
    priority?: number;
  };
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export interface QueueOptions {
  maxConcurrentJobs: number;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential';
      delay: number;
    };
    removeOnComplete: number;
    removeOnFail: number;
  };
}

// Queue Manager Class
export class SMSGenerationQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private options: QueueOptions;

  constructor(options: QueueOptions = {
    maxConcurrentJobs: 3,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    }
  }) {
    this.options = options;
  }

  // เพิ่ม job ใหม่เข้า queue
  async addJob(userId: string, userInfo: any, priority: number = 0): Promise<string> {
    const jobId = `sms_gen_${userId}_${Date.now()}`;
    
    const job: QueueJob = {
      id: jobId,
      type: 'sms_account_generation',
      payload: {
        userId,
        userInfo,
        priority
      },
      status: 'waiting',
      progress: 0,
      attempts: 0,
      maxAttempts: this.options.defaultJobOptions.attempts,
      createdAt: new Date()
    };

    this.jobs.set(jobId, job);
    console.log(`📝 เพิ่ม job ${jobId} เข้า queue`);
    
    // เริ่มประมวลผล job ทันที (หาก slot ว่าง)
    this.processNextJob();
    
    return jobId;
  }

  // ดึงข้อมูล job
  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId);
  }

  // อัปเดตความคืบหน้าของ job
  updateJobProgress(jobId: string, progress: number, status?: QueueJob['status']): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = progress;
      if (status) job.status = status;
      console.log(`📊 Job ${jobId}: ${progress}% - ${job.status}`);
    }
  }

  // ประมวลผล job ถัดไป
  private async processNextJob(): Promise<void> {
    // ตรวจสอบว่ามี slot ว่างหรือไม่
    if (this.activeJobs.size >= this.options.maxConcurrentJobs) {
      return;
    }

    // หา job ที่รอประมวลผล
    const waitingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'waiting')
      .sort((a, b) => (b.payload.priority || 0) - (a.payload.priority || 0)); // เรียงตาม priority

    if (waitingJobs.length === 0) {
      return;
    }

    const job = waitingJobs[0];
    await this.executeJob(job);
  }

  // ประมวลผล job
  private async executeJob(job: QueueJob): Promise<void> {
    try {
      // เปลี่ยนสถานะเป็น active
      job.status = 'active';
      job.startedAt = new Date();
      job.attempts++;
      this.activeJobs.add(job.id);
      
      console.log(`🚀 เริ่มประมวลผล job ${job.id}`);

      // Import SMS bot service
      const { generateSMSAccount } = await import('./smsBotService');
      
      // เรียกใช้ bot service พร้อม progress callback
      const result = await generateSMSAccount(
        job.payload.userId,
        job.payload.userInfo,
        (step: string, progress: number) => {
          this.updateJobProgress(job.id, progress);
          job.status = 'active';
        }
      );

      // Job สำเร็จ
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      
      console.log(`✅ Job ${job.id} เสร็จสิ้น`);

    } catch (error) {
      console.error(`❌ Job ${job.id} ล้มเหลว:`, error);
      
      // ตรวจสอบว่าควร retry หรือไม่
      if (job.attempts < job.maxAttempts) {
        // Retry with exponential backoff
        const delay = this.options.defaultJobOptions.backoff.delay * Math.pow(2, job.attempts - 1);
        
        console.log(`🔄 จะ retry job ${job.id} ในอีก ${delay}ms`);
        
        setTimeout(() => {
          job.status = 'waiting';
          this.processNextJob();
        }, delay);
        
      } else {
        // Job ล้มเหลวถาวร
        job.status = 'failed';
        job.failedAt = new Date();
        job.error = error instanceof Error ? error.message : 'Unknown error';
        
        console.log(`💥 Job ${job.id} ล้มเหลวถาวร`);
      }
    } finally {
      // ปล่อย slot และประมวลผล job ถัดไป
      this.activeJobs.delete(job.id);
      setTimeout(() => this.processNextJob(), 100);
    }
  }

  // ดึงสถิติ queue
  getQueueStats(): {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const jobs = Array.from(this.jobs.values());
    
    return {
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      total: jobs.length
    };
  }

  // ลบ job ที่เสร็จแล้ว (cleanup)
  cleanup(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const jobsToRemove: string[] = [];
    
    for (const [jobId, job] of this.jobs.entries()) {
      // ลบ job ที่เสร็จแล้วและเก่าเกิน 1 ชั่วโมง
      if ((job.status === 'completed' || job.status === 'failed') && 
          job.completedAt && job.completedAt < oneHourAgo) {
        jobsToRemove.push(jobId);
      }
    }

    jobsToRemove.forEach(jobId => {
      this.jobs.delete(jobId);
      console.log(`🧹 ลบ job ${jobId} (cleanup)`);
    });
  }
}

// Global Queue Instance
export const smsGenerationQueue = new SMSGenerationQueue();

// Auto cleanup ทุก 30 นาที
setInterval(() => {
  smsGenerationQueue.cleanup();
}, 30 * 60 * 1000);
