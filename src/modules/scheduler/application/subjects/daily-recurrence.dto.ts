import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class DailyRecurrenceDto {
  @ApiProperty({
    enum: ['daily'],
  })
  @Equals('daily')
  type: 'daily';

  constructor() {
    this.type = 'daily';
  }
}
