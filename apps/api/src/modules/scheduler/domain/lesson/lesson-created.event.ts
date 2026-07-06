export class LessonCreatedEvent {
  public id: {
    subjectId: string;
    date: {
      day: number;
      month: number;
      year: number;
    };
  };
  public time: {
    startsAt: number;
    duration: number;
  };
  public teacherIds: string[];
  public createdAt: string;
  public updatedAt: string;

  public constructor(event: LessonCreatedEvent) {
    this.id = event.id;
    this.time = event.time;
    this.teacherIds = event.teacherIds;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
  }
}
