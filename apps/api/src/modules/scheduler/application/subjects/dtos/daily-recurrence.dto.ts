import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class DailyRecurrenceDto {
  @ApiProperty({
    enum: ['daily'],
  })
  @Equals('daily')
  public type: 'daily';

  public constructor() {
    this.type = 'daily';
  }
}
