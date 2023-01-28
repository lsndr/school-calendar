export class AttendanceUpdatedEvent {
  id: {
    visitId: string;
    date: {
      day: number;
      month: number;
      year: number;
    };
  };
  time: {
    startsAt: number;
    duration: number;
  };
  employeeIds: Array<string>;
  createdAt: string;
  updatedAt: string;

  constructor(event: AttendanceUpdatedEvent) {
    this.id = event.id;
    this.time = event.time;
    this.employeeIds = event.employeeIds;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
