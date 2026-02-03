import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollapseButton } from './collapse-button';
import { provideMockStore } from '@ngrx/store/testing';

describe('CollapseButton', () => {
  let component: CollapseButton;
  let fixture: ComponentFixture<CollapseButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapseButton],
      providers: [
        provideMockStore({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapseButton);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
