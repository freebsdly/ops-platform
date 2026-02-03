import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiderHeader } from './sider-header';
import { DEFAULT_LAYOUT_CONFIG } from '../../core/types/layout-config.interface';

describe('SiderHeader', () => {
  let component: SiderHeader;
  let fixture: ComponentFixture<SiderHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderHeader],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderHeader);
    component = fixture.componentInstance;
    
    // 设置必要的输入属性
    fixture.componentRef.setInput('layoutConfig', DEFAULT_LAYOUT_CONFIG);
    fixture.componentRef.setInput('isSiderCollapsed', false);
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
