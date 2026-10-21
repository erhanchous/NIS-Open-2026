// Обертка для полной изоляции переменных формы (защита от багов дублирования имен)
(function() {
    /* =====================================================
       ОБРАБОТКА ФОРМЫ РЕГИСТРАЦИИ ИГРОКОВ
    ===================================================== */
    const registrationForm = document.querySelector('form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Проверяем наличие глобального объекта supabase из index.html
            if (typeof supabase === 'undefined') {
                alert("Ошибка: Клиент Supabase не инициализирован в index.html");
                return;
            }

            const formData = new FormData(registrationForm);
            const newPlayer = {
                name: formData.get('name'),
                age: parseInt(formData.get('age')) || 0,
                level: formData.get('level') || 'Любитель',
                discharge: formData.get('discharge') || 'Одиночный',
                email: formData.get('email')
            };

            // Отправляем данные игрока в твою базу данных
            supabase.from('tournament_players')
                .insert([newPlayer])
                .then(function(result) {
                    if (result.error) {
                        alert("Ошибка базы данных: " + JSON.stringify(result.error));
                        return;
                    }

                    // Обновляем списки участников и сетку на экране после регистрации
                    if (typeof fetchPlayersFromSupabase === 'function') fetchPlayersFromSupabase();
                    if (typeof fetchMatchesForBracket === 'function') fetchMatchesForBracket();

                    /* Скрываем и очищаем окно формы */
                    if (typeof closeRegistration === 'function') closeRegistration();
                    registrationForm.reset();

                    /* Показываем тост успешного завершения */
                    if (typeof showSuccess === 'function') showSuccess();
                })
                .catch(function(err) {
                    alert("Критическая ошибка отправки: " + err.message);
                });
        });
    }
})();

/* =====================================================
   ФУНКЦИЯ ДИНАМИЧЕСКОГО ВЫВОДА ТУРНИРНОЙ СЕТКИ
===================================================== */
function fetchMatchesForBracket() {
    const container = document.getElementById('bracket-container');
    if (!container) return;

    if (typeof supabase === 'undefined') {
        container.innerHTML = '<div class="text-red-400 text-sm text-center">Ошибка: Объект Supabase не найден.</div>';
        return;
    }

    // 1. Загружаем структуру матчей турнира
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

            // 2. Докачиваем список игроков для сопоставления ID и имен
            supabase
                .from('tournament_players')
                .select('id, name')
                .then(function(playersResponse) {
                    if (playersResponse.error) {
                        console.error('Ошибка Supabase при загрузке имен игроков:', playersResponse.error);
                        return;
                    }

                    const players = playersResponse.data || [];

                    // Функция-помощник поиска имени по ID
                    const getPlayerName = (id, defaultName) => {
                        if (!id) return defaultName;
                        const found = players.find(p => p.id == id);
                        return found ? found.name : defaultName;
                    };

                    // Распределяем три матча по ID
                    const m1 = matches.find(m => m.id == 1) || {};
                    const m2 = matches.find(m => m.id == 2) || {};
                    const m3 = matches.find(m => m.id == 3) || {};

                    // Связываем ID участников с их текстовыми именами из базы
                    const p1_name = getPlayerName(m1.player1_id, 'Бексултан Ерхан');
                    const p2_name = getPlayerName(m1.player2_id, 'Дюсетаев Адиль');
                    const p3_name = getPlayerName(m2.player1_id, 'Попов Павел');
                    const p4_name = getPlayerName(m2.player2_id, 'Баянды Дильдар');
                    const final_p1 = getPlayerName(m3.player1_id, 'Победитель 1');
                    const final_p2 = getPlayerName(m3.player2_id, 'Победитель 2');

                    // Помощники для отображения пустых результатов и подсветки победителя
                    const getScore = (score) => (score !== null && score !== undefined) ? score : '-';
                    const isWinner = (score1, score2) => score1 !== null && score2 !== null && score1 > score2;

                    // Отрисовываем чистый адаптивный HTML внутрь index.html
                    container.innerHTML = `
                        <!-- РАУНД 1: ПОЛУФИНАЛЫ -->
                        <div class="bracket-round">
                            <!-- Матч 1 -->
                            <div class="bracket-match-card">
                                <div class="bracket-match-header">
                                    <span>${m1.round_name || '1/2 финала'}</span>
                                    <span>${m1.match_time || '10 ОКТЯБРЯ'}</span>
                                </div>
                                <div class="bracket-match-body">
                                    <div class="bracket-player-row ${isWinner(m1.player1_score, m1.player2_score) ? 'winner' : ''}">
                                        <span class="player-name-text">${p1_name}</span>
                                        <span class="player-score-badge">${getScore(m1.player1_score)}</span>
                                    </div>
                                    <div class="bracket-player-row ${isWinner(m1.player2_score, m1.player1_score) ? 'winner' : ''}">
                                        <span class="player-name-text">${p2_name}</span>
                                        <span class="player-score-badge">${getScore(m1.player2_score)}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Матч 2 -->
                            <div class="bracket-match-card">
                                <div class="bracket-match-header">
                                    <span>${m2.round_name || '1/2 финала'}</span>
                                    <span>${m2.match_time || '10 ОКТЯБРЯ'}</span>
                                </div>
                                <div class="bracket-match-body">
                                    <div class="bracket-player-row ${isWinner(m2.player1_score, m2.player2_score) ? 'winner' : ''}">
                                        <span class="player-name-text">${p3_name}</span>
                                        <span class="player-score-badge">${getScore(m2.player1_score)}</span>
                                    </div>
                                    <div class="bracket-player-row ${isWinner(m2.player2_score, m2.player1_score) ? 'winner' : ''}">
                                        <span class="player-name-text">${p4_name}</span>
                                        <span class="player-score-badge">${getScore(m2.player2_score)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- СОЕДИНИТЕЛЬНЫЕ СТРЕЛКИ ДЛЯ ПК -->
                        <div class="bracket-arrows">
                            <div>➔</div>
                            <div>➔</div>
                        </div>

                        <!-- РАУНД 2: ФИНАЛ -->
                        <div class="bracket-round final-round">
                            <div class="bracket-match-card final-card">
                                <div class="final-badge">🏆 Финал турнира</div>
                                <div class="bracket-match-header">
                                    <span>${m3.match_time || '11 ОКТЯБРЯ'}</span>
                                    <span>${m3.court || 'Корт №1'}</span>
                                </div>
                                <div class="bracket-match-body">
                                    <div class="bracket-player-row ${isWinner(m3.player1_score, m3.player2_score) ? 'winner-final' : ''}">
                                        <span class="player-name-text">${final_p1}</span>
                                        <span class="player-score-badge">${getScore(m3.player1_score)}</span>
                                    </div>
                                    <div class="bracket-player-row ${isWinner(m3.player2_score, m3.player1_score) ? 'winner-final' : ''}">
                                        <span class="player-name-text">${final_p2}</span>
                                        <span class="player-score-badge">${getScore(m3.player2_score)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
        });
}

// Запускаем сборку сетки при загрузке документа
document.addEventListener('DOMContentLoaded', fetchMatchesForBracket);
