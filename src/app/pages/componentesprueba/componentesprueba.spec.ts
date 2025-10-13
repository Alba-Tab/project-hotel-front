import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Componentesprueba } from './componentesprueba';

describe('Componentesprueba', () => {
  let component: Componentesprueba;
  let fixture: ComponentFixture<Componentesprueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Componentesprueba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Componentesprueba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
