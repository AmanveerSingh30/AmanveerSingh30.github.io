import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartLineComponent } from './heart-line.component';

describe('HeartLineComponent', () => {
  let component: HeartLineComponent;
  let fixture: ComponentFixture<HeartLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeartLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
