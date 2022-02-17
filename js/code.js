const canvas = document.getElementById("canvas");
const HeightInput = document.getElementById("heightInp");
const WidthInput = document.getElementById("widthInp");
const NameInput = document.getElementById("nameInp");
const colorInput = document.getElementById("colorInp");
const fileInput = document.getElementById("ghost");
const cellSize = document.getElementById("cellSize");
const CSSvariables = document.querySelector(":root");

let preserve = false;
let drawing = false;
let erasing = false;
let Height = 10;
let Width = 10;
HeightInput.value = Height;
WidthInput.value = Width;

cellSize.value = getCSSVar("--size").slice(0,-2);

document.getElementById("changeBtn").addEventListener("click",() => {Change(WidthInput.value,HeightInput.value)});
document.getElementById("changeBtnSize").addEventListener("click",() => {ChangeSize(cellSize.value)});
document.getElementById("exportBtn").addEventListener("click", BlobGod);
document.getElementById("importBtn").addEventListener("click", Import);
document.getElementById("preserve").addEventListener("click", togglePreserve);
document.getElementById("colorInp").addEventListener("change",() => {ChangeColor(colorInput.value)})

function CanvasGod(height,width) {
    if (height <= 0) {
        height = 1;
    }
    if (width <= 0) {
        width = 1;
    }

    if (preserve === true) {
        if (Height < height) {
            for (let x = 0; x < height; x++) {
                if (x >= Height) {
                    const newRow = canvas.insertRow(-1);
                    for (let y = 0; y < Width; y++) {
                        newRow.insertCell(-1);
                    }
                }
                for (let y = 0; y < Width; y++) {
                    let temp = canvas.rows[x].cells[y].cloneNode();
                    canvas.rows[x].cells[y].replaceWith(temp);
                }
                if (Width > width) {
                    let dif = Width-width;
                    for (let y = 0; y < dif; y++) {
                        canvas.rows[x].deleteCell(-1);
                    }
                }
                else if (Width < width) {
                    let dif = width-Width;
                    for (let y = 0; y < dif; y++) {
                        canvas.rows[x].insertCell(-1);
                    }
                }
            }
        }
        else {
            for (let x = 0; x < Height; x++) {
                for (let y = 0; y < width; y++) {
                    let temp = canvas.rows[x].cells[y].cloneNode();
                    canvas.rows[x].cells[y].replaceWith(temp);
                }
                if (x >= height) {
                    canvas.deleteRow(-1);
                }
                else {
                    if (Width > width) {
                        let dif = Width-width;
                        for (let y = 0; y < dif; y++) {
                            canvas.rows[x].deleteCell(-1);
                        }
                    }
                    else if (Width < width) {
                        let dif = width-Width;
                        for (let y = 0; y < dif; y++) {
                            canvas.rows[x].insertCell(-1);
                        }
                    }
                }
            }
        }
    }
    else {
        canvas.innerHTML = "";
        for (let x = 0; x < height;x++) {
            const newRow = canvas.insertRow(x);
            for (let y = 0; y < width; y++) {
                newRow.insertCell(y);
            }
        }
    }
    Height = height;
    Width = width;
    document.querySelectorAll("td").forEach(cell => {
        
        cell.addEventListener("mousedown", () => {
            cell.classList.toggle("filled");
            if (cell.classList.contains("filled")) {
                drawing = true;
            }
            else {
                erasing = true;
            }
        })
    
        cell.addEventListener("mouseover",() => {
            if (drawing) {
                cell.classList.add("filled");
            }
            if (erasing) {
                cell.classList.remove("filled");
            }
        });
    
        cell.addEventListener("mouseup",() => {
            if (drawing) {
                drawing = false;
            }
            if (erasing) {
                erasing = false;
            }
        });

        cell.addEventListener('dragstart', (e) => {
        e.preventDefault()
        })

        cell.addEventListener('drop', (e) => {
        e.preventDefault()
        })
    });
}

function AddEvents(Cell) {
    Cell.addEventListener("mousedown", () => {
        Cell.classList.toggle("filled");
        if (Cell.classList.contains("filled")) {
            drawing = true;
        }
        else {
            erasing = true;
        }
    })

    Cell.addEventListener("mouseover",() => {
        if (drawing) {
            Cell.classList.add("filled");
        }
        if (erasing) {
            Cell.classList.remove("filled");
        }
    });

    Cell.addEventListener("mouseup",() => {
        if (drawing) {
            drawing = false;
        }
        if (erasing) {
            erasing = false;
        }
    });
}

function Change(width,height) {
    if (height && Number.isInteger(parseInt(height)) && width && Number.isInteger(parseInt(width))) {
        CanvasGod(parseInt(height),parseInt(width));
    }
}

function ChangeSize(size) {
    if (size && Number.isInteger(parseInt(size))) {
        CSSvariables.style.setProperty('--size', size+"px");
    }
}

function ChangeColor(color) {
    if (color) {
        CSSvariables.style.setProperty('--color', color);
    }
}

function getCSSVar(value) {
    return getComputedStyle(CSSvariables).getPropertyValue(value);
}

function togglePreserve() {
    if (document.getElementById("preserve").checked) {
        preserve = true;
    }
    else {
        preserve = false;
    }
}

function BlobGod() {
    let name = NameInput.value;
    if (!name) {
        name = prompt("Name Creation","untitled");
    }
    if (name) {
        let file = new Blob([Export()],{type:"text/plain;charset=utf-8"});

        saveAs(file,name+".txt");
    }
}

function Export() {
    let Export = "";
    Export += "color = "+getCSSVar("--color")+"\n";
    Export += "size = "+getCSSVar("--size")+"\n ";
    for (let z = 0; z < Width; z++) {
        Export += "-";
    }
    Export += " \n";
    for (let x = 0; x < Height; x++) {
        Export += "|";
        let Row = canvas.rows[x];
        for (let y = 0; y < Width; y++) {
            let Cell = Row.cells[y];
            if (Cell.classList.contains("filled")) {
                Export += "⬛";
            }
            else {
                Export += " ";
            }
        }
        Export += "|\n";
    }
    Export += " ";
    for (let z = 0; z < Width; z++) {
        Export += "-";
    }
    Export += " ";
    return Export;
}

function Import() {
    fileInput.click();
    
    fileInput.onchange = () => {
        const Reader = new FileReader();
        let file = fileInput.files[0];
        Reader.readAsText(file);
        Reader.onload = () => {
            let data = Reader.result;
            data = data.replaceAll("|","").replaceAll("-","").split("\n");

            ChangeColor(data[0].slice(8, data[0].length));
            ChangeSize(data[1].slice(7, -2));
            data = data.slice(3,-1);
            Change(data[0].length,data.length);

            for (row in data) {
                let Row = data[row];
                Row = Row.split("");
                for (cell in Row) {
                    if (cell < Width) {
                        let Cell = Row[cell];
                        let canCell = canvas.rows[row].cells[cell];
                        if (Cell == "⬛") {
                            canCell.classList.toggle("filled");
                        }
                    }
                }
            }
        };
    }
}

CanvasGod(Height,Width);