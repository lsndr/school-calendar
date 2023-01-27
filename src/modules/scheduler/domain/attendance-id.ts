import { ValueObject } from '../../shared/domain';
import { ExactDate } from './exact-date';
import { VisitId } from './visit-id';

export class AttendanceId extends ValueObject<'AttendanceId'> {
  public readonly visitId: VisitId;
  public readonly date: ExactDate;

  protected constructor(visitId: VisitId, date: ExactDate) {
    super();

    this.visitId = visitId;
    this.date = date;
  }

  static create(visitId: VisitId, date: ExactDate) {
    return new this(visitId, date);
  }
}
