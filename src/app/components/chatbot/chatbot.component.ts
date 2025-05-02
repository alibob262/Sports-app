import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent {
  userMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;

  private chatbotService = inject(ChatbotService);

  sendMessage() {
    if (!this.userMessage.trim()) {
      this.addBotMessage('Please enter a message!');
      return;
    }

    // Add user message to chat
    this.addUserMessage(this.userMessage);
    const currentMessage = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    this.chatbotService.sendChatMessage(currentMessage).pipe(
      switchMap(openAIResponse => {
        if (currentMessage.toLowerCase().includes('looking for a team')) {
          return this.chatbotService.getAvailablePlayers().pipe(
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
        this.addBotMessage(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.addBotMessage('Sorry, I could not process your request.');
        this.isLoading = false;
      }
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string) {
    this.messages.push({
      sender: 'bot',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.querySelector('.messages-container');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
  }

  private formatPlayerRequests(requests: any[]): string {
    return requests.map(request => 
      `Name: ${request.userName}\nSport: ${request.sport}\nPosition: ${request.position}\n\n`
    ).join('');
  }
}