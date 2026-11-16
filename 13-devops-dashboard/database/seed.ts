import { PrismaClient, Environment, ServiceStatus, Severity, IncidentStatus, LogLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DevOps Dashboard database...');

  await prisma.logEntry.deleteMany({});
  await prisma.deployment.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.alertRule.deleteMany({});
  await prisma.metricSnapshot.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@tradeo.io',
      password: hashedPassword,
      name: 'Jordan Reed',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
  });

  // Services
  const apiGateway = await prisma.service.create({
    data: {
      userId: user.id,
      name: 'API Gateway / Edge Ingress',
      url: 'https://api.tradeo.io/health',
      environment: Environment.PRODUCTION,
      status: ServiceStatus.HEALTHY,
      uptimePercent: 99.98,
      intervalSeconds: 15,
    },
  });

  const authService = await prisma.service.create({
    data: {
      userId: user.id,
      name: 'Auth & Identity Service',
      url: 'https://auth.tradeo.io/health',
      environment: Environment.PRODUCTION,
      status: ServiceStatus.HEALTHY,
      uptimePercent: 99.95,
      intervalSeconds: 30,
    },
  });

  const settlementEngine = await prisma.service.create({
    data: {
      userId: user.id,
      name: 'Trade Settlement Worker',
      url: 'https://worker-settlement.tradeo.internal/health',
      environment: Environment.PRODUCTION,
      status: ServiceStatus.DEGRADED,
      uptimePercent: 98.40,
      intervalSeconds: 15,
    },
  });

  // Alert Rules
  const cpuRule = await prisma.alertRule.create({
    data: {
      serviceId: settlementEngine.id,
      metricType: 'CPU',
      operator: 'GT',
      threshold: 85.0,
      severity: Severity.CRITICAL,
      isEnabled: true,
    },
  });

  await prisma.alertRule.create({
    data: {
      serviceId: apiGateway.id,
      metricType: 'LATENCY',
      operator: 'GT',
      threshold: 250.0,
      severity: Severity.WARNING,
      isEnabled: true,
    },
  });

  // Incident on degraded service
  await prisma.incident.create({
    data: {
      serviceId: settlementEngine.id,
      alertRuleId: cpuRule.id,
      title: 'Elevated CPU utilization > 88% on worker pool node 3',
      description: 'Persistent order backlog ingestion causing sustained high load.',
      severity: Severity.CRITICAL,
      status: IncidentStatus.TRIGGERED,
      triggeredAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    },
  });

  // Resolved incident
  await prisma.incident.create({
    data: {
      serviceId: authService.id,
      title: 'Intermittent 502 Bad Gateway during database failover',
      description: 'Transient network glitch during primary replica switchover.',
      severity: Severity.WARNING,
      status: IncidentStatus.RESOLVED,
      triggeredAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolutionNotes: 'Replica health confirmed. Latencies returned to normal p95 < 45ms.',
      acknowledgedBy: 'Jordan Reed',
      resolvedBy: 'Jordan Reed',
    },
  });

  // Recent Timeseries Metrics (generate hourly points)
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    const timestamp = new Date(now - i * 5 * 60 * 1000); // every 5 mins
    await prisma.metricSnapshot.create({
      data: {
        serviceId: apiGateway.id,
        cpuPercent: 35 + Math.random() * 15,
        memoryPercent: 52 + Math.random() * 8,
        requestRate: 850 + Math.random() * 200,
        latencyMs: 38 + Math.random() * 15,
        errorRate: 0.02 + Math.random() * 0.05,
        timestamp,
      },
    });

    await prisma.metricSnapshot.create({
      data: {
        serviceId: settlementEngine.id,
        cpuPercent: 82 + Math.random() * 12, // high CPU
        memoryPercent: 78 + Math.random() * 10,
        requestRate: 420 + Math.random() * 150,
        latencyMs: 140 + Math.random() * 80,
        errorRate: 1.2 + Math.random() * 1.5,
        timestamp,
      },
    });
  }

  // Recent Deployments
  await prisma.deployment.create({
    data: {
      serviceId: apiGateway.id,
      version: 'v2.14.0',
      commitSha: '71a4f09',
      branch: 'main',
      environment: Environment.PRODUCTION,
      deployer: 'GitHub Actions',
      status: 'SUCCESS',
      durationSeconds: 42,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.deployment.create({
    data: {
      serviceId: settlementEngine.id,
      version: 'v1.8.2',
      commitSha: '89bf21a',
      branch: 'main',
      environment: Environment.PRODUCTION,
      deployer: 'GitHub Actions',
      status: 'SUCCESS',
      durationSeconds: 68,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  });

  // Logs
  const logLevels = [LogLevel.INFO, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.INFO];
  const messages = [
    'Connection pool initialized with 25 connections.',
    'Ingress traffic routed through eu-west-1 gateway proxy.',
    'Warning: Redis buffer usage at 76% capacity threshold.',
    'Transaction timeout on batch partition id: 1842.',
    'Healthcheck probe answered HTTP 200 OK in 14ms.',
  ];

  for (let i = 0; i < messages.length; i++) {
    await prisma.logEntry.create({
      data: {
        serviceId: i % 2 === 0 ? apiGateway.id : settlementEngine.id,
        level: logLevels[i],
        message: messages[i],
        timestamp: new Date(now - (messages.length - i) * 60 * 1000),
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
