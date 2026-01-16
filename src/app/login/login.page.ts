/**
 * Login Page (Página de Acceso Administrativo/Médico)
 * 
 * Descripción: Pantalla de inicio de sesión para Personal (Médicos y Administradores).
 * Valida credenciales contra la tabla 'usuarios' y redirige según el rol (Sistema o Médicos).
 * 
 * Uso: Solo para personal autorizado.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { IonicModule, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credenciales = {
    usuario: '',
    clave: ''
  };

  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
    private toastController: ToastController
  ) { }

  isAlreadyLoggedIn: boolean = false;
  usuarioActivo: string = '';

  ngOnInit() { }

  ionViewWillEnter() {
    // 1. Limpieza de seguridad SOLO si NO hay sesión válida en RAM/SessionStorage
    // Si ya hay sesión, NO limpiamos para permitir "Continuar Sesión"
    const session = this.authService.getSession();

    if (session.id_usuario && session.id_rol) {
      this.isAlreadyLoggedIn = true;
      this.usuarioActivo = session.usuario || 'Usuario';
    } else {
      this.isAlreadyLoggedIn = false;
      this.usuarioActivo = '';
      // Limpiamos rastros viejos si no hay sesión activa
      localStorage.clear();
    }
  }

  continuarSesion() {
    const session = this.authService.getSession();
    if (session.id_rol === 1) {
      this.navCtrl.navigateRoot('/sistema', { animated: true });
    } else if (session.id_rol === 2) {
      this.navCtrl.navigateRoot('/medicos', { animated: true });
    }
  }

  logout() {
    this.authService.logoutSession();
    this.isAlreadyLoggedIn = false;
    this.usuarioActivo = '';
    this.credenciales = { usuario: '', clave: '' };
    this.mostrarToast('Sesión cerrada.', 'primary');
  }

  regresarHome() {
    this.navCtrl.navigateRoot('/home');
  }

  onLogin() {
    if (!this.credenciales.usuario || !this.credenciales.clave) {
      this.error = 'Por favor, ingrese usuario y clave.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.authService.login(this.credenciales).subscribe({
      next: async (res: any) => {
        if (res && res.status === 'success') {
          const datos = res.data || res;
          // DEBUG PROVISIONAL: Mostrar datos crudos para ver si llega id_usuario
          // alert('Datos recibidos: ' + JSON.stringify(datos));
          console.log('Login Response:', datos);

          let idRol = parseInt(datos.id_rol || datos.id_rol_usuario);
          console.log('Parsed idRol:', idRol);

          if (isNaN(idRol)) {
            const rolTexto = String(datos.rol || datos.nombre_rol || "").toLowerCase();
            if (rolTexto.includes('sistema')) idRol = 1;
            if (rolTexto.includes('medico')) idRol = 2;
          }

          if (isNaN(idRol)) {
            this.isLoading = false;
            this.error = 'Error: No se pudo identificar el rol.';
            return;
          }

          const userId = parseInt(datos.id_usuario);
          console.log('Parsed userId:', userId);

          // 🚨 Pasamos también el id_medico si viene en la respuesta
          const medicoId = datos.id_medico ? parseInt(datos.id_medico) : undefined;

          this.authService.setSession(userId, idRol, datos.usuario, medicoId);
          console.log('Session set via AuthService with MedicoID:', medicoId);

          this.mostrarToast(`¡Bienvenido(a) ${datos.usuario}!`, 'success');

          setTimeout(() => {
            this.isLoading = false;
            // Usar Router con replaceUrl para evitar historial sucio
            if (idRol === 1) {
              this.router.navigate(['/sistema'], { replaceUrl: true });
            } else if (idRol === 2) {
              this.router.navigate(['/medicos'], { replaceUrl: true });
            }
          }, 500);

        } else {
          this.isLoading = false;
          this.error = res.message || 'Credenciales incorrectas.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = 'Error de conexión con el servidor.';
        console.error("Error Login:", err);
      }
    });
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}