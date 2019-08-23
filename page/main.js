const list = document.getElementById('item-list')
const modalInput = document.getElementById('modal-input')
const filterModal =  document.getElementById('filter-modal')
const filterInput = document.getElementById('filter-input')
const modalBody = document.getElementById('modal-body')

titles.forEach(title => {
  const item = document.createElement('li')
  item.onclick = handleItemClick
  item.className = 'list-item'
  item.textContent = title
  list.appendChild(item)
})

function openModal() {
  filterModal.classList.add('show')

  setTimeout(() => {
    filterInput.focus()
  // 500ms matches the transition duration defined in CSS.
  // Ideally this would be done with events or some fancy animation library,
  // so that we don't need to rely on keeping the two intervals consistent.
  }, 500)
}

function closeModal() {
  filterModal.classList.remove('show')
}

function handleItemClick(event) {
  modalInput.value = event.target.innerText
  closeModal()
}

function handleSearchBlur() {
  filterModal.classList.remove('show')
}

function handleHeaderTouchMove(event) {
  event.preventDefault()
}

function handleFilterChange(value) {
  const items = document.getElementsByClassName('list-item')

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item.innerText.toLowerCase().includes(value.toLowerCase())) {
      item.classList.remove('hidden')
    } else {
      item.classList.add('hidden')
    }
  }
}

function handleModalScroll () {
  if (modalBody.scrollHeight - modalBody.scrollTop === modalBody.clientHeight) {
    modalBody.scrollTop -= 1
  }
}
