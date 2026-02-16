import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notification } from './notification';

describe('Notification', () => {
  let component: Notification;
  let fixture: ComponentFixture<Notification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notification],
    }).compileComponents();

    fixture = TestBed.createComponent(Notification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate unread count correctly', () => {
    expect(component.unreadCount()).toBe(2);
  });

  it('should mark notification as read', () => {
    component.markAsRead('1');
    expect(component.unreadCount()).toBe(1);
  });

  it('should mark all notifications as read', () => {
    component.markAllAsRead();
    expect(component.unreadCount()).toBe(0);
  });

  it('should dismiss notification', () => {
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'stopPropagation', { value: jest.fn() });

    const initialCount = component.notifications().length;
    component.dismissNotification(event, '1');
    expect(component.notifications().length).toBe(initialCount - 1);
  });
});
