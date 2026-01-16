import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionDisponibilidadMedicoPage } from './gestion-disponibilidad-medico.page';

describe('GestionDisponibilidadMedicoPage', () => {
  let component: GestionDisponibilidadMedicoPage;
  let fixture: ComponentFixture<GestionDisponibilidadMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionDisponibilidadMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
