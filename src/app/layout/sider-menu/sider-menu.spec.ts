import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiderMenu } from './sider-menu';
import { DEFAULT_LAYOUT_CONFIG } from '../../core/types/layout-config.interface';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

describe('SiderMenu', () => {
  let component: SiderMenu;
  let fixture: ComponentFixture<SiderMenu>;
  let actions$: Observable<any> = of();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderMenu],
      providers: [
        provideMockStore({}),
        provideMockActions(() => actions$)
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderMenu);
    component = fixture.componentInstance;
    
    // 设置必要的输入属性
    fixture.componentRef.setInput('layoutConfig', DEFAULT_LAYOUT_CONFIG);
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
