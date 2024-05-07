var isHidden = true;

document.getElementById("hourForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const salary = parseFloat(document.getElementById("salary").value);
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  const monthlyHours = 220;
  const hourlyRate = salary / monthlyHours; // Taxa horária corrigida
  const extraPercentage = document.querySelector('input[name="extraType"]:checked').value;
  const extraMultiplier = 1 + (parseFloat(extraPercentage) / 100);
  const extraHourlyRate = hourlyRate * extraMultiplier;


  const start = new Date("1970-01-01T" + startTime + "Z");
  const end = new Date("1970-01-01T" + endTime + "Z");
  const diff = end - start; // Diferença em milissegundos

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const timeWorked = hours + ":" + (minutes < 10 ? "0" : "") + minutes;

  const totalExtra = (hours + minutes / 60) * extraHourlyRate;

  saveData(date, timeWorked, totalExtra, salary);
  updateTable();
});

function saveData(date, timeWorked, total, salary, weeklyHours) {
  const currentData = JSON.parse(localStorage.getItem('extraHoursData')) || [];
  currentData.push({ date, timeWorked, total });
  localStorage.setItem('extraHoursData', JSON.stringify(currentData));
  localStorage.setItem('salary', salary);
  localStorage.setItem('weeklyHours', weeklyHours);
}

function loadData() {
  const savedSalary = localStorage.getItem('salary');

  if(savedSalary) {
      document.getElementById('salary').value = savedSalary;
  }
}

function deleteData(index) {
  const data = JSON.parse(localStorage.getItem("extraHoursData")) || [];
  data.splice(index, 1);
  localStorage.setItem("extraHoursData", JSON.stringify(data));
  updateTable();
}

function updateTable() {
  const data = JSON.parse(localStorage.getItem("extraHoursData")) || [];
  const resultTable = document.getElementById("resultTable");
  resultTable.innerHTML = "";

  let totalMinutes = 0;
  let totalAmount = 0;

  data.forEach((item, index) => {
    const timeParts = item.timeWorked.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    totalMinutes += hours * 60 + minutes;
    totalAmount += item.total;

    const row = `
            <tr>
                <td>${item.date}</td>
                <td>${item.timeWorked}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
                <td><button class="btn btn-outline-danger btn-sm" onclick="deleteData(${index})">Excluir</button></td>
            </tr>
        `;
    resultTable.innerHTML += row;
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const totalExtraMinutes = totalMinutes % 60;
  const totalTimeWorked = `${totalHours}:${
    totalExtraMinutes < 10 ? "0" : ""
  }${totalExtraMinutes}`;
  const totalDecimal = (totalMinutes / 60).toFixed(2);

  const totalElement = document.getElementById("total");
  totalElement.innerHTML = `
        <p>Total de Horas Extras: <span id="totalHours" data-toggle="tooltip" data-placement="top" title="${totalDecimal} horas">${totalTimeWorked}</span> horas<br>Total a Receber: R$ ${totalAmount.toFixed(
    2
  )}</p>
    `;

  // Inicializa os tooltips do Bootstrap
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function hideNumbers() {
  var input = document.getElementById("salary");
  input.type = "password";
}

function toggleVisibility() {
  var input = document.getElementById("salary");
  if (isHidden) {
    input.type = "text";
    isHidden = false;
  } else {
    input.type = "password";
    isHidden = true;
  }
}
document.getElementById("deleteAll").addEventListener("click", function () {
  if (confirm("Tem certeza de que deseja excluir todos os registros?")) {
    localStorage.removeItem("extraHoursData");
    updateTable();
  }
});

// Inicializa a tabela quando a página é carregada
document.addEventListener("DOMContentLoaded", () => {
  isHidden = false;
  toggleVisibility();
  loadData()
  updateTable()
});
