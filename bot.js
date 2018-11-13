const VkBot = require('node-vk-bot-api')
const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const search = require('./search')

const bot = new VkBot(process.env.VKTOKEN)

/*
    СЦЕНЫ
*/

const sceneSearch = new Scene('startSearch',
    (ctx) => {
        
        ctx.reply('Выбери тип заведения', null, Markup
        .keyboard([
            [
                Markup.button('Бар', 'positive'), Markup.button('Бургерная', 'positive'), Markup.button('Закусочная', 'positive'), Markup.button('Кальян-бар', 'positive')
            ],
            [
                Markup.button('Кафе', 'positive'), Markup.button('Паб', 'positive'), Markup.button('Пельменная', 'positive'), Markup.button('Пирожковая', 'positive')
            ],
            [
                Markup.button('Пиццерия', 'positive'), Markup.button('Ресторан', 'positive'), Markup.button('Столовая', 'positive'), Markup.button('Суши-бар', 'positive')
            ],
            [
                Markup.button('Шаурма', 'positive')
            ]
        ])
        .oneTime())
        ctx.scene.next()
    },
    (ctx) => {
        var place = [ 'Бар',
        'Бургерная',
        'Закусочная',
        'Кальян-бар',
        'Кафе',
        'Паб',
        'Пельменная',
        'Пирожковая',
        'Пиццерия',
        'Ресторан',
        'Столовая',
        'Суши-бар',
        'Шаурма' ]
        ctx.session.place = ctx.message.text
        if(place.indexOf(ctx.session.place) != -1){
            ctx.scene.next()
            ctx.reply("Пришли мне свою геолокацию")
        } else {
            ctx.scene.leave()
            ctx.reply("Ты отправил что-то не то")
        }
    },
    (ctx) => {
        ctx.scene.leave()
        if(ctx.message.geo !== undefined){
            var request = search(ctx.session.place, ctx.message.geo.coordinates.longitude + "," + ctx.message.geo.coordinates.latitude)
            request.then(function(response){
                console.log("Отправитель: " + ctx.message.from_id + " координаты: " + ctx.message.geo.coordinates.latitude + "," +  ctx.message.geo.coordinates.longitude)
                if(response.length == 0){
                    ctx.reply("Я не нашел ближайших мест, по заданному запросу. Возможно они есть, но они не добавлены на Яндекс.Карты")
                } else {
                    ctx.reply("Возможно, есть более близкие места, но они не добавлены на Яндекс.Карты. Вот, что я нашел по вашему запросу:")
                    for(var i = 0; i < response.length; i++){
                        if(i == 3) break;
                        var toSender = {
                            message: "Название: " + response[i].name
                                    + "\nАдрес: " + response[i].address
                                    + "\nВремя работы: " + response[i].time
                                    + "\nСтатус: " + response[i].state,
                            lat: response[i].geo[1],
                            long : response[i].geo[0]
                        }
                        ctx.reply(toSender)
                    }
                }
            })
            
        }
    }
)

const sceneReview = new Scene('review',
    (ctx) =>{
        ctx.reply("Напиши что-нибудь и это будет отправлено моему разработчику")
        ctx.scene.next()
    },
    (ctx) =>{
        bot.sendMessage(48145208, {
            message: "Пришло сообщение от vk.com/id" + ctx.message.from_id + "\n" + ctx.message.text
        })
        ctx.reply("Cпасибо за отзыв")
        ctx.scene.leave()
    }
)

const session = new Session()
const stage = new Stage(sceneSearch, sceneReview)

bot.use(session.middleware())
bot.use(stage.middleware())

/*
    КОМАНДЫ
*/

bot.command('Отзыв', (ctx) =>{
    ctx.scene.enter('review')
})

bot.command('Старт', (ctx) => {
    ctx.scene.enter('startSearch')
    //var request = search('Бургер', "56.228156" + "," + "58.009185")
})

bot.event('group_join', (ctx) => {
    ctx.reply('Добро пожаловать! Перед использованием не поленись прочитать инструкцию\nvk.com/@streetfoodbot-instrukciya-po-ispolzovaniu-bota')
  })

/*
bot.command('', (ctx) => {
    
})
*/

bot.on((ctx) => {
    ctx.reply("Привет! Для начала работы с ботом нажми кнопку ниже", null, Markup
    .keyboard([
        Markup.button('Старт', 'primary'), Markup.button('Отзыв', 'primary')           
    ])
    .oneTime())
})



bot.startPolling()