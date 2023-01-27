export class LessonUpdatedEvent {
  id: {
    subjectId: string;
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
  teacherIds: Array<string>;
  createdAt: string;
  updatedAt: string;

  constructor(event: LessonUpdatedEvent) {
    this.id = event.id;
    this.timeInterval = event.timeInterval;
    this.teacherIds = event.teacherIds;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
