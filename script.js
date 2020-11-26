const tr = document.querySelector("tr");
const sel = document.querySelectorAll(".Country");
const tds = document.querySelectorAll("td");
const table = document.querySelector("table");
const body = document.querySelector(".films");

let cell = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch("data.json");
      let data = await result.json();
      let thead = data[0];
      let tbody = data[1];
      return { thead, tbody };
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    let thead = products.thead;
    let tbody = products.tbody;
    //шапка

    let elem = document.querySelector("tr");
    let rows = thead.length;
    for (var i = 0; i < rows; i++) {
      var th = document.createElement("th");
      //   th.id = `thead${Thead[1]}`;
      th.innerHTML = `${thead[i][1]}`;
      elem.appendChild(th);
    }

    for (let i = 0; i < tbody.length; i++) {
      let row = document.createElement("tr");
      for (let j = 0; j < thead.length; j++) {
        let col = document.createElement("td");
        col.className = `${thead[j][0]}`;
        if (thead[j][0] == "watch") {
          let input = document.createElement("input");
          input.type = "checkbox";
          input.className = "checkbox";
          input.id = `${tbody[i][0]}`;
          input.checked = tbody[i][4];
          col.appendChild(input);
        }
        else if(thead[j][0] == "toggle"){
          let list = document.createElement("select");
          list.className = "country";
          col.appendChild(list);
        }
        else{
          col.innerHTML = tbody[i][j];
        }
       
        row.appendChild(col);
      }
      document.querySelector(".films").appendChild(row);
    }

    //выпадающий список
    const sel = document.querySelectorAll(".country");
    for (let i = 0; i < sel.length; i++) {
      sel[i].innerHTML = thead[3][3]
        .map((n) => `<option value=${n}>${n}</option>`)
        .join("");
    }
    const select = document.querySelectorAll(".country");

    for (let i = 0; i < select.length; i++) {
      for (let j = 0; j < 3; j++) {
        if (select[i].options[j].value == tbody[i][3])
          select[i].options[j].selected = true;
      }
    }
 

    //измениение ширины
    let x = document.querySelectorAll("th");

    for (let i = 0; i < x.length; i++) {
      let span = document.createElement("span");
      span.className = `resize-handle`;
      x[i].appendChild(span);
    }

    let min = 50;
    const columnTypeToRatioMap = {
      numeric: 1,
      "text-short": 1.67,
      "text-long": 3.33,
    };

    const table = document.querySelector("table");

    const columns = [];
    let headerBeingResized;

    const onMouseMove = (e) =>
      requestAnimationFrame(() => {
        console.log("onMouseMove");

        let horizontalScrollOffset = document.documentElement.scrollLeft;
        const width =
          horizontalScrollOffset + e.clientX - headerBeingResized.offsetLeft;

        const column = columns.find(
          ({ header }) => header === headerBeingResized
        );
        column.size = Math.max(min, width) + "px";

        columns.forEach((column) => {
          if (column.size.startsWith("minmax")) {
            column.size = parseInt(column.header.clientWidth, 10) + "px";
          }
        });

        table.style.gridTemplateColumns = columns
          .map(({ header, size }) => size)
          .join(" ");
      });

    const onMouseUp = () => {
      console.log("onMouseUp");

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      headerBeingResized.classList.remove("header--being-resized");
      headerBeingResized = null;
    };

    const initResize = ({ target }) => {
      console.log("initResize");

      headerBeingResized = target.parentNode;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      headerBeingResized.classList.add("header--being-resized");
    };

    document.querySelectorAll("th").forEach((header) => {
      const max = columnTypeToRatioMap[header.dataset.type] + "fr";
      columns.push({
        header,

        size: `minmax(${min}px, ${max})`,
      });

      header
        .querySelector(".resize-handle")
        .addEventListener("mousedown", initResize);
    });
  }
  enterEvent() {
    const tds = document.querySelector("tbody");
    let editingTd;
    let id;
    let value;

    tds.onclick = function (event) {
      let target = event.target.closest(
        ".edit-cancel ,.edit-ok, .text,.numeric, .checkbox"
      );
      if (!tds.contains(target)) return;

      if (target.className == "edit-cancel") {
        finishTdEdit(editingTd.elem, false);
      } else if (target.className == "edit-ok") {
        finishTdEdit(editingTd.elem, true);
      } else if (target.className == "checkbox") {
    
        let stringItem = { ...Storage.getString(target.id)};
     
        cell = [...cell, stringItem];
 
        Storage.saveCell(cell);
      } else if (target.nodeName == "TD") {
        if (editingTd) return;

        makeTdEditable(target);
      }

      function makeTdEditable(td) {
        editingTd = {
          elem: td,
          data: td.innerHTML,
        };

        td.classList.add("edit-td");
        let textArea = document.createElement("textarea");
        textArea.className = "edit-area";

        textArea.value = td.innerHTML;
        td.innerHTML = "";
        td.appendChild(textArea);
        textArea.focus();

        td.insertAdjacentHTML(
          "beforeEnd",
          '<div class="edit-controls"><button class="edit-ok">OK</button><button class="edit-cancel">CANCEL</button></div>'
        );
      }
    };
    function finishCheckEdit(id, isOk) {}

    function finishTdEdit(td, isOk) {
      if (isOk) {
        td.innerHTML = td.firstChild.value;
      
      } else {
        td.innerHTML = editingTd.data;
      }
      td.classList.remove("edit-td");
      editingTd = null;
    }

    function validateForm() {
      if (!/^[0-9]+$/.test(z)) {
        z.insertAdjacentHTML(
          "afterend",
          '<p class="error-message">Введите цифры </p>'
        );
      }
    }
  }
}

class Storage {
  static saveEdit(products) {
    localStorage.setItem(products, JSON.stringify(products.tbody));
  }
  static getString(id, isOK) {
    let list = JSON.parse(localStorage.getItem("[object Object]"));

    return list.find((tbody) => tbody[0] == id);
  }
  static saveCell(cell) {
    localStorage.setItem("cell", JSON.stringify(cell));
    console.log(cell);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveEdit(products);
    })
    .then(() => ui.enterEvent());
});
