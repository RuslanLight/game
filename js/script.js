// Глобальные переменные 
let username = "Gumirov"
let isGaming = false
let points = 0 

let game_id = ''
let line = 1

getUser(username)

// Листенеры 
let btns = document.querySelectorAll('.point')
for(let i = 0 ; i <btns.length; i++) {
    btns[i].addEventListener('click', set_points)
}

document.getElementById("game_button").addEventListener("click", startOrStopGame)



// Функции
function set_points() { 
    let userbtn = event.target //возвращает элемент которая вызвала функция
    let btns = document.querySelectorAll('.point')
    for(let i = 0; i < btns.length; i++) { 
        if(btns[i] == userbtn) {
            userbtn.classList.add('active')
            points = userbtn.innerHTML
        } else {
            btns[i].classList.remove('active')
        }
    }
}

//Документация на API
//https://www.notion.so/Diamond-API-e1bf62cc62964f1aab29850e96bfe58f



async function sendRequest(url, data) {
    url = `https://tg-api.tehnikum.school/tehnikum_course/${url}`

    let response = await fetch(url, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    
    response = await response.json()

    return response
}

async function getUser(username) {
    let response = await sendRequest("get_user", {username})

    if(response.error) {
        //Ошибка
        showPopUp(response.message)
    } else {
        //Нет ошибки 
        let balance = response.balance

        let userInfo = document.querySelector('header span')
        userInfo.innerHTML= `[${balance}]`
    }
}

function startOrStopGame() {
    let game_button = document.getElementById("game_button")

    if(isGaming) {
        //Заканчиваем игру
        game_button.innerHTML = "ИГРАТЬ"
        isGaming = false
        gameWin()
    } else  {
        if(points > 0) {
            game_button.innerHTML = "ЗАКОНЧИТЬ ИГРУ"
            isGaming = true
            newGame()    
        }
    }
}


async function newGame() {
    let response = await sendRequest("new_game", {
        username, points
    })

    if(response.error) {
        //Ошибка
        showPopUp(response.message)
    } else {
        //Нет ошибки 
        game_id = response.game_id
        activateLine()
    }
}

function activateLine() {
    let blocks = document.querySelectorAll('.line:last-child .game_block')
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i]
        setTimeout(()=> {
            block.classList.add('active')
            block,addEventListener("click", newStep)
        },100*i)
    }
}

async function newStep() {
    let userBlock = event.target

    console.log(userBlock)
    let step

    let blocks = document.querySelectorAll('.game_block.active')
    for(let i = 0; i < blocks.length; i++) {
        if(userBlock == blocks[i]) {
            step = i + 1
        }
    }

    let response = await sendRequest('game_step', {
        username, game_id, step, line
    })
    console.log(response)
    if(response.error) {
        //Ошибка
        // showPopUp(response.message)
    } else {
        //Нет ошибки 
        if(response.win) {
            //Выйграл уровень
            showLine(response.bomb1, response.bomb2, response.bomb3)
            newLine(response.cf)
        } else {
            //Проиграл уровень
            showLine(response.bomb1, response.bomb2, response.bomb3)
            showPopUp('Даяна лузер')
            setTimeout(cleanArea, 1000)
        }
    }

}


function showLine (b1, b2, b3) {
    let blocks = document.querySelectorAll('.game_block.active')
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i]
        let blockNumber = i + 1
        block.classList.remove('active')
        if(blockNumber == b1 || blockNumber == b2 || blockNumber ==b3) {
            block.classList.add('skeleton')
        } else {
            block.classList.add('diamond')
        }
    }   
}


function newLine(cf) {
    let game_area = document.querySelector('.game_area')
    game_area.innerHTML = game_area.innerHTML + `
        <div class="line">
            <div class="game_block "></div>
            <div class="game_block "></div>
            <div class="game_block "></div>
            <div class="game_block"></div>
            <div class="game_block"></div>
            <div class="game_coef">x${cf}</div>
        </div>`  
    activateLine()
    line = line + 1
}


async function gameWin() {
    let response = await sendRequest('game_win', {
        username,
        game_id,
        'level': line
    })

    if(response.error) {
        //Ошибка
        showPopUp(response.message)
    } else {
        //Нет ошибки 
        showPopUp("Ты выйграл")
        setTimeout(cleanArea, 1000)
    }

}


function cleanArea() {
    let game_area = document.querySelector('.game_area')
    game_area.innerHTML =  `
        <div class="line">
            <div class="game_block "></div>
            <div class="game_block "></div>
            <div class="game_block "></div>
            <div class="game_block"></div>
            <div class="game_block"></div>
            <div class="game_coef">x1.20</div>
        </div>`
    game_id = ""
    line = 1 

    let game_button = document.getElementById("game_button")
    game_button.innerHTML = "ИГРАТЬ"
    isGaming = false

}




function showPopUp(heading, text = "") {
    let wrapper = document.querySelector('.wrapper')
    let h3 = document.querySelector('.popUp h3')
    let span = document.querySelector('.popUp span')

    h3.innerHTML = heading
    span.innerHTML = text

    wrapper.style.display = "flex"

    setTimeout(closePopUp, 1000)
}

function closePopUp() {
    let wrapper = document.querySelector('.wrapper')
    wrapper.style.display = "none"
}
