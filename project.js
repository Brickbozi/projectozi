const sidenav = document.getElementById("sidecontent")
const pathDisplay = document.getElementById("pathDisplay")
let selected = false;
let selectedName = "";
const stagingArea = document.getElementById("staging-area");
let projectPath = "";


async function openDocs() {
    if (!projectPath) {
        console.log("nope");
        return;
    }

    selected = true;
    selectedName = name;
    try {
        const response = await fetch(projectPath + "/README.txt");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.text();
        const div = document.createElement('div');
        div.textContent = result;
        stagingArea.innerHTML = result;

    } catch (error) {
        console.log(error.message)
    }

}

function fileFunc(path) {

    if (selected) {
        let prevSelected = document.getElementsByClassName('selected')[0];
        if (prevSelected) { prevSelected.classList.toggle('selected'); }

    }
    selected = true;
    projectPath = path;
    playProject();

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


        div.addEventListener('click', () => {
            fileFunc(fileData.path);
            div.classList.toggle('selected');
        });
        sidenav.appendChild(div);

    }
}

async function playProject() {
    if (!projectPath) {
        console.log("nope");
        return;
    }

    stagingArea.innerHTML =
        `
    <iframe id="project" src=${(projectPath + "/Project")} 
  width="100%" 
  height="100%" 
  style = "border:none;"
  title="Example Description"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-forms">
</iframe>
    `
    try {
        const response = await fetch("art.css");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.text();
        const iframe = document.getElementById("project");

        iframe.addEventListener('load', () => {
            const style = document.createElement('style');
            style.textContent = result;
            iframe.contentDocument.head.appendChild(style);

        });


    } catch (error) {
        console.log(error.message)
    }
}


checkNode(Projects)


