import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionLoginUsuariosPageRoutingModule } from './gestion-login-usuarios-routing.module';

import { GestionLoginUsuariosPage } from './gestion-login-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionLoginUsuariosPageRoutingModule,
    GestionLoginUsuariosPage
  ],
  declarations: []
})
export class GestionLoginUsuariosPageModule {}
