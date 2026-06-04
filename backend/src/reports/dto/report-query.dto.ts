import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { AttributionModel, AudienceOrigin } from '../../domain/enums';
import { IsDateString } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
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
  @Max(365)
  windowDays = 30;
}
