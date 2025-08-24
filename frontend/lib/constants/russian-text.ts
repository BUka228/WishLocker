// Russian language constants for the Wish Bank application

export const RUSSIAN_TEXT = {
  // Navigation
  navigation: {
    home: 'Главная',
    wishes: 'Желания',
    friends: 'Друзья',
    transactions: 'История',
    achievements: 'Достижения',
    profile: 'Профиль',
    settings: 'Настройки',
    signOut: 'Выйти'
  },

  // Common actions
  actions: {
    create: 'Создать',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отменить',
    confirm: 'Подтвердить',
    accept: 'Принять',
    reject: 'Отклонить',
    complete: 'Завершить',
    dispute: 'Оспорить',
    send: 'Отправить',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    retry: 'Попробовать снова',
    refresh: 'Обновить',
    search: 'Поиск',
    filter: 'Фильтр',
    sort: 'Сортировка',
    view: 'Просмотр',
    share: 'Поделиться',
    copy: 'Копировать',
    download: 'Скачать',
    upload: 'Загрузить'
  },

  // Status messages
  status: {
    loading: 'Загрузка...',
    saving: 'Сохранение...',
    success: 'Успешно!',
    error: 'Ошибка',
    warning: 'Предупреждение',
    info: 'Информация',
    noData: 'Нет данных',
    empty: 'Пусто',
    notFound: 'Не найдено',
    unauthorized: 'Нет доступа',
    forbidden: 'Запрещено',
    serverError: 'Ошибка сервера',
    networkError: 'Ошибка сети',
    timeout: 'Время ожидания истекло'
  },

  // Wish related
  wishes: {
    title: 'Желания',
    create: 'Создать желание',
    myWishes: 'Мои желания',
    allWishes: 'Все желания',
    activeWishes: 'Активные желания',
    completedWishes: 'Выполненные желания',
    wishTitle: 'Название желания',
    wishDescription: 'Описание желания',
    wishType: 'Тип желания',
    wishCost: 'Стоимость',
    wishStatus: 'Статус',
    wishCreator: 'Создатель',
    wishExecutor: 'Исполнитель',
    wishDeadline: 'Дедлайн',
    wishCreated: 'Создано',
    wishUpdated: 'Обновлено',
    noWishes: 'Нет желаний',
    wishAccepted: 'Желание принято',
    wishCompleted: 'Желание выполнено',
    wishDisputed: 'Желание оспорено',
    wishRejected: 'Желание отклонено'
  },

  // Wish types
  wishTypes: {
    green: {
      name: 'Зеленое желание',
      description: 'Простые задачи и просьбы',
      emoji: '💚'
    },
    blue: {
      name: 'Синее желание',
      description: 'Средние по сложности задачи',
      emoji: '💙'
    },
    red: {
      name: 'Красное желание',
      description: 'Сложные и важные задачи',
      emoji: '❤️'
    }
  },

  // Wish statuses
  wishStatuses: {
    active: 'Активно',
    in_progress: 'В процессе',
    completed: 'Выполнено',
    disputed: 'Спорное',
    rejected: 'Отклонено'
  },

  // Wallet related
  wallet: {
    title: 'Кошелек',
    balance: 'Баланс',
    currency: 'Валюта',
    convert: 'Конвертировать',
    gift: 'Подарить',
    transfer: 'Перевести',
    transaction: 'Транзакция',
    transactions: 'Транзакции',
    income: 'Доход',
    expense: 'Расход',
    conversion: 'Конвертация',
    gift_sent: 'Подарок отправлен',
    gift_received: 'Подарок получен',
    insufficientFunds: 'Недостаточно средств',
    conversionRate: 'Курс конвертации',
    totalBalance: 'Общий баланс'
  },

  // Social features
  social: {
    friends: 'Друзья',
    friendRequests: 'Запросы в друзья',
    addFriend: 'Добавить в друзья',
    removeFriend: 'Удалить из друзей',
    acceptRequest: 'Принять запрос',
    rejectRequest: 'Отклонить запрос',
    sendRequest: 'Отправить запрос',
    findFriends: 'Найти друзей',
    noFriends: 'Нет друзей',
    noPendingRequests: 'Нет ожидающих запросов',
    friendshipStatus: 'Статус дружбы',
    online: 'В сети',
    offline: 'Не в сети',
    lastSeen: 'Последний раз в сети'
  },

  // Achievements
  achievements: {
    title: 'Достижения',
    earned: 'Получено',
    progress: 'Прогресс',
    locked: 'Заблокировано',
    unlocked: 'Разблокировано',
    newAchievement: 'Новое достижение!',
    congratulations: 'Поздравляем!',
    achievementUnlocked: 'Достижение разблокировано',
    noAchievements: 'Нет достижений',
    firstWish: 'Первое желание',
    wishMaster: 'Мастер желаний',
    converter: 'Конвертер',
    legendaryFulfiller: 'Легендарный исполнитель'
  },

  // Notifications
  notifications: {
    title: 'Уведомления',
    markAsRead: 'Отметить как прочитанное',
    markAllAsRead: 'Отметить все как прочитанные',
    noNotifications: 'Нет уведомлений',
    newNotification: 'Новое уведомление',
    wishAccepted: 'Ваше желание принято',
    wishCompleted: 'Ваше желание выполнено',
    friendRequest: 'Новый запрос в друзья',
    giftReceived: 'Вы получили подарок',
    achievementEarned: 'Новое достижение'
  },

  // Forms and validation
  forms: {
    required: 'Обязательное поле',
    invalid: 'Неверный формат',
    tooShort: 'Слишком короткое',
    tooLong: 'Слишком длинное',
    emailInvalid: 'Неверный email',
    passwordWeak: 'Слабый пароль',
    passwordMismatch: 'Пароли не совпадают',
    usernameExists: 'Имя пользователя уже существует',
    emailExists: 'Email уже используется',
    fieldRequired: 'Это поле обязательно для заполнения',
    minLength: 'Минимальная длина',
    maxLength: 'Максимальная длина',
    characters: 'символов'
  },

  // Authentication
  auth: {
    signIn: 'Войти',
    signUp: 'Регистрация',
    signOut: 'Выйти',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    username: 'Имя пользователя',
    forgotPassword: 'Забыли пароль?',
    resetPassword: 'Сбросить пароль',
    createAccount: 'Создать аккаунт',
    haveAccount: 'Уже есть аккаунт?',
    noAccount: 'Нет аккаунта?',
    welcomeBack: 'С возвращением!',
    welcome: 'Добро пожаловать!',
    profile: 'Профиль',
    editProfile: 'Редактировать профиль',
    changePassword: 'Изменить пароль',
    deleteAccount: 'Удалить аккаунт'
  },

  // Time and dates
  time: {
    now: 'Сейчас',
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    thisWeek: 'На этой неделе',
    lastWeek: 'На прошлой неделе',
    thisMonth: 'В этом месяце',
    lastMonth: 'В прошлом месяце',
    minute: 'минута',
    minutes: 'минут',
    hour: 'час',
    hours: 'часов',
    day: 'день',
    days: 'дней',
    week: 'неделя',
    weeks: 'недель',
    month: 'месяц',
    months: 'месяцев',
    year: 'год',
    years: 'лет',
    ago: 'назад',
    remaining: 'осталось',
    overdue: 'просрочено',
    deadline: 'дедлайн',
    created: 'создано',
    updated: 'обновлено'
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Перейти к основному содержимому',
    skipToNavigation: 'Перейти к навигации',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    openModal: 'Открыть модальное окно',
    closeModal: 'Закрыть модальное окно',
    loading: 'Загрузка содержимого',
    error: 'Произошла ошибка',
    success: 'Операция выполнена успешно',
    warning: 'Внимание',
    info: 'Информация',
    sortAscending: 'Сортировка по возрастанию',
    sortDescending: 'Сортировка по убыванию',
    currentPage: 'Текущая страница',
    pageOf: 'Страница {current} из {total}',
    searchResults: 'Результаты поиска',
    noResults: 'Результатов не найдено'
  },

  // Error messages
  errors: {
    generic: 'Произошла ошибка. Попробуйте позже.',
    network: 'Ошибка сети. Проверьте подключение к интернету.',
    server: 'Ошибка сервера. Попробуйте позже.',
    notFound: 'Запрашиваемый ресурс не найден.',
    unauthorized: 'У вас нет прав для выполнения этого действия.',
    forbidden: 'Доступ запрещен.',
    validation: 'Проверьте правильность введенных данных.',
    timeout: 'Время ожидания истекло. Попробуйте еще раз.',
    tooManyRequests: 'Слишком много запросов. Подождите немного.',
    maintenance: 'Сайт находится на техническом обслуживании.',
    browserNotSupported: 'Ваш браузер не поддерживается.'
  },

  // Success messages
  success: {
    saved: 'Данные сохранены',
    created: 'Создано успешно',
    updated: 'Обновлено успешно',
    deleted: 'Удалено успешно',
    sent: 'Отправлено успешно',
    copied: 'Скопировано в буфер обмена',
    uploaded: 'Файл загружен',
    downloaded: 'Файл скачан',
    passwordChanged: 'Пароль изменен',
    profileUpdated: 'Профиль обновлен',
    settingsSaved: 'Настройки сохранены'
  },

  // Confirmation messages
  confirmations: {
    delete: 'Вы уверены, что хотите удалить?',
    deleteWish: 'Удалить это желание?',
    deleteFriend: 'Удалить из друзей?',
    signOut: 'Выйти из аккаунта?',
    deleteAccount: 'Удалить аккаунт? Это действие нельзя отменить.',
    unsavedChanges: 'У вас есть несохраненные изменения. Покинуть страницу?',
    resetSettings: 'Сбросить настройки к значениям по умолчанию?'
  },

  // Placeholders
  placeholders: {
    search: 'Поиск...',
    searchWishes: 'Поиск желаний...',
    searchFriends: 'Поиск друзей...',
    enterWishTitle: 'Введите название желания',
    enterWishDescription: 'Опишите ваше желание',
    enterEmail: 'Введите ваш email',
    enterUsername: 'Введите имя пользователя',
    enterPassword: 'Введите пароль',
    enterMessage: 'Введите сообщение',
    selectOption: 'Выберите опцию',
    noOptionsAvailable: 'Нет доступных опций'
  },

  // App specific
  app: {
    name: 'Банк Желаний',
    tagline: 'Система управления желаниями с трехуровневой валютой',
    description: 'Создавайте желания, помогайте друзьям и зарабатывайте валюту',
    version: 'Версия',
    copyright: '© 2024 Банк Желаний. Все права защищены.',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия использования',
    support: 'Поддержка',
    feedback: 'Обратная связь',
    about: 'О приложении'
  }
} as const

// Helper function to get nested text
export function getText(path: string): string {
  const keys = path.split('.')
  let current: any = RUSSIAN_TEXT
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return path // Return the path if not found
    }
  }
  
  return typeof current === 'string' ? current : path
}

// Helper function for pluralization in Russian
export function pluralize(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10
  
  if (n > 10 && n < 20) return forms[2]
  if (n1 > 1 && n1 < 5) return forms[1]
  if (n1 === 1) return forms[0]
  return forms[2]
}

// Helper function for time formatting
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return RUSSIAN_TEXT.time.now
  if (diffMinutes < 60) return `${diffMinutes} ${pluralize(diffMinutes, ['минуту', 'минуты', 'минут'])} ${RUSSIAN_TEXT.time.ago}`
  if (diffHours < 24) return `${diffHours} ${pluralize(diffHours, ['час', 'часа', 'часов'])} ${RUSSIAN_TEXT.time.ago}`
  if (diffDays < 7) return `${diffDays} ${pluralize(diffDays, ['день', 'дня', 'дней'])} ${RUSSIAN_TEXT.time.ago}`
  
  return date.toLocaleDateString('ru-RU')
}