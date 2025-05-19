import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxStageComponent } from './box-stage.component';

describe('BoxStageComponent', () => {
  let component: BoxStageComponent;
  let fixture: ComponentFixture<BoxStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxStageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BoxStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
