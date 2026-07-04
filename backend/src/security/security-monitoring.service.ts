import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';

interface SecurityEvent {
  timestamp: Date;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  path: string;
  details: string;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousRequests: number;
  uniqueIPs: Set<string>;
  threatsDetected: number;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private readonly events: SecurityEvent[] = [];
  private readonly metrics: SecurityMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousRequests: 0,
    uniqueIPs: new Set(),
    threatsDetected: 0,
  };
  private readonly MAX_EVENTS = 10000;

  logEvent(event: SecurityEvent): void {
    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    this.metrics.totalRequests++;
    this.metrics.uniqueIPs.add(event.ip);

    if (event.severity === 'critical' || event.severity === 'high') {
      this.metrics.threatsDetected++;
      this.logger.error(`SECURITY THREAT: ${event.type} from ${event.ip} - ${event.details}`);
    }
  }

  logBlockedRequest(ip: string, path: string, reason: string): void {
    this.metrics.blockedRequests++;
    this.logEvent({
      timestamp: new Date(),
      type: 'BLOCKED',
      severity: 'medium',
      ip,
      path,
      details: reason,
    });
  }

  logSuspiciousActivity(ip: string, path: string, activity: string): void {
    this.metrics.suspiciousRequests++;
    this.logEvent({
      timestamp: new Date(),
      type: 'SUSPICIOUS',
      severity: 'high',
      ip,
      path,
      details: activity,
    });
  }

  @Interval(300000)
  handleInterval() {
    this.logger.log(`Security Metrics: ${JSON.stringify({
      totalRequests: this.metrics.totalRequests,
      blockedRequests: this.metrics.blockedRequests,
      suspiciousRequests: this.metrics.suspiciousRequests,
      uniqueIPs: this.metrics.uniqueIPs.size,
      threatsDetected: this.metrics.threatsDetected,
    })}`);
  }

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: string, limit: number = 100): SecurityEvent[] {
    return this.events.filter(e => e.type === type).slice(-limit);
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 100): SecurityEvent[] {
    return this.events.filter(e => e.severity === severity).slice(-limit);
  }

  getEventsByIP(ip: string, limit: number = 100): SecurityEvent[] {
    return this.events.filter(e => e.ip === ip).slice(-limit);
  }
}
