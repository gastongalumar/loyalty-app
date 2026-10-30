import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  DEFAULT_REWARD_ICON,
  EMOJI_GROUPS,
  EmojiGroup
} from '../../utils/emoji-catalog';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.css']
})
export class EmojiPickerComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  readonly groups: EmojiGroup[] = EMOJI_GROUPS;
  activeKey = EMOJI_GROUPS[0].key;
  open = false;

  get activeGroup(): EmojiGroup {
    return this.groups.find(group => group.key === this.activeKey) ?? this.groups[0];
  }

  toggle(): void {
    this.open = !this.open;
  }

  selectGroup(key: string): void {
    this.activeKey = key;
  }

  pick(emoji: string): void {
    this.value = emoji;
    this.valueChange.emit(emoji);
    this.open = false;
  }

  get displayValue(): string {
    return this.value || DEFAULT_REWARD_ICON;
  }
}
