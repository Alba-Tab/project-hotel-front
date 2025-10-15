import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosDialog } from './servicios-dialog';

describe('ServiciosDialog', () => {
  let component: ServiciosDialog;
  let fixture: ComponentFixture<ServiciosDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiciosDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
