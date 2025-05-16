import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartParticlesComponent } from './heart-particles.component';

describe('HeartParticlesComponent', () => {
  let component: HeartParticlesComponent;
  let fixture: ComponentFixture<HeartParticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeartParticlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartParticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
