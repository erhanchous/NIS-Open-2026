/* =====================================================
   ИНИЦИАЛИЗАЦИЯ SUPABASE
===================================================== */
// Если библиотека подключена через HTML CDN, мы используем window.supabase
const SUPABASE_URL = 'https://supabase.com/dashboard/project/skmdoxzqcqltznajfemz/settings/api-keys';
const SUPABASE_ANON_KEY = 'sb_publishable_R6uigvxp9Lvjg7m600SUgA_hPI7hFp5';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =====================================================
   ОБРАБОТКА ФОРМЫ РЕГИСТРАЦИИ ИГРОКОВ
===================================================== */
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const newPlayer = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            level: formData.get('level'),
            discharge: formData.get('discharge'),
            email: formData.get('email')
        };

        // Отправляем данные игрока в Supabase
        supabase.from('tournament_players')
            .insert([newPlayer])
            .then(function(result) {
                if (result.error) {
                    alert("Ошибка от базы данных: " + JSON.stringify(result.error));
                    return;
                }

                // Обновляем список игроков и турнирную сетку на экране
                if (typeof fetchPlayersFromSupabase === 'function') fetchPlayersFromSupabase();
                fetchMatchesForBracket();

                /* Закрываем и очищаем форму */
                if (typeof closeRegistration === 'function') closeRegistration();
                form.reset();

                /* Показываем красивое сообщение об успехе */
                if (typeof showSuccess === 'function') showSuccess();
            })
            .catch(function(err) {
                alert("Критическая ошибка сети: " + err.message);
            });
    });
}

/* =====================================================
   ФУНКЦИЯ ЗАГРУЗКИ И ОТРИСОВКИ ТУРНИРНОЙ СЕТКИ
===================================================== */
function fetchMatchesForBracket() {
  const container = document.getElementById('bracket-container');
  if (!container) return;

  // 1. Сначала загружаем матчи
  supabase
    .from('tournament_matches')
    .select('*')
    .order('id', { ascending: true })
    .then(function(matchesResponse) {
      if (matchesResponse.error) {
        console.error('Ошибка Supabase при загрузке матчей:', matchesResponse.error);
        container.innerHTML = '<div class="text-red-400 text-sm text-center">Ошибка загрузки матчей.</div>';
        return;
      }

      const matches = matchesResponse.data || [];

      // 2. Затем загружаем игроков, чтобы сопоставить их ID с именами
      supabase
        .from('tournament_players')
        .select('id, name')
        .then(function(playersResponse) {
          if (playersResponse.error) {
            console.error('Ошибка Supabase при загрузке игроков:', playersResponse.error);
            container.innerHTML = '<div class="text-red-400 text-sm text-center">Ошибка сопоставления игроков.</div>';
            return;
          }

          const players = playersResponse.data || [];

          // Хелпер для поиска имени по ID
          const getPlayerName = (id, defaultName) => {
            if (!id) return defaultName;
            const found = players.find(p => p.id == id);
            return found ? found.name : defaultName;
          };

          // Разбиваем данные на 3 конкретных матча
          const m1 = matches.find(m => m.id == 1) || {};
          const m2 = matches.find(m => m.id == 2) || {};
          const m3 = matches.find(m => m.id == 3) || {};

          // Заполняем имена игроков
          const p1_name = getPlayerName(m1.player1_id, 'Бексултан Ерхан');
          const p2_name = getPlayerName(m1.player2_id, 'Дюсетаев Адиль');
          const p3_name = getPlayerName(m2.player1_id, 'Попов Павел');
          const p4_name = getPlayerName(m2.player2_id, 'Баянды Дильдар');
          const final_p1 = getPlayerName(m3.player1_id, 'Победитель 1');
          const final_p2 = getPlayerName(m3.player2_id, 'Победитель 2');

          const getScore = (score) => (score !== null && score !== undefined) ? score : '-';
          const isWinner = (score1, score2) => score1 !== null && score2 !== null && score1 > score2;

          // Генерируем HTML-код сетки
          container.innerHTML = `
            <!-- ПОЛУФИНАЛЫ -->
            <div class="flex flex-col gap-10 w-full md:w-auto">
              <!-- Полуфинал 1 -->
              <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full md:w-64 overflow-hidden shadow-lg">
                <div class="px-4 py-2 bg-zinc-800/40 text-[11px] text-zinc-400 font-medium flex justify-between border-b border-zinc-800/60">
                  <span>${m1.round_name || '1/2 финала'}</span>
                  <span>${m1.match_time || '10 ОКТЯБРЯ'}</span>
                </div>
                <div class="p-1.5 flex flex-col gap-1">
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m1.player1_score, m1.player2_score) ? 'bg-emerald-950/30 text-emerald-400 font-semibold' : 'text-zinc-300'}">
                    <span>${p1_name}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m1.player1_score)}</span>
                  </div>
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m1.player2_score, m1.player1_score) ? 'bg-emerald-950/30 text-emerald-400 font-semibold' : 'text-zinc-300'}">
                    <span>${p2_name}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m1.player2_score)}</span>
                  </div>
                </div>
              </div>

              <!-- Полуфинал 2 -->
              <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full md:w-64 overflow-hidden shadow-lg">
                <div class="px-4 py-2 bg-zinc-800/40 text-[11px] text-zinc-400 font-medium flex justify-between border-b border-zinc-800/60">
                  <span>${m2.round_name || '1/2 финала'}</span>
                  <span>${m2.match_time || '10 ОКТЯБРЯ'}</span>
                </div>
                <div class="p-1.5 flex flex-col gap-1">
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m2.player1_score, m2.player2_score) ? 'bg-emerald-950/30 text-emerald-400 font-semibold' : 'text-zinc-300'}">
                    <span>${p3_name}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m2.player1_score)}</span>
                  </div>
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m2.player2_score, m2.player1_score) ? 'bg-emerald-950/30 text-emerald-400 font-semibold' : 'text-zinc-300'}">
                    <span>${p4_name}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m2.player2_score)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- СТРЕЛКИ ДЛЯ ПК -->
            <div class="hidden md:flex flex-col justify-around h-40 text-zinc-700 font-light text-xl">
              <div>➔</div>
              <div>➔</div>
            </div>

            <!-- ФИНАЛ -->
            <div class="w-full md:w-auto flex items-center justify-center">
              <div class="bg-zinc-900 border-2 border-amber-500/80 rounded-xl w-full md:w-64 overflow-hidden shadow-2xl relative pt-3">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                  🏆 Финал
                </div>
                <div class="px-4 py-1.5 text-center text-[11px] text-zinc-400 border-b border-zinc-800/60">
                  ${m3.match_time || '11 ОКТЯБРЯ'} • ${m3.court || 'Корт №1'}
                </div>
                <div class="p-1.5 flex flex-col gap-1">
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m3.player1_score, m3.player2_score) ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-zinc-300'}">
                    <span>${final_p1}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m3.player1_score)}</span>
                  </div>
                  <div class="flex justify-between items-center p-2.5 rounded-lg text-sm ${isWinner(m3.player2_score, m3.player1_score) ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-zinc-300'}">
                    <span>${final_p2}</span>
                    <span class="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-700/50">${getScore(m3.player2_score)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
    });
}

// Запуск загрузки сетки при полной готовности страницы
document.addEventListener('DOMContentLoaded', fetchMatchesForBracket);
