import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TypewriterComponent } from './typewriter.component';

describe('TypewriterComponent', () => {
  let component: TypewriterComponent;
  let fixture: ComponentFixture<TypewriterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TypewriterComponent,
        HttpClientTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypewriterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 