/**
 * Login Paciente Page (Acceso Pacientes)
 * 
 * Descripción: Pantalla de inicio de sesión exclusiva para Pacientes.
 * Permite ingresar con Cédula y Correo. Si es exitoso, guarda la sesión y redirige al perfil.
 * 
 * Uso: Pacientes registrados.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-paciente',
  templateUrl: './login-paciente.page.html',
  styleUrls: ['./login-paciente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPacientePage {
  cedula: string = '';
  correo: string = ''; // Esta variable se vincula al input de correo en el HTML

  isAlreadyLoggedIn: boolean = false;
  pacienteActivo: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ionViewWillEnter() {
    // 1. Limpieza de seguridad SOLO si NO hay sesión válida
    const sessionStr = sessionStorage.getItem('patient_session');

    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      this.isAlreadyLoggedIn = true;
      this.pacienteActivo = session.nombres || 'Paciente';
    } else {
      this.isAlreadyLoggedIn = false;
      this.pacienteActivo = '';
      // Limpiamos rastros viejos
      localStorage.clear();
      sessionStorage.removeItem('patient_session');
    }
  }

  continuarSesion() {
    this.router.navigate(['/perfil-paciente']);
  }

  logout() {
    sessionStorage.removeItem('patient_session');
    this.isAlreadyLoggedIn = false;
    this.pacienteActivo = '';
    this.cedula = '';
    this.correo = '';
    this.presentToast('Sesión cerrada.', 'primary');
  }

  async ingresar() {
    if (!this.cedula || !this.correo) {
      this.presentToast('Por favor, llena ambos campos.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Validando datos...' });
    await loading.present();

    // 🚨 Sincronización: Enviamos 'correo' al servicio para que el backend lo reciba correctamente
    this.authService.loginPaciente(this.cedula, this.correo).subscribe({
      next: (res: any) => {
        loading.dismiss();

        // ✅ Validación de seguridad para evitar errores si el servidor responde null
        if (res && res.status === 'success') {
          // Guardamos sesión en SessionStorage (Volátil)
          const pacienteData = res.data;
          sessionStorage.setItem('patient_session', JSON.stringify(pacienteData));

          this.presentToast(`¡Bienvenido(a), ${res.data.nombres}!`, 'success');
          this.router.navigate(['/perfil-paciente']);
        } else {
          const msg = res ? res.message : 'Credenciales incorrectas.';
          this.presentToast(msg, 'danger');
        }
      },
      error: (err: any) => {
        loading.dismiss();
        console.error('Error de conexión:', err);
        this.presentToast('Error de conexión con el servidor.', 'danger');
      }
    });
  }

  /**
   * 🚨 SOLUCIÓN AL ERROR DE COMPILACIÓN
   * Esta función ahora existe para que el HTML pueda llamarla
   */
  irARegistro() {
    this.router.navigate(['/registro-paciente']);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
