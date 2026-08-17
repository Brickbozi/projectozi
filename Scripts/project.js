const sidenav = document.getElementById("sidecontent")
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
    <iframe id = "project" src=${(projectPath + "/Project")} 
  width="100%" 
  height="100%" 
  style = "border:none;" 
  title="Example Description"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-forms">
</iframe>
    `

    try {
        let response = await fetch("../Stylesheets/general.css");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let generalCSS = await response.text();
        response = await fetch("../Stylesheets/art.css");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let artCSS = await response.text();

        const iframe = document.getElementById("project")
        iframe.addEventListener('load', () => {
            const genstyle = document.createElement('style');
            genstyle.textContent = generalCSS;

            const artstyle = document.createElement('style');
            artstyle.textContent = artCSS;
            iframe.contentDocument.head.appendChild(genstyle);
            iframe.contentDocument.head.appendChild(artstyle);
        });
        iframe.focus();


    } catch (error) {
        console.log(error.message)
    }
}


checkNode(Projects)


