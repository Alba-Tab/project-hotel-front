import { ComponentFixture, TestBed } from '@angular/core/testing';

import { configuracionApariencia } from './configuracion-apariencia';

describe('ConfiguracionApariencia', () => {
  let component: configuracionApariencia;
  let fixture: ComponentFixture<configuracionApariencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [configuracionApariencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(configuracionApariencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
