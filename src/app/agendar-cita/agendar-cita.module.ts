import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgendarCitaPageRoutingModule } from './agendar-cita-routing.module';

import { AgendarCitaPage } from './agendar-cita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // NECESARIO para [(ngModel)] y formularios
    IonicModule, // NECESARIO para <ion-header>, <ion-select>, etc.
    AgendarCitaPageRoutingModule,
    AgendarCitaPage
  ],
  // Nota: Si tu proyecto no utiliza el patrón Standalone, esta línea DEBE ESTAR COMENTADA O ELIMINADA:
  // declarations: [AgendarCitaPage]
})
export class AgendarCitaPageModule {}
