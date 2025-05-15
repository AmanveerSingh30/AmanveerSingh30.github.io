import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxAnimationComponent } from './box-animation.component';

describe('BoxAnimationComponent', () => {
  let component: BoxAnimationComponent;
  let fixture: ComponentFixture<BoxAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
