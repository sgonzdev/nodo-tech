import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from '../reports/reports.module';
import { Task } from '../domain/entities/task.entity';
import { ActionCenterController } from './controllers/action-center.controller';
import { ActionCenterService } from './services/action-center.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), ReportsModule],
  controllers: [ActionCenterController],
  providers: [ActionCenterService],
})
export class ActionCenterModule {}
