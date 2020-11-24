const tr = document.querySelector("tr");
const sel = document.querySelectorAll(".Country");
const tds = document.querySelectorAll("td");
const table = document.querySelector("table");
const body = document.querySelector(".films");

let allCell = [];
class Products {
  async getProducts() {
    try {
      let result = await fetch("data.json");
      let data = await result.json();

      let thead = data.thead;
      thead = thead.map((thead) => {
        const type = thead.type;
        const htitle = thead.title;
        const width = thead.width;
        const lists = thead.lists;
        return { type, htitle, width, lists };
      });

      let tbody = data.tbody;
      tbody = tbody.map((tbody) => {
        const id = tbody.id;
        const title = tbody.title;
        const year = tbody.year;
        const country = tbody.country;
        const watch = tbody.width;
        return { id, title, year, country, watch };
      });
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
    let result = "";
    thead.forEach((tname) => {
      result += ` <th class="${tname.type}"> ${tname.htitle}</th>
                `;
      tr.innerHTML = result;
    });
    //таблица
    let resultBody = "";
    tbody.forEach((tlist) => {
      let row = document.createElement("tr");
      resultBody += row.innerHTML = `
        <td class=${thead[0].type} id="${tlist.id}">${tlist.id}</td> 
        <td class=${thead[1].type} id="${tlist.id}" >${tlist.title}</td>
        <td class=${thead[2].type} id="${tlist.id}">${tlist.year}</td>
        <td class=${thead[3].type}>
        <select class="Country" > </select> </td>
        <td>  
        <input type="checkbox" id=${tlist.id}”> </td>
        `;
      document.querySelector(".films").appendChild(row);
    });
    //выпадающий список
    const sel = document.querySelectorAll(".Country");
    for (let i = 0; i < sel.length; i++) {
      sel[i].innerHTML = thead[3].lists
        .map((n) => `<option value=${n}>${n}</option>`)
        .join("");
    }
    const select = document.querySelectorAll(".Country");

    for (let i = 0; i < select.length; i++) {
      for (let j = 0; j < 3; j++) {
        if (select[i].options[j].value == tbody[i].country)
          select[i].options[j].selected = true;
      }
    }

    // редактирование

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
    tds.onclick = function (event) {
      let target = event.target.closest(
        ".edit-cancel ,.edit-ok, .text,.numeric"
      );
      if (!tds.contains(target)) return;

      if (target.className == "edit-cancel") {
        finishTdEdit(editingTd.elem, false);
      } else if (target.className == "edit-ok") {
        finishTdEdit(editingTd.elem, true);
      }
      else if (target.nodeName == "TD") {
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
    localStorage.setItem(products, JSON.stringify(products));
  }
  static getString(id) {
    let list = JSON.parse(localStorage.getItem("[object Object]"));
    return list.tbody.find((products) => products.id == id);
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
