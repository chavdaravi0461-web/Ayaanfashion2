import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

interface SuspiciousPattern {
  regex: RegExp;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class SecurityMonitorMiddleware implements NestMiddleware {
  private readonly logger = new Logger('SecurityMonitor');
  private readonly suspiciousPatterns: SuspiciousPattern[] = [
    { regex: /(<script[\s>]|javascript:|on\w+\s*=)/i, name: 'XSS Attempt', severity: 'critical' },
    { regex: /(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+.*set)/i, name: 'SQL Injection', severity: 'critical' },
    { regex: /(\.\.\/|\.\.\\)/i, name: 'Path Traversal', severity: 'high' },
    { regex: /(exec|eval|function\s*\(|new\s+Function)/i, name: 'Code Injection', severity: 'critical' },
    { regex: /(\/etc\/passwd|\/etc\/shadow|\/proc\/self)/i, name: 'File Inclusion', severity: 'critical' },
    { regex: /(cmd|command|exec|system|passthru|shell_exec)/i, name: 'Command Injection', severity: 'critical' },
    { regex: /(base64_decode|base64_encode|str_rot13)/i, name: 'Obfuscation', severity: 'medium' },
    { regex: /(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)/i, name: 'SQL Keyword', severity: 'medium' },
    { regex: /(\<\?php|\<\?=|\<%)/i, name: 'Server-Side Code', severity: 'high' },
    { regex: /(password|passwd|pwd|secret|token|api[_-]?key)/i, name: 'Credential Leak', severity: 'low' },
  ];

  private readonly blockedIPs = new Map<string, number>();
  private readonly suspiciousIPs = new Map<string, { count: number; firstSeen: number }>();
  private readonly MAX_SUSPICIOUS = 10;
  private readonly BLOCK_DURATION = 3600000;

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const url = req.originalUrl || req.url;

    if (this.isBlocked(ip)) {
      this.logger.warn(`Blocked request from IP: ${ip}`);
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const threats: string[] = [];

    const checkString = `${url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)} ${JSON.stringify(req.headers)}`;

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.regex.test(checkString)) {
        threats.push(`${pattern.name} (${pattern.severity})`);
        this.logThreat(ip, pattern, req);
      }
    }

    if (this.hasSuspiciousHeaders(req)) {
      threats.push('Suspicious Headers');
    }

    if (this.hasBruteForcePattern(req)) {
      threats.push('Brute Force Pattern');
    }

    if (threats.length > 0) {
      this.trackSuspiciousIP(ip);
      this.logger.warn(`Threats detected from ${ip}: ${threats.join(', ')}`);

      if (threats.some(t => t.includes('critical'))) {
        res.status(403).json({
          success: false,
          message: 'Request blocked due to security policy',
        });
        return;
      }
    }

    res.setHeader('X-Request-ID', this.generateRequestId());

    next();
  }

  private isBlocked(ip: string): boolean {
    const blockTime = this.blockedIPs.get(ip);
    if (blockTime && Date.now() - blockTime < this.BLOCK_DURATION) {
      return true;
    }
    if (blockTime) this.blockedIPs.delete(ip);
    return false;
  }

  private trackSuspiciousIP(ip: string): void {
    const existing = this.suspiciousIPs.get(ip);
    if (existing) {
      existing.count++;
      if (existing.count >= this.MAX_SUSPICIOUS) {
        this.blockedIPs.set(ip, Date.now());
        this.logger.error(`IP ${ip} has been blocked due to ${existing.count} suspicious requests`);
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, firstSeen: Date.now() });
    }
  }

  private hasSuspiciousHeaders(req: Request): boolean {
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
    for (const header of suspiciousHeaders) {
      const value = req.headers[header];
      if (value && Array.isArray(value) && value.length > 3) return true;
    }
    return false;
  }

  private hasBruteForcePattern(req: Request): boolean {
    if (req.path.includes('login') && req.method === 'POST') {
      const body = req.body as any;
      if (body?.password && body.password.length < 4) return true;
    }
    return false;
  }

  private logThreat(ip: string, pattern: SuspiciousPattern, req: Request): void {
    this.logger.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      ip,
      threat: pattern.name,
      severity: pattern.severity,
      path: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    }));
  }

  private generateRequestId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
