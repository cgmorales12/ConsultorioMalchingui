/**
 * Gestión Login Usuarios Page
 * 
 * Descripción: Módulo para la gestión de cuentas de acceso al sistema.
 * Permite crear, editar y eliminar usuarios con roles (Administrador o Médico).
 * Vincula cuentas de usuario con registros de médicos.
 * 
 * Uso: Administradores.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-gestion-login-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './gestion-login-usuarios.page.html',
  styleUrls: ['./gestion-login-usuarios.page.scss'],
})
export class GestionLoginUsuariosPage implements OnInit {

  listaUsuarios: any[] = [];
  listaMedicos: any[] = []; // Lista para select
  accion: string = 'crear'; // Default, will be overwritten
  pageTitle: string = 'Gestión de Usuarios';

  // Modelo para la creación de usuario de Sistema
  nuevoUsuario: any = {
    usuario: '',
    clave: '',
    rol: 'administrador', // Default check
    id_medico: null
  };

  // Modelo para la edición de usuario 
  usuarioEnEdicion: any = null;

  isLoading: boolean = false;
  isSaving: boolean = false;
  message: string | null = null;
  error: boolean = false;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.accion = this.route.snapshot.paramMap.get('accion') || 'crear';
    this.setPageTitle();
    this.loadMedicos();

    if (this.accion === 'modificar' || this.accion === 'eliminar') {
      this.loadUsuariosList();
    }
  }

  loadMedicos() {
    this.authService.getMedicos().subscribe((res: any) => {
      if (res.status === 'success') {
        this.listaMedicos = res.data || [];
      }
    });
  }

  setPageTitle() {
    switch (this.accion) {
      case 'crear': this.pageTitle = 'Crear Nuevo Usuario'; break;
      case 'modificar': this.pageTitle = 'Modificar Usuarios'; break;
      case 'eliminar': this.pageTitle = 'Eliminar Usuarios'; break;
      default: this.pageTitle = 'Gestión de Usuarios';
    }
  }

  // =================================================================
  // --- CONSULTA (READ) ---
  // =================================================================
  loadUsuariosList() {
    this.isLoading = true;
    this.message = 'Cargando lista de usuarios...';
    this.error = false;

    this.authService.getAllUsuarios().subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.status === 'success') {
          this.listaUsuarios = res.data || [];
          this.message = res.data.length > 0 ? null : res.message;
        } else {
          this.message = res.message;
          this.error = true;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.message = 'Error de conexión con el servidor.';
        this.error = true;
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  // =================================================================
  // --- CREACIÓN (CREATE) ---
  // =================================================================
  onCreateSistemaUser() {
    if (this.accion !== 'crear') return;

    // Validaciones
    if (this.nuevoUsuario.rol === 'medico') {
      if (!this.nuevoUsuario.id_medico) {
        this.presentToast('Debe seleccionar un médico.', 'warning');
        return;
      }

      // Verificar si el médico ya tiene usuario
      const medicoSeleccionado = this.listaMedicos.find(m => m.id_medico === this.nuevoUsuario.id_medico);
      if (medicoSeleccionado && medicoSeleccionado.usuario && medicoSeleccionado.id_usuario) {
        this.alertController.create({
          header: 'Médico ya tiene usuario',
          message: `El Dr. ${medicoSeleccionado.nombres} ${medicoSeleccionado.apellidos} ya cuenta con el usuario: "${medicoSeleccionado.usuario}".\n\nNo es posible crear otro. Por favor, vaya a 'Modificar' si desea cambiar su contraseña.`,
          buttons: ['OK']
        }).then(alert => alert.present());
        return;
      }
    }

    this.isSaving = true;
    this.message = 'Creando usuario...';
    this.error = false;

    // Preparar payload
    const payload = {
      usuario: this.nuevoUsuario.usuario,
      clave: this.nuevoUsuario.clave,
      id_rol: this.nuevoUsuario.rol === 'medico' ? 2 : 1, // 1=Admin, 2=Medico
      id_medico: this.nuevoUsuario.rol === 'medico' ? this.nuevoUsuario.id_medico : null
    };

    this.authService.createSistemaUser(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast(res.message, 'success');
          // Reset completo
          this.nuevoUsuario = { usuario: '', clave: '', rol: 'administrador', id_medico: null };
          this.router.navigate(['/sistema']);
        } else {
          this.message = res.message;
          this.error = true;
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.message = 'Error de conexión con el servidor.';
        this.error = true;
        console.error('Error al crear usuario:', err);
      }
    });
  }

  // =================================================================
  // --- MODIFICACIÓN (UPDATE) ---
  // =================================================================

  onEdit(usuario: any) {
    this.usuarioEnEdicion = {
      id_usuario: usuario.id_usuario,
      usuario: usuario.usuario,
      clave: '',
      nombre_rol: usuario.nombre_rol
    };
    // Cambiamos temporalmente a modo edición sin perder el contexto de 'modificar'
    // Pero para simplificar la vista, usaremos una variable auxiliar o controlaremos con *ngIf
  }

  onUpdateUsuario() {
    this.isSaving = true;
    this.message = 'Actualizando usuario...';
    this.error = false;

    this.authService.updateUsuario(this.usuarioEnEdicion).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast(res.message, 'success');
          this.usuarioEnEdicion = null;
          this.loadUsuariosList();
        } else {
          this.presentToast(res.message, 'danger');
          this.error = true;
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.message = 'Error de conexión con el servidor.';
        this.error = true;
        console.error('Error al actualizar usuario:', err);
      }
    });
  }


  // =================================================================
  // --- ELIMINACIÓN (DELETE) ---
  // =================================================================
  async onDelete(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `ADVERTENCIA: ¿Está seguro de eliminar al usuario **${usuario.usuario}** (${usuario.nombre_rol})? Esto impedirá su acceso.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.executeDeleteUsuario(usuario.id_usuario);
          }
        }
      ]
    });
    await alert.present();
  }

  executeDeleteUsuario(idUsuario: number) {
    this.isSaving = true;
    this.message = 'Eliminando usuario...';
    this.error = false;

    this.authService.deleteUsuario(idUsuario).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast(res.message, 'success');
          this.loadUsuariosList();
        } else {
          this.message = res.message;
          this.error = true;
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        // La línea que causaba el error fue corregida aquí:
        this.message = 'Error de conexión con el servidor.';
        this.error = true;
        console.error('Error al eliminar usuario:', err);
      }
    });
  }

  // =================================================================
  // --- UTILIDADES (Función presentToast agregada) ---
  // =================================================================
  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Cambia la acción y recarga la lista si no es la acción 'crear'.
   */
  onSelectAction(newAccion: string) {
    this.accion = newAccion;
    if (newAccion !== 'crear') {
      this.loadUsuariosList();
    }
    this.message = null;
    this.error = false;
    this.usuarioEnEdicion = null; // Limpiar el modelo de edición
  }
}
