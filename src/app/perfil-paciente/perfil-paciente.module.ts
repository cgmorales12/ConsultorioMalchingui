import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPacientePageRoutingModule } from './perfil-paciente-routing.module';

import { PerfilPacientePage } from './perfil-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPacientePageRoutingModule
  ],
  declarations: []
})
export class PerfilPacientePageModule { }
