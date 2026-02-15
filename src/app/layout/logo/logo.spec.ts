import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Logo } from './logo';

describe('Logo', () => {
  let component: Logo;
  let fixture: ComponentFixture<Logo>;
  let store: MockStore;
  const initialState = {
    config: {
      config: null,
      loading: false,
      loaded: false,
      error: null,
      lastUpdated: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logo],
      providers: [
        provideMockStore({ initialState })
      ]
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(Logo);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show image when store config is null', () => {
    // 当store中的config为null时，应该不显示图片
    expect(component.logoSrc()).toBeUndefined();
    expect(component.showImage()).toBe(false);
  });

  it('should show image when not collapsed and has logo source', () => {
    // 首先需要设置store中的配置
    // 这个测试现在会失败，因为store中没有配置
    // 我们应该先更新store状态
    store.setState({
      config: {
        config: {
          appTitle: 'Test App',
          logo: {
            src: 'https://example.com/logo.png',
            alt: 'Test Logo',
            visible: true
          }
        },
        loading: false,
        loaded: true,
        error: null,
        lastUpdated: Date.now()
      }
    });
    
    fixture.componentRef.setInput('isCollapsed', false);
    fixture.detectChanges();
    
    expect(component.logoSrc()).toBe('https://example.com/logo.png');
    expect(component.showImage()).toBe(true);
  });

  describe('when store has config', () => {
    beforeEach(() => {
      // 设置store中的配置
      store.setState({
        config: {
          config: {
            appTitle: 'DevOps Platform',
            logo: {
              src: 'https://img.icons8.com/color/96/000000/administrative-tools.png',
              alt: 'DevOps Platform',
              link: '/',
              width: '32px',
              height: '32px',
              visible: true,
              collapsedIcon: 'tool',
              expandedIcon: 'tool'
            }
          },
          loading: false,
          loaded: true,
          error: null,
          lastUpdated: Date.now()
        });
      
      fixture.detectChanges();
    });

    it('should show image when not collapsed', () => {
      fixture.componentRef.setInput('isCollapsed', false);
      fixture.detectChanges();
      
      expect(component.showImage()).toBe(true);
      expect(component.showIcon()).toBe(false);
    });

    it('should show icon when collapsed', () => {
      fixture.componentRef.setInput('isCollapsed', true);
      fixture.detectChanges();
      
      expect(component.showImage()).toBe(false);
      expect(component.showIcon()).toBe(true);
      expect(component.iconType()).toBe('tool');
    });
  });
});
