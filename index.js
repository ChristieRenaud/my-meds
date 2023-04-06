import { KEY } from './config.js'
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

const appSettings = {
  databaseURL: 'https://mymeds-852cf-default-rtdb.firebaseio.com/',
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const medsListInDatabase = ref(database, 'medsList')

const medNameInputEl = document.getElementById('med-name')
const medAmtInputEl = document.getElementById('med-amt')
const addButtonEl = document.getElementById('add-button')

const medsListItemsEl = document.getElementById('meds-list-items')

addButtonEl.addEventListener('click', (e) => {
  e.preventDefault()
  let medNameValue = medNameInputEl.value
  let medAmtValue = medAmtInputEl.value

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': KEY,
      'X-RapidAPI-Host': 'ai-medicine-dictionary.p.rapidapi.com',
    },
  }
  fetch(
    `https://ai-medicine-dictionary.p.rapidapi.com/medicine?question=${medNameValue}`,
    options,
  )
    .then((response) => response.text())
    .then((response) => {
      if (medNameValue && medAmtValue) {
        push(medsListInDatabase, {
          name: medNameValue,
          amt: medAmtValue,
          info: response || '',
        })
      }
    })
    .catch((err) => console.error(err))

  clearInputFieldEl(medNameInputEl)
  clearInputFieldEl(medAmtInputEl)
})

onValue(medsListInDatabase, (snapshot) => {
  if (snapshot.exists()) {
    let medsListArray = Object.entries(snapshot.val())
    clearMedsListItemsEl()
    medsListArray.forEach((array) => {
      let currentListItemId = array[0]
      let currentListItem = array[1]
      addItemToMedsListEl(currentListItem, currentListItemId)
    })
  }
})

function clearMedsListItemsEl() {
  medsListItemsEl.innerHTML = ''
}

function clearInputFieldEl(inputFieldEl) {
  inputFieldEl.value = ''
}

function addItemToMedsListEl(itemValue, itemID) {
  let newLiEl = document.createElement('li')
  let newLiSpan = document.createElement('span')
  let newTrashIconEl = document.createElement('span')

  newTrashIconEl.classList.add('fa-regular', 'fa-circle-xmark')
  newTrashIconEl.style.display = 'none'

  newLiSpan.textContent = `${itemValue.name}, ${itemValue.amt}`

  newLiSpan.className = 'list-item'
  newLiEl.append(newLiSpan, newTrashIconEl)
  let newInfoEl = document.createElement('p')
  newInfoEl.textContent = itemValue.info
  newInfoEl.className = 'list-info'

  medsListItemsEl.append(newLiEl, newInfoEl)

  newTrashIconEl.addEventListener('click', () => {
    let exactLocationOfItemInDB = ref(database, `medsList/${itemID}`)
    remove(exactLocationOfItemInDB)
  })

  newLiSpan.addEventListener('click', () => {
    newInfoEl.style.display === 'none' || !newInfoEl.style.display
      ? (newInfoEl.style.display = 'block')
      : (newInfoEl.style.display = 'none')
  })

  newLiEl.addEventListener('mouseover', () => {
    toggleElement(newTrashIconEl)
  })

  newLiEl.addEventListener('mouseout', () => {
    toggleElement(newTrashIconEl)
  })
}

function toggleElement(element) {
  !element.style.display || element.style.display === 'none'
    ? (element.style.display = 'inline')
    : (element.style.display = 'none')
}

function getMedInfo(medName) {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'ai-medicine-dictionary.p.rapidapi.com',
    },
  }
  fetch(
    `https://ai-medicine-dictionary.p.rapidapi.com/medicine?question=${medName}`,
    options,
  )
    .then((response) => response.text())
    .then((response) => console.log(response))
    .catch((err) => console.error(err))
}
