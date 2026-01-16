import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisConsultasPacientePageRoutingModule } from './mis-consultas-paciente-routing.module';

import { MisConsultasPacientePage } from './mis-consultas-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisConsultasPacientePageRoutingModule,
    MisConsultasPacientePage
  ]
})
export class MisConsultasPacientePageModule { }
