/* =====================================================
   ЗАГЛУШКА НА СЛУЧАЙ ОТСУТСТВИЯ ИНИЦИАЛИЗАЦИИ
===================================================== */
// Этот блок (твоя родная заглушка) не дает сайту упасть, если объект supabase еще не создан в index.html
if (typeof window.supabase === 'undefined' || !window.supabase) {
    window.supabase = {
        createClient: function() {
            return {
                from: function() {
                    return {
                        select: function() { return { order: function() { return Promise.resolve({data:[], error:null}) } } },
                        insert: function() { return Promise.resolve({error:null}) }
                    }
                }
            }
        }
    };
}

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

        // Отправляем данные (объект supabase подтянется из index.html автоматически)
        supabase.from('tournament_players')
            .insert([newPlayer])
            .then(function(result) {
                if (result.error) {
                    alert("Ошибка от базы данных: " + JSON.stringify(result.error));
                    return;
                }

                // Обновляем списки
                if (typeof fetchPlayersFromSupabase === 'function') fetchPlayersFromSupabase();
                fetchMatchesForBracket();

                /* Закрываем и очищаем форму */
                if (typeof closeRegistration === 'function') closeRegistration();
                form.reset();

                /* Показываем красивое сообщение */
                if (typeof showSuccess === 'function') showSuccess();
            })
            .catch(function(err) {
                alert("Критическая ошибка сети: " + err.message);
            });
    });
}

/* =====================================================
   ФУНКЦИЯ ВЫВОДА ТУРНИРНОЙ СЕТКИ
===================================================== */
function fetchMatchesForBracket() {
  const container = document.getElementById('bracket-container');
  if (!container) return;

  // Запрашиваем матчи из созданной нами таблицы tournament_matches
  supabase
    .from('tournament_matches')
    .select('*')
    .order('id', { ascending: true })
    .then(function(matchesResponse) {
      if (matchesResponse.error) {
        console.error('Ошибка при загрузке матчей:', matchesResponse.error);
        return;
      }

      const matches = matchesResponse.data || [];

      // Загружаем игроков для сопоставления имен по их ID
      supabase
        .from('tournament_players')
        .select('id, name')
        .then(function(playersResponse) {
          if (playersResponse.error) {
            console.error('Ошибка при загрузке имен игроков:', playersResponse.error);
            return;
          }

          const players = playersResponse.data || [];

          // Хелпер поиска имени по ID
          const getPlayerName = (id, defaultName) => {
            if (!id) return defaultName;
            const found = players.find(p => p.id == id);
            return found ? found.name : defaultName;
          };

          const m1 = matches.find(m => m.id == 1) || {};
          const m2 = matches.find(m => m.id == 2) || {};
          const m3 = matches.find(m => m.id == 3) || {};

          // Подтягиваем имена из базы данных
          const p1_name = getPlayerName(m1.player1_id, 'Бексултан Ерхан');
          const p2_name = getPlayerName(m1.player2_id, 'Дюсетаев Адиль');
          const p3_name = getPlayerName(m2.player1_id, 'Попов Павел');
          const p4_name = getPlayerName(m2.player2_id, 'Баянды Дильдар');
          const final_p1 = getPlayerName(m3.player1_id, 'Победитель 1');
          const final_p2 = getPlayerName(m3.player2_id, 'Победитель 2');

          const getScore = (score) => (score !== null && score !== undefined) ? score : '-';
          const isWinner = (score1, score2) => score1 !== null && score2 !== null && score1 > score2;

          // Вставляем сетку
          container.innerHTML = `
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
            <div class="hidden md:flex flex-col justify-around h-40 text-zinc-700 font-light text-xl">
              <div>➔</div>
              <div>➔</div>
            </div>
            <!-- Финал -->
            <div class="w-full md:w-auto flex items-center justify-center">
              <div class="bg-zinc-900 border-2 border-amber-500/80 rounded-xl w-full md:w-64 overflow-hidden shadow-2xl relative pt-3">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">🏆 Финал</div>
                <div class="px-4 py-1.5 text-center text-[11px] text-zinc-400 border-b border-zinc-800/60">${m3.match_time || '11 ОКТЯБРЯ'} • ${m3.court || 'Корт №1'}</div>
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

// Запускаем отрисовку сетки
document.addEventListener('DOMContentLoaded', fetchMatchesForBracket);
