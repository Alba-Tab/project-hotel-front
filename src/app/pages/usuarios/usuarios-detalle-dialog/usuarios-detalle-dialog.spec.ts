import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosDetalleDialog } from './usuarios-detalle-dialog';

describe('UsuariosDetalleDialog', () => {
  let component: UsuariosDetalleDialog;
  let fixture: ComponentFixture<UsuariosDetalleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosDetalleDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosDetalleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
