import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisConsultasPacientePage } from './mis-consultas-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: MisConsultasPacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisConsultasPacientePageRoutingModule {}
