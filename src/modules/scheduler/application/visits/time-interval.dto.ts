import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class TimeIntervalDto {
  @Min(0)
  @Max(1439)
  @IsInt()
  @ApiProperty()
  startsAt: number;

  @Min(1)
  @Max(1440)
  @IsInt()
  @ApiProperty()
  duration: number;

  constructor(timeInterval: TimeIntervalDto) {
    this.startsAt = timeInterval?.startsAt;
    this.duration = timeInterval?.duration;
  }
}
