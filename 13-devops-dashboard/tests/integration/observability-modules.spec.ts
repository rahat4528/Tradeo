import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../../backend/src/modules/alerts/alerts.service';
import { IncidentsService } from '../../backend/src/modules/incidents/incidents.service';
import { DeploymentsService } from '../../backend/src/modules/deployments/deployments.service';
import { LogsService } from '../../backend/src/modules/logs/logs.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { IncidentStatus } from '@prisma/client';

describe('Integration: Observability Modules (Alerts, Incidents, Deployments, Logs)', () => {
  let alertsService: AlertsService;
  let incidentsService: IncidentsService;
  let deploymentsService: DeploymentsService;
  let logsService: LogsService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        IncidentsService,
        DeploymentsService,
        LogsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    alertsService = module.get<AlertsService>(AlertsService);
    incidentsService = module.get<IncidentsService>(IncidentsService);
    deploymentsService = module.get<DeploymentsService>(DeploymentsService);
    logsService = module.get<LogsService>(LogsService);
  });

  it('should create an alert rule for a service', async () => {
    mockPrisma.service.findUnique.mockResolvedValue({ id: 'srv-1', name: 'Gateway' });
    const mockRule = {
      id: 'rule-1',
      serviceId: 'srv-1',
      metricType: 'CPU',
      operator: 'GT',
      threshold: 85,
      severity: 'CRITICAL',
    };
    mockPrisma.alertRule.create.mockResolvedValue(mockRule);

    const result = await alertsService.create({
      serviceId: 'srv-1',
      metricType: 'CPU',
      operator: 'GT',
      threshold: 85,
      severity: 'CRITICAL',
    });

    expect(result.id).toBe('rule-1');
    expect(mockPrisma.alertRule.create).toHaveBeenCalled();
  });

  it('should acknowledge and resolve an incident', async () => {
    const existingIncident = {
      id: 'inc-1',
      status: IncidentStatus.TRIGGERED,
      serviceId: 'srv-1',
    };
    mockPrisma.incident.findUnique.mockResolvedValue(existingIncident);

    const mockUpdatedIncident = {
      id: 'inc-1',
      status: IncidentStatus.ACKNOWLEDGED,
      acknowledgedBy: 'Lead SRE',
    };
    mockPrisma.incident.update.mockResolvedValue(mockUpdatedIncident);

    const updated = await incidentsService.update('inc-1', 'Lead SRE', {
      status: IncidentStatus.ACKNOWLEDGED,
    });

    expect(updated.status).toBe(IncidentStatus.ACKNOWLEDGED);
    expect(mockPrisma.incident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inc-1' },
      }),
    );
  });

  it('should record a deployment event', async () => {
    mockPrisma.service.findUnique.mockResolvedValue({ id: 'srv-1', name: 'Gateway' });
    const mockDeployment = {
      id: 'dep-1',
      serviceId: 'srv-1',
      version: 'v1.4.0',
      commitSha: '6c4e3b1',
      environment: 'PRODUCTION',
      status: 'SUCCESS',
      deployer: 'CI Robot',
    };
    mockPrisma.deployment.create.mockResolvedValue(mockDeployment);

    const res = await deploymentsService.create({
      serviceId: 'srv-1',
      version: 'v1.4.0',
      commitSha: '6c4e3b1',
      environment: 'PRODUCTION' as any,
      status: 'SUCCESS' as any,
      deployer: 'CI Robot',
    });

    expect(res.version).toBe('v1.4.0');
    expect(mockPrisma.deployment.create).toHaveBeenCalled();
  });

  it('should ingest a log entry and query filtered logs', async () => {
    mockPrisma.service.findUnique.mockResolvedValue({ id: 'srv-1', name: 'Gateway' });
    const mockLog = {
      id: 'log-1',
      serviceId: 'srv-1',
      level: 'INFO',
      message: 'Service initialized on port 4012',
    };
    mockPrisma.logEntry.create.mockResolvedValue(mockLog);
    mockPrisma.logEntry.findMany.mockResolvedValue([mockLog]);

    const created = await logsService.create({
      serviceId: 'srv-1',
      level: 'INFO' as any,
      message: 'Service initialized on port 4012',
    });
    expect(created.id).toBe('log-1');

    const queried = await logsService.findAll('usr-1', {
      serviceId: 'srv-1',
      level: 'INFO' as any,
      limit: 10,
    });
    expect(queried).toHaveLength(1);
    expect(queried[0].message).toContain('port 4012');
  });
});
