import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Añadido aquí

import { IonicModule } from '@ionic/angular';

import { GestionDisponibilidadMedicoPageRoutingModule } from './gestion-disponibilidad-medico-routing.module';

import { GestionDisponibilidadMedicoPage } from './gestion-disponibilidad-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // <--- Correcto
    IonicModule,
    GestionDisponibilidadMedicoPageRoutingModule,
    GestionDisponibilidadMedicoPage
  ],
  declarations: []
})
export class GestionDisponibilidadMedicoPageModule {}
