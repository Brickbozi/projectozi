


const sidenav = document.getElementById("sidecontent")
const pathDisplay = document.getElementById("pathDisplay")
const img = new Image();

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


function fileFunc(path) {
    
    img.src = path;
    img.onload = function () {
        viewNewImage();
    }
}

function folderFunc(node, name) {
    list.append(node, name)
    updatePath()
    checkNode(node)
}

function updatePath() {
    pathDisplay.innerHTML = ""
    let current = list.head
    let depth = 0
    while (current) {
        const div = document.createElement('div');
        if (current.prev) { div.textContent = "<" +  current.name} else {
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
    for(let i = 0; i < times; i++) {
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
        const div = document.createElement('div');
        div.textContent = key;

        if (isDirectory(fileData)) {
            div.addEventListener('click', () => folderFunc(fileData, key));
            sidenav.appendChild(div);
            continue;
        }
        div.addEventListener('click', () => fileFunc(fileData.path));
        sidenav.appendChild(div);

    }
}



initViewer();
let list = new LinkedList(Gallery, "root");
updatePath()
checkNode(list.head.value)
