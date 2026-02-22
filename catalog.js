// Каталог предметов интерьера
export const catalog = {
    seating: [
        { id: 'chair1', name: 'Кресло Classic', icon: '🪑', category: 'seating', color: '#c47e5a' },
        { id: 'chair2', name: 'Диван Modern', icon: '🛋️', category: 'seating', color: '#5a6b7a' },
        { id: 'chair3', name: 'Кресло-мешок', icon: '🪑', category: 'seating', color: '#7a5a4a' },
        { id: 'chair4', name: 'Стул Eames', icon: '💺', category: 'seating', color: '#2a3a4a' },
        { id: 'chair5', name: 'Пуфик', icon: '⬜', category: 'seating', color: '#8a6d5a' },
        { id: 'chair6', name: 'Кресло-качалка', icon: '🪑', category: 'seating', color: '#6b4f3c' },
        { id: 'chair7', name: 'Банкетка', icon: '🪑', category: 'seating', color: '#3a4a5a' },
        { id: 'chair8', name: 'Табурет', icon: '🪑', category: 'seating', color: '#8b5a2b' },
        { id: 'chair9', name: 'Офисное кресло', icon: '💺', category: 'seating', color: '#2a3a4a' },
        { id: 'chair10', name: 'Шезлонг', icon: '🛋️', category: 'seating', color: '#c49a6c' },
    ],
    
    lighting: [
        { id: 'lamp1', name: 'Торшер', icon: '💡', category: 'lighting', color: '#eeddcc' },
        { id: 'lamp2', name: 'Люстра', icon: '💡', category: 'lighting', color: '#ffaa55' },
        { id: 'lamp3', name: 'Настольная лампа', icon: '🪔', category: 'lighting', color: '#aaccff' },
        { id: 'lamp4', name: 'Бра', icon: '💡', category: 'lighting', color: '#ccaa88' },
        { id: 'lamp5', name: 'Спот', icon: '🔦', category: 'lighting', color: '#888888' },
        { id: 'lamp6', name: 'Подвесной свет', icon: '💡', category: 'lighting', color: '#ffaa88' },
        { id: 'lamp7', name: 'LED-лента', icon: '✨', category: 'lighting', color: '#88aaff' },
    ],
    
    decor: [
        { id: 'decor1', name: 'Ваза', icon: '🏺', category: 'decor', color: '#5a7a9a' },
        { id: 'decor2', name: 'Картина', icon: '🖼️', category: 'decor', color: '#9a7a5a' },
        { id: 'decor3', name: 'Зеркало', icon: '🪞', category: 'decor', color: '#cccccc' },
        { id: 'decor4', name: 'Часы', icon: '⏰', category: 'decor', color: '#8b7d6b' },
        { id: 'decor5', name: 'Ковер', icon: '🧶', category: 'decor', color: '#6a5a4a' },
        { id: 'decor6', name: 'Подушка', icon: '🛏️', category: 'decor', color: '#c48a5a' },
        { id: 'decor7', name: 'Плед', icon: '🧣', category: 'decor', color: '#8a5a4a' },
        { id: 'decor8', name: 'Свеча', icon: '🕯️', category: 'decor', color: '#f0e68c' },
        { id: 'decor9', name: 'Книги', icon: '📚', category: 'decor', color: '#8b4513' },
        { id: 'decor10', name: 'Растение', icon: '🌿', category: 'decor', color: '#2e8b57' },
        { id: 'decor11', name: 'Фикус', icon: '🌴', category: 'decor', color: '#228b22' },
        { id: 'decor12', name: 'Кактус', icon: '🌵', category: 'decor', color: '#5f9f4f' },
    ],
    
    electronics: [
        { id: 'tv1', name: 'Телевизор', icon: '📺', category: 'electronics', color: '#2a2a2a' },
        { id: 'audio1', name: 'Колонка', icon: '🔊', category: 'electronics', color: '#3a3a3a' },
        { id: 'audio2', name: 'Вертушка', icon: '📀', category: 'electronics', color: '#4a3a2a' },
        { id: 'comp1', name: 'Монитор', icon: '🖥️', category: 'electronics', color: '#1a1a2a' },
        { id: 'comp2', name: 'Ноутбук', icon: '💻', category: 'electronics', color: '#2a2a3a' },
        { id: 'game1', name: 'Приставка', icon: '🎮', category: 'electronics', color: '#2a3a2a' },
        { id: 'kitchen1', name: 'Холодильник', icon: '🧊', category: 'electronics', color: '#f0f0f0' },
        { id: 'kitchen2', name: 'Микроволновка', icon: '📻', category: 'electronics', color: '#d3d3d3' },
    ],
    
    walls: [
        { id: 'wall1', name: 'Стена кирпич', icon: '🧱', category: 'walls', color: '#b85e3a' },
        { id: 'wall2', name: 'Стена дерево', icon: '🪵', category: 'walls', color: '#8b5a2b' },
        { id: 'wall3', name: 'Стеклянная', icon: '🪟', category: 'walls', color: '#aaccff' },
        { id: 'wall4', name: 'Гипсокартон', icon: '🧱', category: 'walls', color: '#c0c0c0' },
    ]
};

// Функция для получения всех предметов
export function getAllItems() {
    return [
        ...catalog.seating,
        ...catalog.lighting,
        ...catalog.decor,
        ...catalog.electronics,
        ...catalog.walls
    ];
}
