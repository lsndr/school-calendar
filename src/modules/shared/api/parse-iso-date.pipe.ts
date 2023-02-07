import { BadRequestException, PipeTransform, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class ParseIsoDatePipe implements PipeTransform<string> {
  transform(value: string) {
    const date = DateTime.fromFormat(value, 'yyyy-MM-dd');

    if (!date.isValid) {
      throw new BadRequestException('Validation failed');
    }

    return value;
  }
}
