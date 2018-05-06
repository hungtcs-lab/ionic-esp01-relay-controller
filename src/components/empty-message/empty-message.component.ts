import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-message',
  template: `<div>{{ message || '无内容' }}</div>`,
})
export class EmptyMessageComponent {
  @Input('message')
  message: string;

}
