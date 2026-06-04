import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../domain/entities/campaign.entity';
import { Sale } from '../domain/entities/sale.entity';
import { Touchpoint } from '../domain/entities/touchpoint.entity';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { AttributionRunnerService } from './services/attribution-runner.service';
import { DrilldownService } from './services/drilldown.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Sale, Touchpoint])],
  controllers: [ReportsController],
  providers: [ReportsService, AttributionRunnerService, DrilldownService],
  exports: [ReportsService],
})
export class ReportsModule {}
