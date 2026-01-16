/**
 * Chatbot Page (Asistente Virtual)
 * 
 * Descripción: Interfaz de chat con el asistente virtual IA.
 * Permite a los usuarios realizar preguntas frecuentes y recibir respuestas automáticas
 * basadas en la base de conocimientos del consultorio.
 * 
 * Uso: Público general y Pacientes.
 */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonContent, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ChatbotPage {
  @ViewChild(IonContent) content!: IonContent;
  mensajes: any[] = [{ text: 'Hola, ¿en qué puedo ayudarte?', sender: 'bot', date: new Date() }];
  nuevoMensaje: string = '';
  isTyping: boolean = false;

  constructor(private authService: AuthService, private toast: ToastController) { }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;
    const id_p = this.authService.getSession().id_usuario;
    const text = this.nuevoMensaje;
    this.mensajes.push({ text, sender: 'user', date: new Date() });
    this.nuevoMensaje = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.authService.getChatbotRespuesta(text, id_p || 0).subscribe({
      next: (res) => {
        this.isTyping = false;
        if (res && res.respuesta) {
          this.mensajes.push({
            text: res.respuesta,
            sender: 'bot',
            date: new Date(),
            mostrarEstrellas: res.mostrarEstrellas
          });
        } else {
          // MOSTRAR ERROR REAL DEL BACKEND SI EXISTE
          const errorMsg = (res && res.message) ? `Error del servidor: ${res.message}` : "Lo siento, hubo un error al procesar tu solicitud.";
          this.mensajes.push({ text: errorMsg, sender: 'bot', date: new Date() });
        }
        this.scrollToBottom();
      },
      error: (err: any) => {
        this.isTyping = false;
        console.error('Chatbot Error:', err);

        let msg = `Error (${err.status}): `;
        if (err.status === 0) msg += 'Sin conexión (XAMPP apagado o CORS).';
        else if (err.status === 404) msg += 'Archivo PHP no encontrado.';
        else if (err.status === 200) msg += 'Error de respuesta (Posible error JSON).';
        else msg += err.statusText || 'Error desconocido.';

        if (err.error && err.error.message) {
          msg += '\nDetalle: ' + err.error.message;
        } else if (err.message) {
          msg += '\n' + err.message;
        }

        this.toast.create({
          message: msg.substring(0, 150), // Limit length
          duration: 8000,
          color: 'danger',
          position: 'bottom'
        }).then(t => t.present());
      }
    });
  }

  calificar(stars: number) {
    const id_p = this.authService.getSession().id_usuario;
    // Debes crear este método en auth.service.ts que apunte a guardar_valoracion_bot.php
    this.authService.guardarValoracionBot(id_p, stars).subscribe(async () => {
      const t = await this.toast.create({ message: '¡Gracias por tu calificación!', duration: 2000, color: 'success' });
      t.present();
      this.mensajes.push({ text: `Recibimos tus ${stars} estrellas. ¡Gracias!`, sender: 'bot', date: new Date() });
      this.scrollToBottom();
    });
  }

  scrollToBottom() { setTimeout(() => this.content.scrollToBottom(300), 100); }
}
