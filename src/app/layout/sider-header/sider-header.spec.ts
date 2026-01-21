import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderHeader } from './sider-header';

describe('SiderHeader', () => {
  let component: SiderHeader;
  let fixture: ComponentFixture<SiderHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
