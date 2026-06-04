import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from '../../domain/enums';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  context: string;

  @IsString()
  owner: string;

  @IsString()
  cta: string;

  @IsString()
  sourceRule: string;

  @IsOptional()
  @IsString()
  suggestedDate?: string;
}

export class UpdateTaskDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
