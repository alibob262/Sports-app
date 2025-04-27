import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  userMessage = '';
  chatbotResponse = '';
  isLoading = false;

  private chatbotService = inject(ChatbotService);

  sendMessage() {
    if (!this.userMessage.trim()) {
      this.chatbotResponse = 'Please enter a message!';
      return;
    }

    this.isLoading = true;

    this.chatbotService.sendChatMessage(this.userMessage).pipe(
      switchMap(openAIResponse => {
        if (this.userMessage.toLowerCase().includes('looking for a team')) {
          return this.chatbotService.getPlayerRequests().pipe(
            map(requests => {
              if (requests.length === 0) {
                return 'No players are currently looking for teams.';
              }
              return this.formatPlayerRequests(requests);
            })
          );
        } else {
          return of(openAIResponse);
        }
      })
    ).subscribe({
      next: (response) => {
        this.chatbotResponse = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.chatbotResponse = 'Sorry, I could not process your request.';
        this.isLoading = false;
      }
    });
  }

  private formatPlayerRequests(requests: any[]): string {
    return requests.map(request => 
      `Name: ${request.userName}\nSport: ${request.sport}\nPosition: ${request.position}\n\n`
    ).join('');
  }
}