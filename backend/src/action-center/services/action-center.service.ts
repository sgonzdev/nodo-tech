import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TaskStatus } from '../../domain/enums';
import { ReportsService } from '../../reports/services/reports.service';
import { ReportQueryDto } from '../../reports/dto/report-query.dto';
import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { runRules } from '../rules';
import { Recommendation } from '../types/recommendation.types';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';

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
    const [campaigns, audienceOrigins, handledTitles] = await Promise.all([
      this.reports.byCampaign(businessId, query),
      this.reports.byAudienceOrigin(businessId, query),
      this.handledTitles(businessId),
    ]);
    return runRules({ campaigns, audienceOrigins }).filter(
      (rec) => !handledTitles.has(rec.title),
    );
  }

  async dismissRecommendation(
    businessId: string,
    dto: CreateTaskDto,
    now: Date,
  ) {
    return this.create(businessId, dto, now, TaskStatus.DISMISSED);
  }

  private async handledTitles(businessId: string): Promise<Set<string>> {
    const tasks = await this.tasks.find({
      where: { businessId },
      select: { title: true },
    });
    return new Set(tasks.map((t) => t.title));
  }

  async list(businessId: string, pagination: PaginationDto) {
    const [items, total] = await this.tasks.findAndCount({
      where: { businessId, status: Not(TaskStatus.DISMISSED) },
      order: { createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return paginate(items, total, pagination);
  }

  async create(
    businessId: string,
    dto: CreateTaskDto,
    now: Date,
    status: TaskStatus = TaskStatus.ACCEPTED,
  ) {
    const existing = await this.tasks.findOne({
      where: { businessId, title: dto.title },
    });
    if (existing) return existing;

    const suggestedDate =
      dto.suggestedDate ??
      new Date(now.getTime() + DEFAULT_DUE_DAYS * 86_400_000)
        .toISOString()
        .slice(0, 10);
    return this.tasks.save(
      this.tasks.create({ ...dto, businessId, suggestedDate, status }),
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
