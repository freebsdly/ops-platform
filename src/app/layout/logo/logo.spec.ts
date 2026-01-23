import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logo } from './logo';

describe('Logo', () => {
  let component: Logo;
  let fixture: ComponentFixture<Logo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Logo);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
