document.addEventListener('DOMContentLoaded', () => {
  loadBotesFromStorage();
  showTab('botes-activos');

  document.getElementById('create-bote-form').addEventListener('submit', (event) => {
    event.preventDefault();
    createBote();
  });

  document.getElementById('add-member-form').addEventListener('submit', (event) => {
    event.preventDefault();
    addMember();
  });
});

function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

function addMember() {
  const memberName = document.getElementById('member-name').value.toUpperCase();
  if (memberName) {
    const memberList = document.getElementById('staff-members-list');
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.innerHTML = `
      <span>${memberName}</span>
      <div>
        <button class="edit-btn" onclick="editMember(this)">EDITAR</button>
        <button class="delete-btn" onclick="deleteMember(this)">ELIMINAR</button>
      </div>
    `;
    memberList.appendChild(memberItem);
    document.getElementById('member-name').value = '';
    sortMembers(memberList);
    updateMemberSelect();
  }
}

function sortMembers(memberList) {
  const members = Array.from(memberList.querySelectorAll('.member-item'));
  members.sort((a, b) => a.children[0].textContent.localeCompare(b.children[0].textContent));
  members.forEach(member => memberList.appendChild(member));
}

function editMember(button) {
  const memberItem = button.parentElement.parentElement;
  const memberName = memberItem.children[0].textContent;
  const newMemberName = prompt('EDITA O NOME:', memberName).toUpperCase();
  if (newMemberName) {
    memberItem.children[0].textContent = newMemberName;
    sortMembers(memberItem.parentElement);
    updateMemberSelect();
  }
}

function deleteMember(button) {
  if (confirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR ESTE MEMBRO?')) {
    const memberItem = button.parentElement.parentElement;
    memberItem.remove();
    updateMemberSelect();
  }
}

function updateMemberSelect() {
  const memberSelect = document.getElementById('new-member');
  const memberList = Array.from(document.getElementById('staff-members-list').querySelectorAll('.member-item span'));
  memberSelect.innerHTML = '<option value="">Selecciona membro</option><option value="todos">Todos</option>';
  memberList.forEach(member => {
    const option = document.createElement('option');
    option.value = member.textContent;
    option.textContent = member.textContent;
    memberSelect.appendChild(option);
  });
}

function addMemberToBote() {
  const memberSelect = document.getElementById('new-member');
  const selectedMember = memberSelect.value;
  if (selectedMember === 'todos') {
    const memberList = Array.from(document.getElementById('staff-members-list').querySelectorAll('.member-item span'));
    memberList.forEach(member => addBoteMember(member.textContent));
  } else if (selectedMember) {
    addBoteMember(selectedMember);
  }
  memberSelect.value = '';
}

function addBoteMember(memberName) {
  const membersList = document.getElementById('members-list');
  if (!Array.from(membersList.querySelectorAll('.member-item span')).find(span => span.textContent === memberName)) {
    const memberItem = document.createElement('div');
    memberItem.className = 'member-item';
    memberItem.innerHTML = `
      <span>${memberName}</span>
      <div>
        <button class="delete-btn" onclick="deleteMemberFromBote(this)">ELIMINAR</button>
      </div>
    `;
    membersList.appendChild(memberItem);
  }
}

function deleteMemberFromBote(button) {
  if (confirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR ESTE MEMBRO?')) {
    const memberItem = button.parentElement.parentElement;
    memberItem.remove();
  }
}

function createBote() {
  const boteName = document.getElementById('bote-name').value.toUpperCase();
  const boteDate = document.getElementById('bote-date').value;
  const members = [...document.querySelectorAll('#members-list .member-item span')].map(span => span.textContent);

  if (!boteName || !boteDate || members.length === 0) {
    alert("Por favor, completa todos los campos y añade al menos un membro.");
    return;
  }

  const boteElement = document.createElement('div');
  boteElement.className = 'bote-element';
  boteElement.innerHTML = `
    <h3>${boteName} - ${boteDate}</h3>
    <button class="btn-blue" onclick="showContributionDialog(this, 'add')">ENGADIR APORTACIÓN</button>
    <button class="btn-purple" onclick="showContributionDialog(this, 'remove')">RETIRAR APORTACIÓN</button>
    <button class="btn-green" onclick="closeBote(this)">CERRAR BOTE</button>
    <button class="btn-red" onclick="deleteBote(this)">ELIMINAR BOTE</button>
    <button class="btn-blue" onclick="showAddMemberDialog(this)">ENGADIR MEMBRO</button>
    <div class="total-bote-container">TOTAL BOTE: <span class="total-bote">0 €</span></div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Membro</th>
            <th>Aportación</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(member => `
            <tr>
              <td>${member}</td>
              <td>0 €</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <h4>HISTÓRICO DE APORTACIÓNS</h4>
    <div class="table-container historical-contributions">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Importe</th>
            <th>Data</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          <!-- Aquí se agregarán las aportaciones históricas -->
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('active-botes-list').appendChild(boteElement);
  saveBotesToStorage();

  resetForm();
  showTab('botes-activos');
  updateTotals();
}

function showContributionDialog(button, action) {
  const boteElement = button.parentElement;
  const dialogSpace = document.getElementById('contribution-dialog-space');
  
  const memberSelect = document.createElement('select');
  memberSelect.innerHTML = [...boteElement.querySelectorAll('.table-container tbody tr')].map(row => `
    <option value="${row.children[0].textContent}">${row.children[0].textContent}</option>
  `).join('');

  const contributionInput = document.createElement('input');
  contributionInput.type = 'number';
  contributionInput.placeholder = 'Importe';

  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Aceptar';
  acceptButton.className = action === 'add' ? 'btn-blue' : 'btn-purple';
  acceptButton.onclick = () => {
    const memberName = memberSelect.value;
    const contributionAmount = parseFloat(contributionInput.value);
    if (!contributionAmount || contributionAmount <= 0) {
      alert('Por favor, introduce un importe válido.');
      return;
    }

    const rows = [...boteElement.querySelectorAll('.table-container tbody tr')];
    const memberRow = rows.find(row => row.children[0].textContent === memberName);
    const currentAmount = parseFloat(memberRow.children[1].textContent.replace(' €', ''));

    const totalBote = boteElement.querySelector('.total-bote');
    const currentTotalBote = parseFloat(totalBote.textContent.replace(' €', ''));

        if (action === 'add') {
      memberRow.children[1].textContent = `${currentAmount + contributionAmount} €`;
      totalBote.textContent = `${currentTotalBote + contributionAmount} €`;
      addHistoricalContribution(boteElement, memberName, contributionAmount);
    } else {
      memberRow.children[1].textContent = `${currentAmount - contributionAmount} €`;
      totalBote.textContent = `${currentTotalBote - contributionAmount} €`;
      addHistoricalContribution(boteElement, memberName, -contributionAmount);
    }

    closeContributionDialog(dialogSpace);
  };

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Cerrar';
  closeButton.className = 'btn-red';
  closeButton.onclick = () => closeContributionDialog(dialogSpace);

  const contributionDialog = document.createElement('div');
  contributionDialog.className = 'contribution-dialog';
  contributionDialog.appendChild(memberSelect);
  contributionDialog.appendChild(contributionInput);
  contributionDialog.appendChild(acceptButton);
  contributionDialog.appendChild(closeButton);

  dialogSpace.innerHTML = '';
  dialogSpace.appendChild(contributionDialog);
}

function closeContributionDialog(dialogSpace) {
  dialogSpace.innerHTML = '';
  saveBotesToStorage();
}

function addHistoricalContribution(boteElement, memberName, amount) {
  const historicalContributionsTable = boteElement.querySelector('.historical-contributions tbody');
  const date = new Date().toLocaleDateString();
  const contributionRow = document.createElement('tr');
  contributionRow.innerHTML = `
    <td>${memberName}</td>
    <td class="total-recaudado">${amount} €</td>
    <td>${date}</td>
    <td><button class="btn-yellow" onclick="editHistoricalContribution(this)">EDITAR</button></td>
    <td><button class="btn-red" onclick="deleteHistoricalContribution(this)">ELIMINAR</button></td>
  `;
  historicalContributionsTable.appendChild(contributionRow);
  saveBotesToStorage();
}

function editHistoricalContribution(button) {
  const contributionRow = button.parentElement.parentElement;
  const memberName = contributionRow.children[0].textContent;
  const oldAmount = parseFloat(contributionRow.children[1].textContent.replace(' €', ''));
  const newAmount = parseFloat(prompt('Nuevo importe:', oldAmount));
  if (!newAmount || newAmount <= 0) {
    alert('Por favor, introduce un importe válido.');
    return;
  }
  contributionRow.children[1].textContent = `${newAmount} €`;

  const boteElement = contributionRow.closest('.bote-element');
  const totalBote = boteElement.querySelector('.total-bote');
  const currentTotalBote = parseFloat(totalBote.textContent.replace(' €', ''));
  totalBote.textContent = `${currentTotalBote - oldAmount + newAmount} €`;
  saveBotesToStorage();
}

function deleteHistoricalContribution(button) {
  const contributionRow = button.parentElement.parentElement;
  const amount = parseFloat(contributionRow.children[1].textContent.replace(' €', ''));

  const boteElement = contributionRow.closest('.bote-element');
  const totalBote = boteElement.querySelector('.total-bote');
  const currentTotalBote = parseFloat(totalBote.textContent.replace(' €', ''));
  totalBote.textContent = `${currentTotalBote - amount} €`;

  contributionRow.remove();
  saveBotesToStorage();
}

function closeBote(button) {
  if (confirm('¿ESTÁ SEGURO DE QUE DESEA CERRAR ESTE BOTE?')) {
    const boteElement = button.parentElement;
    const boteName = boteElement.querySelector('h3').textContent;
    const totalBote = boteElement.querySelector('.total-bote').textContent;
    const historicalBotesList = document.getElementById('historical-botes-list');

    const historicalBoteElement = document.createElement('div');
    historicalBoteElement.className = 'bote-element';
    historicalBoteElement.innerHTML = `
      <h3>${boteName}</h3>
      <p>CERRADO EL: ${new Date().toLocaleDateString()}</p>
      <p class="total-recaudado-container">TOTAL RECAUDADO: ${totalBote}</p>
      <button class="btn-red" onclick="deleteBote(this)">ELIMINAR BOTE</button>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th class="importe">Importe</th>
              <th>Data</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            ${boteElement.querySelector('.historical-contributions tbody').innerHTML}
          </tbody>
        </table>
      </div>
    `;

    historicalBotesList.appendChild(historicalBoteElement);
    boteElement.remove();
    updateTotals();
    saveBotesToStorage();
  }
}

function deleteBote(button) {
  if (confirm('¿ESTÁ SEGURO DE QUE DESEA ELIMINAR ESTE BOTE?')) {
    const boteElement = button.parentElement;
    boteElement.remove();
    updateTotals();
    saveBotesToStorage();
  }
}

function updateTotals() {
  const activeBotesList = document.getElementById('active-botes-list');
  let totalToCollect = 0;
  let totalCollected = 0;

  activeBotesList.querySelectorAll('.bote-element').forEach(bote => {
    totalToCollect += parseFloat(bote.querySelector('.total-bote').textContent.replace(' €', ''));
    totalCollected += parseFloat(bote.querySelector('.total-bote').textContent.replace(' €', ''));
  });
}

function resetForm() {
  document.getElementById('bote-name').value = '';
  document.getElementById('bote-date').value = '';
  document.getElementById('members-list').innerHTML = '';
}

function showAddMemberDialog(button) {
  const boteElement = button.parentElement;
  const dialogSpace = document.getElementById('contribution-dialog-space');
  
  const memberSelect = document.createElement('select');
  memberSelect.innerHTML = [...document.querySelectorAll('#staff-members-list .member-item span')].map(span => `
    <option value="${span.textContent}">${span.textContent}</option>
  `).join('');

  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Aceptar';
  acceptButton.className = 'btn-blue';
  acceptButton.onclick = () => {
    const memberName = memberSelect.value;
    if (memberName) {
      const membersList = boteElement.querySelector('.table-container tbody');
      const existingMember = Array.from(membersList.querySelectorAll('tr')).find(row => row.children[0].textContent === memberName);

      if (!existingMember) {
        const newMemberRow = document.createElement('tr');
        newMemberRow.innerHTML = `
          <td>${memberName}</td>
          <td>0 €</td>
        `;
        membersList.appendChild(newMemberRow);
        closeAddMemberDialog(dialogSpace);
        saveBotesToStorage();
      } else {
        alert('El miembro ya está en el bote.');
      }
    }
  };

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Cerrar';
  closeButton.className = 'btn-red';
  closeButton.onclick = () => closeAddMemberDialog(dialogSpace);

  const addMemberDialog = document.createElement('div');
  addMemberDialog.className = 'contribution-dialog';
  addMemberDialog.appendChild(memberSelect);
  addMemberDialog.appendChild(acceptButton);
  addMemberDialog.appendChild(closeButton);

  dialogSpace.innerHTML = '';
  dialogSpace.appendChild(addMemberDialog);
}

function closeAddMemberDialog(dialogSpace) {
  dialogSpace.innerHTML = '';
}

function saveBotesToStorage() {
  const activeBotesList = document.getElementById('active-botes-list');
  const historicalBotesList = document.getElementById('historical-botes-list');
  const botesData = {
    active: activeBotesList.innerHTML,
    historical: historicalBotesList.innerHTML
  };
  localStorage.setItem('botesData', JSON.stringify(botesData));
}

function loadBotesFromStorage() {
  const botesData = JSON.parse(localStorage.getItem('botesData'));
  if (botesData) {
    document.getElementById('active-botes-list').innerHTML = botesData.active;
    document.getElementById('historical-botes-list').innerHTML = botesData.historical;
  }
}
