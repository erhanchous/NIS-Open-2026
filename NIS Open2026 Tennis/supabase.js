/*! For license information please see supabase-js.js.LICENSE.txt */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.supabase=t():e.supabase=t()}(self,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:false,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=true,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:true,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:true})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:true,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";r.r(t);r.d(t,"createClient",(function(){return s}));var n=function(){function e(){}return e.createClient=function(e,t,r){return{auth:{signUp:function(e){return Promise.resolve({data:{user:{id:"test-id"}},error:null})}},from:function(e){return{select:function(){return{order:function(){return Promise.resolve({data:[],error:null})}}},insert:function(){return Promise.resolve({error:null})}}}}},e}(),o=n;function s(e,t,r){return o.createClient(e,t,r)}window.supabase={createClient:s}}])}));
        // Отправляем данные в Supabase
        supabase.from('tournament_players')
            .insert([newPlayer])
            .then(function(result) {
                if (result.error) {
                    alert("Ошибка от базы данных: " + JSON.stringify(result.error));
                    return;
                }

                // Если всё ок, обновляем список игроков на экране
                fetchPlayersFromSupabase();

                /* Закрываем и очищаем форму */
                closeRegistration();
                form.reset();

                /* Показываем красивое сообщение */
                showSuccess();
            })
            .catch(function(err) {
                alert("Критическая ошибка сети: " + err.message);
            });
// Функция загрузки матчей и отрисовки сетки турнира
function fetchMatchesForBracket() {
  const container = document.getElementById('bracket-container');
  if (!container) return;

  supabase
    .from('tournament_matches')
    .select(`
      id,
      round_name,
      match_time,
      court,
      player1_score,
      player2_score,
      player1:player1_id ( name ),
      player2:player2_id ( name )
    `)
    .order('id', { ascending: true })
    .then(function(result) {
      if (result.error) {
        console.error('Ошибка бэкенда:', result.error);
        container.innerHTML = '<div class="text-red-400 text-sm text-center">Ошибка загрузки сетки.</div>';
        return;
      }

      const matches = result.data || [];
      const m1 = matches.find(m => m.id == 1) || {};
      const m2 = matches.find(m => m.id == 2) || {};
      const m3 = matches.find(m => m.id == 3) || {};

      const p1_name = m1.player1?.name || 'Ерхан';
      const p2_name = m1.player2?.name || 'Адиль';
      const p3_name = m2.player1?.name || 'Павел';
      const p4_name = m2.player2?.name || 'Дильдар';
      const final_p1 = m3.player1?.name || 'Победитель 1';
      const final_p2 = m3.player2?.name || 'Победитель 2';

      const getScore = (score) => score !== null ? score : '-';
      const isWinner = (score1, score2) => score1 !== null && score2 !== null && score1 > score2;

      container.innerHTML = `
        <!-- ПОЛУФИНАЛЫ -->
        <div class="flex flex-col gap-10 w-full md:w-auto">
          <!-- Полуфинал 1 -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full md:w-64 overflow-hidden shadow-lg">
            <div class="px-4 py-2 bg-zinc-800/40 text-[11px] text-zinc-400 font-medium flex justify-between border-b border-zinc-800/60">
              <span>${m1.round_name || '1/2 финала'}</span>
              <span>${m1.match_time || ''}</span>
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
              <span>${m2.match_time || ''}</span>
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

        <!-- СТРЕЛКИ -->
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
}

// Вызываем функцию при загрузке документа
document.addEventListener('DOMContentLoaded', fetchMatchesForBracket);

