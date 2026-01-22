import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderFooter } from './sider-footer';

describe('SiderFooter', () => {
  let component: SiderFooter;
  let fixture: ComponentFixture<SiderFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
