import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesBotPageRoutingModule } from './reportes-bot-routing.module';

import { ReportesBotPage } from './reportes-bot.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportesBotPageRoutingModule
  ],
  declarations: [ReportesBotPage]
})
export class ReportesBotPageModule {}
