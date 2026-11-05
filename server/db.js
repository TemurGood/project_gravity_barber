import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA = {
  settings: {
    salonName: "Gravity Barber Lounge",
    salonPhone: "+7 (999) 777-33-22",
    salonAddress: "ул. Большая Бронная, 14, Москва (м. Пушкинская)",
    salonHours: "Ежедневно с 10:00 до 22:00",
    telegramBotToken: "9133257952:AAEvzvh_98L--RXfXQEOHB-gYmKYdL00n-4",
    telegramAdminChatId: "3540653",
    notificationsEnabled: true
  },
  services: [
    {
      id: "srv-1",
      category: "haircuts",
      name: "Мужская стрижка Gravity Signature",
      description: "Мытье головы с массажем, индивидуальный подбор формы, премиальная стрижка, сушка и авторский стайлинг косметикой Reuzel / Uppercut.",
      price: 2400,
      duration: 50,
      popular: true,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-2",
      category: "haircuts",
      name: "Skin Fade / Стрижка машинкой",
      description: "Идеально выведенный чистый дымчатый переход (fade) с использованием шейвера и премиальных триммеров.",
      price: 1900,
      duration: 40,
      popular: true,
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-3",
      category: "haircuts",
      name: "Удлиненная классика (ножницы)",
      description: "Стрижка исключительно ножницами для ценителей формы, текстуры и естественного движения волос.",
      price: 2800,
      duration: 60,
      popular: false,
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-4",
      category: "haircuts",
      name: "Детская стрижка (до 12 лет)",
      description: "Бережная и стильная стрижка юного джентльмена с напитком и приставкой PS5.",
      price: 1800,
      duration: 45,
      popular: false,
      image: "https://images.unsplash.com/photo-1517832606589-7629c3ae81b9?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-5",
      category: "beard",
      name: "Моделирование бороды и усов",
      description: "Построение правильной архитектуры бороды, подравнивание контуров шейвером, нанесение питательного масла с распариванием.",
      price: 1600,
      duration: 40,
      popular: true,
      image: "https://images.unsplash.com/photo-1517832606589-7629c3ae81b9?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-6",
      category: "beard",
      name: "Королевское бритье опасной бритвой",
      description: "Традиционный ритуал: распаривание горячими полотенцами с эфирными маслами, пена, бритье клинком и холодный компресс.",
      price: 2200,
      duration: 50,
      popular: true,
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-7",
      category: "combos",
      name: "Комбо: Стрижка + Моделирование бороды",
      description: "Наш главный хит! Полный образ настоящего мужчины по специальной комплексной цене.",
      price: 3400,
      duration: 80,
      popular: true,
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-8",
      category: "combos",
      name: "Отец и Сын (2 стрижки)",
      description: "Семейный визит в барбершоп: две фирменные мужские стрижки от лучших мастеров в одно время.",
      price: 3800,
      duration: 60,
      popular: false,
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-9",
      category: "combos",
      name: "VIP Тотал Care: Стрижка + Борода + СПА",
      description: "Максимальный релакс: премиальная стрижка, борода, королевское бритье, черная маска-детокс и массаж воротниковой зоны.",
      price: 4900,
      duration: 100,
      popular: true,
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-10",
      category: "spa",
      name: "Черная очищающая маска Black Mask",
      description: "Глубокое очищение пор, удаление омертвевших клеток кожи лица с последующим тонизированием и увлажнением.",
      price: 1200,
      duration: 30,
      popular: false,
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "srv-11",
      category: "spa",
      name: "Камуфляж седины (волосы или борода)",
      description: "Мягкое безаммиачное тонирование естественного оттенка без эффекта парика за 15 минут.",
      price: 1500,
      duration: 25,
      popular: false,
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80"
    }
  ],
  barbers: [
    {
      id: "barber-1",
      name: "Александр «Blade» Громов",
      title: "Шеф-барбер & Арт-директор",
      experience: "11 лет в профессии",
      rating: 4.99,
      reviewsCount: 384,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      bio: "Победитель всероссийского барбер-батла Barber King 2022. Эксперт по классическим формам и филигранному бритью опасной бритвой.",
      specialties: ["Signature Fade", "Королевское бритье", "Архитектура бороды"],
      workingDays: ["1", "2", "3", "4", "5"],
      startTime: "10:00",
      endTime: "21:00",
      slotDuration: 50,
      isActive: true
    },
    {
      id: "barber-2",
      name: "Дмитрий «Razor» Волков",
      title: "Топ-барбер",
      experience: "7 лет в профессии",
      rating: 4.95,
      reviewsCount: 271,
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      bio: "Мастер строгих геометрических стрижек и фейдов любой сложности. Любит идеальные детали и правильный уход за кожей головы.",
      specialties: ["Low Fade", "Моделирование бороды", "Камуфляж седины"],
      workingDays: ["2", "3", "4", "5", "6"],
      startTime: "11:00",
      endTime: "22:00",
      slotDuration: 50,
      isActive: true
    },
    {
      id: "barber-3",
      name: "Марк «Fade» Соколов",
      title: "Сеньор-барбер",
      experience: "5 лет в профессии",
      rating: 4.92,
      reviewsCount: 198,
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
      bio: "Специалист по удлиненным текстурированным стрижкам, маллетам, кропам и современному британскому гранжу.",
      specialties: ["Textured Crop", "Маллет", "Ножничные техники"],
      workingDays: ["3", "4", "5", "6", "0"],
      startTime: "10:00",
      endTime: "20:00",
      slotDuration: 45,
      isActive: true
    },
    {
      id: "barber-4",
      name: "Артур «Craft» Баграмян",
      title: "Барбер-стилист",
      experience: "4 года в профессии",
      rating: 4.88,
      reviewsCount: 142,
      photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80",
      bio: "Мастер чистых переходов, юношеских стрижек и глубокого спа-ухода за лицом и бородой.",
      specialties: ["Детские стрижки", "Black Mask SPA", "Buzz Cut"],
      workingDays: ["1", "4", "5", "6", "0"],
      startTime: "12:00",
      endTime: "22:00",
      slotDuration: 45,
      isActive: true
    }
  ],
  bookings: [
    {
      id: "GRV-8102",
      clientName: "Максим Орлов",
      clientPhone: "+7 (916) 234-56-78",
      clientNote: "Кофе без сахара, пожалуйста",
      serviceId: "srv-7",
      serviceName: "Комбо: Стрижка + Моделирование бороды",
      servicePrice: 3400,
      barberId: "barber-1",
      barberName: "Александр «Blade» Громов",
      date: new Date().toISOString().split('T')[0],
      time: "11:00",
      status: "confirmed",
      source: "website",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "GRV-8103",
      clientName: "Кирилл Сафронов",
      clientPhone: "+7 (926) 888-11-22",
      clientNote: "Делаем переход пониже",
      serviceId: "srv-1",
      serviceName: "Мужская стрижка Gravity Signature",
      servicePrice: 2400,
      barberId: "barber-2",
      barberName: "Дмитрий «Razor» Волков",
      date: new Date().toISOString().split('T')[0],
      time: "13:00",
      status: "confirmed",
      source: "telegram",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "GRV-8104",
      clientName: "Евгений Романов",
      clientPhone: "+7 (903) 456-78-90",
      clientNote: "",
      serviceId: "srv-6",
      serviceName: "Королевское бритье опасной бритвой",
      servicePrice: 2200,
      barberId: "barber-1",
      barberName: "Александр «Blade» Громов",
      date: new Date().toISOString().split('T')[0],
      time: "15:00",
      status: "pending",
      source: "website",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  reviews: [
    {
      id: "rev-1",
      author: "Сергей Васильев",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      date: "2 дня назад",
      barber: "Александр «Blade» Громов",
      text: "Лучший барбершоп в городе. Александр сделал филигранный фейд и бороду, которой я никогда не видел на своем лице. Атмосфера с хорошим виски и музыкой — 10 из 10!"
    },
    {
      id: "rev-2",
      author: "Михаил Давыдов",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      date: "Неделю назад",
      barber: "Дмитрий «Razor» Волков",
      text: "Был на королевском бритье. Это чистая медитация: горячие полотенца, эфирные масла, лезвие скользит без малейшего раздражения. Записался уже на месяц вперед через телеграм бота."
    },
    {
      id: "rev-3",
      author: "Артем Смирнов",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      date: "2 недели назад",
      barber: "Марк «Fade» Соколов",
      text: "Марк — настоящий художник формы. Помог подобрать удлиненную текстурную стрижку под мой тип волос. Сервис на высоте, запись через онлайн-календарь заняла 30 секунд."
    }
  ]
};

// Check if Neon Postgres is enabled via DATABASE_URL
let neonSql = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  try {
    neonSql = neon(process.env.DATABASE_URL);
    console.log('⚡ [Neon DB] Connected to Neon PostgreSQL cloud database!');
    initNeonSchema(neonSql);
  } catch (err) {
    console.error('⚡ [Neon DB] Connection error, falling back to local JSON store:', err.message);
  }
}

async function initNeonSchema(sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gravity_store (
        key VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `;
    const rows = await sql`SELECT key FROM gravity_store WHERE key = 'app_data';`;
    if (rows.length === 0) {
      await sql`INSERT INTO gravity_store (key, data) VALUES ('app_data', ${JSON.stringify(INITIAL_DATA)});`;
      console.log('⚡ [Neon DB] Initialized tables with seed data!');
    }
  } catch (e) {
    console.error('⚡ [Neon DB] Schema init warning:', e.message);
  }
}

// Local file storage initialization
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
}

export function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using initial data:', err);
    return INITIAL_DATA;
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    
    // Also sync to Neon if connected
    if (neonSql) {
      neonSql`
        INSERT INTO gravity_store (key, data)
        VALUES ('app_data', ${JSON.stringify(data)})
        ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(data)};
      `.catch(e => console.error('Error syncing to Neon:', e.message));
    }

    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

export function getNeonClient() {
  return neonSql;
}
