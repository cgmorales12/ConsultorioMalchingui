import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPacientePageRoutingModule } from './login-paciente-routing.module';

import { LoginPacientePage } from './login-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPacientePageRoutingModule
  ],
  declarations: []
})
export class LoginPacientePageModule { }
