import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionDisponibilidadMedicoPage } from './gestion-disponibilidad-medico.page';

const routes: Routes = [
  {
    path: '',
    component: GestionDisponibilidadMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionDisponibilidadMedicoPageRoutingModule {}
