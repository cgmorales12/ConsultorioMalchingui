import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesBotPage } from './reportes-bot.page';

describe('ReportesBotPage', () => {
  let component: ReportesBotPage;
  let fixture: ComponentFixture<ReportesBotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesBotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
