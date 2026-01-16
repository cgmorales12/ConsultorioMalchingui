/**
 * Mis Consultas Page (Telemedicina Paciente)
 * 
 * Descripción: Chat de Telemedicina para el paciente.
 * Permite enviar consultas escritas a médicos seleccionados y ver sus respuestas.
 * Valida reglas de negocio (no enviar si hay pendiente).
 * 
 * Uso: Pacientes logueados.
 */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-mis-consultas-paciente',
  templateUrl: './mis-consultas-paciente.page.html',
  styleUrls: ['./mis-consultas-paciente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MisConsultasPacientePage implements OnInit {

  consultas: any[] = [];
  isLoading: boolean = false;

  // Nuevas propiedades
  medicos: any[] = [];
  nuevoMensaje: string = '';
  medicoSeleccionado: number | null = null;

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarMisConsultas();
    this.cargarMedicos();
  }

  cargarMedicos() {
    this.authService.getMedicos().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.medicos = res.data;
        }
      },
      error: (err) => console.error('Error cargando médicos:', err)
    });
  }

  async enviarConsulta() {
    console.log('--- INTENTO ENVIAR CONSULTA ---');
    console.log('Medico:', this.medicoSeleccionado);
    console.log('Mensaje:', this.nuevoMensaje);

    if (!this.medicoSeleccionado || !this.nuevoMensaje.trim()) {
      console.log('Validación fallida: Faltan datos');
      const toast = await this.toastController.create({
        message: 'Por favor selecciona un médico y escribe tu consulta.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // 🚨 VALIDACIÓN: REGLAS DE NEGOCIO (Pendiente / Consultorio)
    const historialMedico = this.consultas.filter(c => c.id_medico == this.medicoSeleccionado);

    // 1. Verificar si tiene una pendiente
    const tienePendiente = historialMedico.find(c => c.estado === 'pendiente');
    if (tienePendiente) {
      const toast = await this.toastController.create({
        message: '⚠️ Ya tienes una consulta PENDIENTE con este médico. Debes esperar su respuesta antes de enviar otra.',
        duration: 4000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    // 2. Verificar si el médico le mandó al consultorio
    const bloqueoConsultorio = historialMedico.find(c => c.respuesta_medico && c.respuesta_medico.toLowerCase().includes('consultorio'));
    if (bloqueoConsultorio) {
      const toast = await this.toastController.create({
        message: '🚫 El médico indicó que debes ACUDIR AL CONSULTORIO. Por favor agenda una cita presencial.',
        duration: 5000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const session = this.authService.getSession();
    console.log('Sesión:', session);

    if (!session.id_usuario) {
      console.error('No hay ID de usuario en sesión');
      return;
    }

    this.isLoading = true;
    this.authService.enviarConsultaTelemedicina(Number(session.id_usuario), this.medicoSeleccionado, this.nuevoMensaje).subscribe({
      next: async (res: any) => {
        console.log('Respuesta servidor:', res);
        this.isLoading = false;
        if (res.status === 'success') {
          const toast = await this.toastController.create({
            message: 'Consulta enviada correctamente.',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.nuevoMensaje = '';
          this.medicoSeleccionado = null;
          this.cargarMisConsultas();
        } else {
          const toast = await this.toastController.create({
            message: 'Error al enviar: ' + res.message,
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
        }
      },
      error: async (err) => {
        console.error('Error HTTP:', err);
        this.isLoading = false;
        const toast = await this.toastController.create({
          message: 'Error de conexión.',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  cargarMisConsultas() {
    this.isLoading = true;
    const session = this.authService.getSession();
    const idUsuario = session.id_usuario;

    if (idUsuario) {
      this.authService.getConsultasPaciente(Number(idUsuario)).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.status === 'success') {
            this.consultas = res.data;
          } else {
            // Si el backend responde pero con error/vacío
            console.log('No se encontraron consultas o error:', res);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error al cargar consultas:', err);
        }
      });
    } else {
      // Si no hay sesión, dejar de cargar y (opcional) redirigir
      this.isLoading = false;
      console.warn('Usuario no identificado');
    }
  }

  // Para refrescar la lista deslizando hacia abajo
  doRefresh(event: any) {
    this.cargarMisConsultas();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
