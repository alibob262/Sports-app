import { Component, inject } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

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
  isActive = true;
  private destroy$ = new Subject<void>();

  private chatbotService = inject(ChatbotService);

  ngOnInit() {
    this.addBotMessage('Welcome to Malaabna! 🏟️\nWhere sports dreams become reality!\n\nYalla, how can I help? Find courts, players, or teams?');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    this.addUserMessage(this.userMessage);
    const currentMessage = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    this.chatbotService.sendChatMessage(currentMessage).pipe(
      takeUntil(this.destroy$),
      debounceTime(300) // Prevent rapid firing
    ).subscribe({
      next: (response) => {
        this.addBotMessage(response);
        this.isLoading = false;
      },
      error: () => {
        this.addBotMessage("Yalla, something went wrong! Try again.");
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
}