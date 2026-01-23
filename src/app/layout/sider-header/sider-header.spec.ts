import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiderHeader } from './sider-header';
import { LayoutService } from '../../layout.service';

describe('SiderHeader', () => {
  let component: SiderHeader;
  let fixture: ComponentFixture<SiderHeader>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderHeader],
      providers: [LayoutService]
    })
    .compileComponents();

    layoutService = TestBed.inject(LayoutService);
    fixture = TestBed.createComponent(SiderHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
