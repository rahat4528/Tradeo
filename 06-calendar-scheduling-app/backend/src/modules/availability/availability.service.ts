import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(userId: string) {
    const [schedules, overrides] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { userId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.dateOverride.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      }),
    ]);

    return { schedules, overrides };
  }

  async setWeeklySchedule(userId: string, dto: SetScheduleDto) {
    // Replace all existing schedules for user atomically
    await this.prisma.schedule.deleteMany({ where: { userId } });

    if (dto.schedules && dto.schedules.length > 0) {
      await this.prisma.schedule.createMany({
        data: dto.schedules.map((s) => ({
          userId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      });
    }

    return this.prisma.schedule.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async addOverride(userId: string, dto: CreateOverrideDto) {
    // Delete existing override for date if present
    await this.prisma.dateOverride.deleteMany({
      where: { userId, date: dto.date },
    });

    return this.prisma.dateOverride.create({
      data: {
        userId,
        date: dto.date,
        isUnavailable: dto.isUnavailable,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
      },
    });
  }

  async deleteOverride(id: string, userId: string) {
    const override = await this.prisma.dateOverride.findUnique({ where: { id } });
    if (!override || override.userId !== userId) {
      throw new NotFoundException('Date override not found.');
    }
    return this.prisma.dateOverride.delete({ where: { id } });
  }
}
