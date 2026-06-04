import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from '../reports/reports.module';
import { Task } from './task.entity';
import { ActionCenterController } from './action-center.controller';
import { ActionCenterService } from './action-center.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ReportsModule],
  controllers: [ActionCenterController],
  providers: [ActionCenterService],
})
export class ActionCenterModule {}
