import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface SlidingWindowEntry {
  timestamps: number[];
}

@Injectable()
export class AdvancedRateLimiter {
  private readonly logger = new Logger(AdvancedRateLimiter.name);
  private readonly windows = new Map<string, SlidingWindowEntry>();
  private readonly blockedIPs = new Map<string, number>();
  private readonly suspiciousActivity = new Map<string, { count: number; lastSeen: number }>();

  private readonly BLOCK_DURATION = 1800000;
  private readonly SUSPICIOUS_THRESHOLD = 30;
  private readonly CLEANUP_INTERVAL = 120000;

  constructor() {
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
    req?: Request,
  ): { allowed: boolean; retryAfter?: number; remaining?: number } {
    if (this.isBlocked(key)) {
      const blockExpiry = this.blockedIPs.get(key)!;
      const retryAfter = Math.ceil((blockExpiry - Date.now()) / 1000);
      return { allowed: false, retryAfter };
    }

    const now = Date.now();
    const window = this.windows.get(key) || { timestamps: [] };

    window.timestamps = window.timestamps.filter(ts => now - ts < windowMs);

    if (window.timestamps.length >= maxRequests) {
      const oldestTimestamp = window.timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

      this.trackSuspiciousActivity(key, req);

      return { allowed: false, retryAfter };
    }

    window.timestamps.push(now);
    this.windows.set(key, window);

    return {
      allowed: true,
      remaining: maxRequests - window.timestamps.length,
    };
  }

  private isBlocked(key: string): boolean {
    const blockTime = this.blockedIPs.get(key);
    if (blockTime && Date.now() - blockTime < this.BLOCK_DURATION) {
      return true;
    }
    if (blockTime) this.blockedIPs.delete(key);
    return false;
  }

  private trackSuspiciousActivity(key: string, req?: Request): void {
    const existing = this.suspiciousActivity.get(key);
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();

      if (existing.count >= this.SUSPICIOUS_THRESHOLD) {
        this.blockedIPs.set(key, Date.now());
        this.logger.error(`IP ${key} blocked due to excessive rate limit violations`);
      }
    } else {
      this.suspiciousActivity.set(key, { count: 1, lastSeen: Date.now() });
    }
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.windows) {
      entry.timestamps = entry.timestamps.filter(ts => now - ts < 3600000);
      if (entry.timestamps.length === 0) this.windows.delete(key);
    }

    for (const [key, blockTime] of this.blockedIPs) {
      if (now - blockTime > this.BLOCK_DURATION) this.blockedIPs.delete(key);
    }

    for (const [key, entry] of this.suspiciousActivity) {
      if (now - entry.lastSeen > 3600000) this.suspiciousActivity.delete(key);
    }
  }

  getStats(): {
    activeWindows: number;
    blockedIPs: number;
    suspiciousIPs: number;
  } {
    return {
      activeWindows: this.windows.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousActivity.size,
    };
  }
}
