import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentBusiness } from '../../auth/decorators/current-user.decorator';
import { ReportQueryDto } from '../../reports/dto/report-query.dto';
import { ActionCenterService } from '../services/action-center.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

@Controller('action-center')
export class ActionCenterController {
  constructor(private readonly service: ActionCenterService) {}

  @Get('recommendations')
  recommendations(
    @CurrentBusiness() businessId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.service.recommendations(businessId, query);
  }

  @Get('tasks')
  list(@CurrentBusiness() businessId: string) {
    return this.service.list(businessId);
  }

  @Post('tasks')
  create(@CurrentBusiness() businessId: string, @Body() dto: CreateTaskDto) {
    return this.service.create(businessId, dto, new Date());
  }

  @Post('recommendations/dismiss')
  dismiss(@CurrentBusiness() businessId: string, @Body() dto: CreateTaskDto) {
    return this.service.dismissRecommendation(businessId, dto, new Date());
  }

  @Patch('tasks/:id')
  update(
    @CurrentBusiness() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.update(businessId, id, dto);
  }

  @Delete('tasks/:id')
  remove(
    @CurrentBusiness() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(businessId, id);
  }
}
