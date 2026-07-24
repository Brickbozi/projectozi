const sidenav = document.getElementById("sidecontent")
const pathDisplay = document.getElementById("pathDisplay")
const img = new Image();
let selected = false;
let selectedName ="";

class Node {
    constructor(value, name) {
        this.value = value;
        this.prev = null;
        this.name = name
    }
}

class LinkedList {
    constructor(value, name) {
        this.head = new Node(value, name);

    }

    append(value, name) {
        let newnode = new Node(value, name);
        newnode.prev = this.head
        this.head = newnode
    }

    pop() {
        if (this.head.prev) {
            const old = this.head
            this.head = this.head.prev
            old.prev = null;
        }
    }


    printList() {
        let current = this.head
        let result = "";
        while (current) {
            console.log(current.name)
            result += current.name + '>';
            current = current.prev;
        }
        console.log(result);
    }
}


function updatePath() {
    current = list
}

function isDirectory(node) {
    return (!(Object.keys(node).some(key => key == 'path')));
}


function fileFunc(path, name) {
    
    if (selected) {
        let prevSelected = document.getElementsByClassName('selected')[0];
        if (prevSelected) {prevSelected.classList.toggle('selected');}

    }

    selected = true;
    selectedName = name;
    img.src = path;
    img.onload = function () {
        viewNewImage();
    }
}

function folderFunc(node, name) {

    list.append(node, name)
    updatePath()
    checkNode(node)

    if (selected) {
        const selectables = document.querySelectorAll('span.highlight-text');
        const target = Array.from(selectables).find(el => el.textContent === selectedName);
        if (target) {
            console.log("found")
            target.parentElement.classList.toggle('selected');
        }
        
    }
}

function updatePath() {
    pathDisplay.innerHTML = ""
    let current = list.head
    let depth = 0
    while (current) {
        const div = document.createElement('div');
        if (current.prev) { div.textContent = "<" + current.name } else {
            div.textContent = current.name + " ";
        }
        const currentDepth = depth;
        div.addEventListener('click', () => revert(currentDepth));
        pathDisplay.appendChild(div)
        current = current.prev
        depth = depth + 1
    }
    const children = Array.from(pathDisplay.children);
    children.reverse().forEach(item => pathDisplay.appendChild(item));
}

function revert(times) {
    if (times == 0) { return }
    for (let i = 0; i < times; i++) {
        backFunc()
    }
}



function backFunc() {
    if (list.head.prev) { // If we are not at the base directory
        list.pop()
    } else { return; }
    updatePath()
    checkNode(list.head.value)
}

function checkNode(folder) {
    sidenav.innerHTML = "";
    for (const key in folder) {
        const fileData = folder[key];
        const div = document.createElement('span');
        div.className = "highlight-container";

        const polygon = document.createElement('span');
        polygon.className = "polygon";
        div.append(polygon);

        const textCont = document.createElement('span');
        textCont.className = "highlight-text";
        textCont.textContent = key;
        div.appendChild(textCont);



        if (isDirectory(fileData)) {
            div.addEventListener('click', () => folderFunc(fileData, key));
            sidenav.appendChild(div);
            continue;
        }
        div.addEventListener('click', () => { 
            fileFunc(fileData.path, key);
            div.classList.toggle('selected');
        });
        sidenav.appendChild(div);

    }
}

// let obj = metaData.filter(path => path.toLowerCase().includes("Throwaway".toLowerCase()));

// console.log(obj);'


initViewer();
let list = new LinkedList(Gallery, "root");
updatePath()
checkNode(list.head.value)


function openFolderFromPath(fullPath) {

    const parts = fullPath.split('/');
    const folderSequence = parts.slice(0, -1);
    list = new LinkedList(Gallery, parts[0]);
    let currentFolderObj = Gallery;
    for (let i = 1; i < folderSequence.length; i++) {
        const folderName = folderSequence[i];
        if (currentFolderObj[folderName]) {
            currentFolderObj = currentFolderObj[folderName];
            list.append(currentFolderObj, folderName);
        } else {
            console.error(`Directory missing along path traversal: ${folderName}`);
            return;
        }
    }
    updatePath();
    checkNode(currentFolderObj);
    const fileName = parts[parts.length - 1];
    if (currentFolderObj[fileName] && currentFolderObj[fileName].path) {
        fileFunc(currentFolderObj[fileName].path);
    }

}


