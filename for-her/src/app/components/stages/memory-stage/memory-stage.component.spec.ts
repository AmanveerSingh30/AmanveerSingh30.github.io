import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryStageComponent } from './memory-stage.component';

describe('MemoryStageComponent', () => {
  let component: MemoryStageComponent;
  let fixture: ComponentFixture<MemoryStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryStageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
