export class AttendanceCreatedEvent {
  id: {
    visitId: string;
    date: {
      day: number;
      month: number;
      year: number;
    };
  };
  timeInterval: {
    startsAt: number;
    duration: number;
  };
  employeeIds: Array<string>;
  createdAt: string;
  updatedAt: string;

  constructor(event: AttendanceCreatedEvent) {
    this.id = event.id;
    this.timeInterval = event.timeInterval;
    this.employeeIds = event.employeeIds;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
