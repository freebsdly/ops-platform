import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderMenu } from './sider-menu';

describe('SiderMenu', () => {
  let component: SiderMenu;
  let fixture: ComponentFixture<SiderMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
