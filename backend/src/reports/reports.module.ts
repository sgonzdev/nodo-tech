import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../campaigns/campaign.entity';
import { Sale } from '../sales/sale.entity';
import { Touchpoint } from '../touchpoints/touchpoint.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AttributionRunnerService } from './attribution-runner.service';
import { DrilldownService } from './drilldown.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Sale, Touchpoint])],
  controllers: [ReportsController],
  providers: [ReportsService, AttributionRunnerService, DrilldownService],
})
export class ReportsModule {}
