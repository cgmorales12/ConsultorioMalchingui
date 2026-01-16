import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPacientePage } from './registro-paciente.page';

describe('RegistroPacientePage', () => {
  let component: RegistroPacientePage;
  let fixture: ComponentFixture<RegistroPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
