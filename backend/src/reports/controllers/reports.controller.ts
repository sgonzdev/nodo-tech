import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentBusiness } from '../../auth/decorators/current-user.decorator';
import { ReportsService } from '../services/reports.service';
import { DrilldownService } from '../services/drilldown.service';
import { ReportQueryDto } from '../dto/report-query.dto';
import { toCsv } from '../utils/csv.util';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly drilldown: DrilldownService,
  ) {}

  @Get('metrics')
  metrics(
    @CurrentBusiness() businessId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reports.metrics(businessId, query);
  }

  @Get('by-campaign')
  byCampaign(
    @CurrentBusiness() businessId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reports.byCampaign(businessId, query);
  }

  @Get('by-audience-origin')
  byAudienceOrigin(
    @CurrentBusiness() businessId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.reports.byAudienceOrigin(businessId, query);
  }

  @Get('campaign/:id/drilldown')
  drill(
    @CurrentBusiness() businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.drilldown.forCampaign(businessId, id);
  }

  @Get('export.csv')
  async export(
    @CurrentBusiness() businessId: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const rows = await this.reports.byCampaign(businessId, query);
    const csv = toCsv(
      [
        'name',
        'channel',
        'adSpend',
        'attributedRevenue',
        'realRoas',
        'platformRevenue',
        'platformRoas',
        'reconciliationDiffPct',
      ],
      rows as unknown as Record<string, unknown>[],
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-campanas.csv"',
    );
    res.send(csv);
  }
}
