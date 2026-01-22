import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseButton } from './collapse-button';

describe('CollapseButton', () => {
  let component: CollapseButton;
  let fixture: ComponentFixture<CollapseButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapseButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapseButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
