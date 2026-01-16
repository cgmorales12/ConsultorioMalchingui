/**
 * Consultas Médico Page (Telemedicina para Médicos)
 * 
 * Descripción: Bandeja de entrada de consultas de telemedicina.
 * Permite al médico ver mensajes de pacientes y responderlos.
 * 
 * Uso: Médicos logueados.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-consultas-medico',
  templateUrl: './consultas-medico.page.html',
  styleUrls: ['./consultas-medico.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ConsultasMedicoPage implements OnInit {

  mensajes: any[] = [];
  id_medico: number = 0; // Se debe obtener del login/localStorage

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Recuperar el ID del usuario logueado (priorizando id_medico)
    const session = this.authService.getSession();

    // 🚨 CORRECCIÓN: Priorizar id_medico real sobre id_usuario
    if (session.id_medico) {
      this.id_medico = Number(session.id_medico);
    } else {
      this.id_medico = session.id_usuario ? Number(session.id_usuario) : 0;
    }

    this.loadConsultas();
  }

  loadConsultas() {
    this.authService.getConsultasParaMedico(this.id_medico).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.mensajes = res.data;
        }
      },
      error: (err: any) => console.error('Error al cargar mensajes', err)
    });
  }

  async responderConsulta(id_mensaje: number) {
    const alert = await this.alertController.create({
      header: 'Responder Consulta',
      inputs: [
        {
          name: 'respuesta',
          type: 'textarea',
          placeholder: 'Escriba las indicaciones para el paciente...'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Respuesta',
          handler: (data) => {
            if (data.respuesta) {
              this.enviarRespuesta(id_mensaje, data.respuesta);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  enviarRespuesta(id_mensaje: number, respuesta: string) {
    this.authService.responderConsulta(id_mensaje, respuesta).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.presentToast('Respuesta enviada con éxito', 'success');
          this.loadConsultas(); // Recargar lista
        }
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: color
    });
    toast.present();
  }
}
