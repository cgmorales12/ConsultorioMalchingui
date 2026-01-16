import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultasMedicoPage } from './consultas-medico.page';

describe('ConsultasMedicoPage', () => {
  let component: ConsultasMedicoPage;
  let fixture: ComponentFixture<ConsultasMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultasMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
