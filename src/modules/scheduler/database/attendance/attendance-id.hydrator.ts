import { AttendanceId, VisitId } from '../../domain';
import { ExactDate } from '../../domain/exact-date';

export class AttendanceIdHydrator extends AttendanceId {
  constructor(visitId: VisitId, date: ExactDate) {
    super(visitId, date);
  }
}
