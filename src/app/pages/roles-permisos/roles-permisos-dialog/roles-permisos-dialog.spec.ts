import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPermisosDialog } from './roles-permisos-dialog';

describe('RolesPermisosDialog', () => {
  let component: RolesPermisosDialog;
  let fixture: ComponentFixture<RolesPermisosDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPermisosDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesPermisosDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
