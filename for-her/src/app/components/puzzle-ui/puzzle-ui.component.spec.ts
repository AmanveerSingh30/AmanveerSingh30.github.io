import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleUiComponent } from './puzzle-ui.component';

describe('PuzzleUiComponent', () => {
  let component: PuzzleUiComponent;
  let fixture: ComponentFixture<PuzzleUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
