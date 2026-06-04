import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TaskStatus } from '../domain/enums';
import { ReportsService } from '../reports/services/reports.service';
import { ReportQueryDto } from '../reports/dto/report-query.dto';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { runRules } from './rules';
import { Recommendation } from './recommendation.types';

const DEFAULT_DUE_DAYS = 7;

@Injectable()
export class ActionCenterService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly reports: ReportsService,
  ) {}

  async recommendations(
    businessId: string,
    query: ReportQueryDto,
  ): Promise<Recommendation[]> {
    const [campaigns, audienceOrigins] = await Promise.all([
      this.reports.byCampaign(businessId, query),
      this.reports.byAudienceOrigin(businessId, query),
    ]);
    return runRules({ campaigns, audienceOrigins });
  }

  list(businessId: string) {
    return this.tasks.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(businessId: string, dto: CreateTaskDto, now: Date) {
    const existing = await this.tasks.findOne({
      where: {
        businessId,
        title: dto.title,
        status: In([TaskStatus.ACCEPTED, TaskStatus.DONE]),
      },
    });
    if (existing) return existing;

    const suggestedDate =
      dto.suggestedDate ??
      new Date(now.getTime() + DEFAULT_DUE_DAYS * 86_400_000)
        .toISOString()
        .slice(0, 10);
    return this.tasks.save(
      this.tasks.create({
        ...dto,
        businessId,
        suggestedDate,
        status: TaskStatus.ACCEPTED,
      }),
    );
  }

  async update(businessId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.tasks.findOne({ where: { id, businessId } });
    if (!task) throw new NotFoundException('Task no encontrada');
    task.status = dto.status;
    return this.tasks.save(task);
  }

  async remove(businessId: string, id: string) {
    const result = await this.tasks.delete({ id, businessId });
    if (!result.affected) throw new NotFoundException('Task no encontrada');
    return { ok: true };
  }
}
