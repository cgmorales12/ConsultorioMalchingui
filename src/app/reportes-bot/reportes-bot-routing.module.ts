import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportesBotPage } from './reportes-bot.page';

const routes: Routes = [
  {
    path: '',
    component: ReportesBotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesBotPageRoutingModule {}
