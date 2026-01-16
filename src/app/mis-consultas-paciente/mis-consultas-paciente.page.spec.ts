import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisConsultasPacientePage } from './mis-consultas-paciente.page';

describe('MisConsultasPacientePage', () => {
  let component: MisConsultasPacientePage;
  let fixture: ComponentFixture<MisConsultasPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisConsultasPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
