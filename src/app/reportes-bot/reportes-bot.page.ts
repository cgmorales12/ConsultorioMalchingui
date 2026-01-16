/**
 * Reportes Bot Page (Entrenamiento y Métricas)
 * 
 * Descripción: Dashboard de análisis del desempeño del Chatbot.
 * Muestra calificaciones promedio y permite al administrador "entrenar" al bot
 * respondiendo preguntas que el sistema no pudo contestar.
 * 
 * Uso: Administradores.
 */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reportes-bot',
  templateUrl: './reportes-bot.page.html',
  styleUrls: ['./reportes-bot.page.scss'],
  standalone: false
})
export class ReportesBotPage implements OnInit {

  promedioBot: number = 0;
  totalVotos: number = 0;
  dudasNoResueltas: any[] = [];
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController // 🚨 Inyectado para el entrenamiento
  ) { }

  ngOnInit() {
    this.cargarEstadisticas();
  }

  async cargarEstadisticas(event?: any) {
    this.cargando = true;
    this.authService.getReporteChatbot().subscribe({
      next: (res: any) => {
        this.promedioBot = res.stats?.promedio || 0;
        this.totalVotos = res.stats?.total_votos || 0;
        this.dudasNoResueltas = res.preguntas_fallidas || [];
        this.cargando = false;
        if (event) event.target.complete();
      },
      error: async (err: any) => {
        this.cargando = false;
        if (event) event.target.complete();
        const toast = await this.toastController.create({
          message: 'Error al conectar con el servidor',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  /**
   * 🎓 MÉTODO DE ENTRENAMIENTO
   * Abre una alerta para ingresar la respuesta a una duda no resuelta
   */
  async abrirEntrenador(duda: any) {
    const alert = await this.alertController.create({
      header: 'Entrenar Asistente',
      subHeader: `Pregunta: "${duda.pregunta_usuario}"`,
      message: 'Define la respuesta oficial para esta consulta.',
      inputs: [
        {
          name: 'respuesta_nueva',
          type: 'textarea',
          placeholder: 'Escribe aquí la respuesta...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar Conocimiento',
          handler: (data) => {
            if (!data.respuesta_nueva.trim()) return false;
            // Pasamos el ID del registro en el historial (id_bot)
            this.guardarConocimiento(duda.pregunta_usuario, data.respuesta_nueva, duda.id_bot);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private guardarConocimiento(pregunta: string, respuesta: string, id_historial: number) {
    this.authService.entrenarBot(pregunta, respuesta, id_historial).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: '¡Bot entrenado! El conocimiento se guardó correctamente.',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        toast.present();
        this.cargarEstadisticas(); // Recargamos para ver cambios
      }
    });
  }

  doRefresh(event: any) {
    this.cargarEstadisticas(event);
  }
}
