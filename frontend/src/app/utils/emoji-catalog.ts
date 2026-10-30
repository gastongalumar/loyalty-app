/**
 * Catálogo curado de iconos para sellos y recompensas.
 * Son emojis con textura y buen trazo, lejos de los clásicos de chat.
 */
export interface EmojiGroup {
  key: string;
  labelKey: string;
  emojis: string[];
}

export const DEFAULT_STAMP_ICON = '☕';
export const DEFAULT_REWARD_ICON = '🏆';

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    key: 'coffee',
    labelKey: 'EMOJI.COFFEE',
    emojis: ['☕', '🫖', '🥐', '🥨', '🧁', '🍰', '🍪', '🍩', '🧋', '🍵', '🥂', '🍯']
  },
  {
    key: 'nature',
    labelKey: 'EMOJI.NATURE',
    emojis: ['✨', '🌿', '🍃', '🌸', '🪷', '🌷', '🌻', '🌙', '☀️', '🪴', '🌾', '🕊️']
  },
  {
    key: 'hearts',
    labelKey: 'EMOJI.HEARTS',
    emojis: ['🤍', '🩵', '💜', '💚', '🧡', '💛', '🩷', '🫶', '💫']
  },
  {
    key: 'rewards',
    labelKey: 'EMOJI.REWARDS',
    emojis: ['🎁', '🎀', '🏆', '🥇', '🧧', '🎊', '🪅', '🎯', '🔖', '🪄', '⭐', '🌟']
  },
  {
    key: 'food',
    labelKey: 'EMOJI.FOOD',
    emojis: ['🥑', '🍓', '🍒', '🍋', '🥥', '🍕', '🍣', '🍦', '🍫', '🍿', '🥗', '🍔']
  },
  {
    key: 'beauty',
    labelKey: 'EMOJI.BEAUTY',
    emojis: ['💅', '💄', '🧴', '🪞', '🕯️', '🧼', '🪮', '🧖']
  },
  {
    key: 'pets',
    labelKey: 'EMOJI.PETS',
    emojis: ['🐾', '🐶', '🐱', '🦴', '🐇', '🐦', '🐢']
  },
  {
    key: 'fitness',
    labelKey: 'EMOJI.FITNESS',
    emojis: ['🧘', '🏋️', '🚴', '💪', '🎾', '🏃', '🤸']
  },
  {
    key: 'shop',
    labelKey: 'EMOJI.SHOP',
    emojis: ['🛍️', '👗', '👟', '💎', '🕶️', '👜', '🎨', '🧵']
  }
];
