import { CharacterDef, CharacterExpression } from '../vn/types';
import { t } from '../i18n';

export const CHARACTERS: Record<string, CharacterDef> = {
  player: {
    id: 'player',
    nameKey: 'character.player.name',
    roleKey: 'character.player.role',
    color: '#4a90d9',
    expressions: ['normal', 'happy', 'thinking', 'surprised'] as CharacterExpression[],
  },
  mentor: {
    id: 'mentor',
    nameKey: 'character.mentor.name',
    roleKey: 'character.mentor.role',
    color: '#ffd700',
    expressions: ['normal', 'happy', 'thinking', 'surprised'] as CharacterExpression[],
  },
  supplier: {
    id: 'supplier',
    nameKey: 'character.supplier.name',
    roleKey: 'character.supplier.role',
    color: '#e94560',
    expressions: ['normal', 'happy', 'thinking'] as CharacterExpression[],
  },
  customer: {
    id: 'customer',
    nameKey: 'character.customer.name',
    roleKey: 'character.customer.role',
    color: '#81c784',
    expressions: ['normal', 'happy', 'surprised'] as CharacterExpression[],
  },
  banker: {
    id: 'banker',
    nameKey: 'character.banker.name',
    roleKey: 'character.banker.role',
    color: '#9b4ad9',
    expressions: ['normal', 'happy', 'thinking', 'surprised'] as CharacterExpression[],
  },
  employee: {
    id: 'employee',
    nameKey: 'character.employee.name',
    roleKey: 'character.employee.role',
    color: '#4dd0e1',
    expressions: ['normal', 'happy', 'sad'] as CharacterExpression[],
  },
  taxman: {
    id: 'taxman',
    nameKey: 'character.taxman.name',
    roleKey: 'character.taxman.role',
    color: '#808080',
    expressions: ['normal', 'thinking'] as CharacterExpression[],
  },
};

export function getCharacter(id: string): CharacterDef | undefined {
  return CHARACTERS[id];
}

export function getCharacterName(id: string): string {
  const char = CHARACTERS[id];
  if (!char) return id;
  return t(char.nameKey);
}
