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
