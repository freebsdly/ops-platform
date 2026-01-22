import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sider } from './sider';

describe('Sider', () => {
  let component: Sider;
  let fixture: ComponentFixture<Sider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
