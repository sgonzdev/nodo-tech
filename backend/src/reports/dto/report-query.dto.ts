import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AttributionModel, AudienceOrigin } from '../../domain/enums';
import {
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  MAX_ATTRIBUTION_WINDOW_DAYS,
} from '../../domain/constants';

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}
import { IsAfterOrEqual } from '../../common/validators/date-range.validator';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  @IsAfterOrEqual('from')
  to?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsEnum(AudienceOrigin)
  audienceOrigin?: AudienceOrigin;

  @IsOptional()
  @IsEnum(AttributionModel)
  model: AttributionModel = AttributionModel.LINEAR;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ATTRIBUTION_WINDOW_DAYS)
  windowDays = DEFAULT_ATTRIBUTION_WINDOW_DAYS;

  @IsOptional()
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.CSV;
}
