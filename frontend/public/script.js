const packageSchema = {
    id: 0,
    name: "",
    description: "",
    dependencies: [],
    releases: []
}

function PackageSchemaAsHTML({name, description, dependencies, releases}) {
    // add X buttons for each dependency and each version
    const depAsHTML = dependencies.map((dep) => `<div id="dependencies" class=_${dep}>
                                                    ${dep}
                                                    <button id="X">X</button>
                                                </div>`).join("");
    const relAsHTML = releases.map((rel) => `<div id="releases" class=_${rel.version.replaceAll(".", "")}>
                                                ${rel.version}
                                                <button id="X">X</button>
                                                <input type="text" id="relInp" value="${rel.version}">
                                                <input type="date" id="relInp" value="${rel.date}">
                                            </div>`).join("");
    return `<div class="package-schema">
                <span>Package Schema</span>
                <dl>
                    <dt>id</dt>
                    <dd class="id"></dd>
                    <dt>name</dt>
                    <dd class="name">${name}</dd>
                    <dt>description</dt>
                    <dd class="description">${description}</dd>
                    <dt>dependencies</dt>
                    <dd class="dependencies">${depAsHTML}</dd>
                    <dt>releases</dt>
                    <dd class="releases">${relAsHTML}</dd>
                </dl>
            </div>`
}

const form = function({name, description, dependencies, releases}) {
    return `<form autocomplete="off">
                <label for="name">Name:</label>
                <input type="text" id="name" value="${name}"><br><br>
                <label for="descr">Details:</label>
                <textarea id="descr" rows="4" cols="50" value="${description}"></textarea><br><br>
                <label for="dep">Dependency:</label>
                <input type="text" id="dep" list="packages" value="${dependencies[0] || ""}">
                <datalist id="packages"></datalist><br><br>
                <label for="rel">Version:</label>
                <button id="rel">+</button>
                <input type="text" id="rel" value="${releases[0]?.version || ""}"><br><br>
                <input type="date" id="rel" value="${releases[0]?.date || ""}"><br><br>
                <button type="submit">SAVE</button>
            </form>`
}

function addEventForXButtons () {
    Array.from(document.querySelectorAll("#X")).map((XButton) => XButton.addEventListener("click", XButtonEvent));
}

function XButtonEvent(event) {
    const property = event.target.parentNode.id;
    const DependencyOrVersionName = event.target.parentNode.className.slice(1);
    
    // delete item from packageSchema[property]
    packageSchema[property].splice(packageSchema[property].indexOf(DependencyOrVersionName), 1);

    // remove dependency/version and her XButton
    const elementToBeRemoved = document.querySelector(`div#${property}._${DependencyOrVersionName}`);
    document.querySelector(`.${property}`).removeChild(elementToBeRemoved);
    // console.log(packageSchema);
}

async function DepInputEvent(event) {
    // clear dataList before adding new data
    const dataList = document.querySelector("#packages");
    dataList.innerHTML = "";

    if (event.target.value.length < 3) return;
    const response = await fetch("/api/package"); 
    // {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(event.target.value)
    // }
    const packages = await response.json()
    const filteredPackages = packages.filter((p) => p.name.includes(event.target.value));
    filteredPackages.map((p) => dataList.insertAdjacentHTML("beforeend", `<option value=${p.name}--${p.releases[0].version}>`));
    return; 
}

function DepInputChangeEvent(event) {
    const packageName = event.target.value.split("--")[0];
    // add packageName to PackageSchema object
    if (packageName !== "" && !packageSchema.dependencies.includes(packageName)) {
        packageSchema.dependencies.push(packageName);
        // update PackageSchema in HTML
        document.querySelector('.dependencies').insertAdjacentHTML("beforeend", 
            `<div id="dependencies" class=_${packageName}>
                ${packageName}
                <button id="X">X</button>
            </div>`);
    }
    // add delete event for X buttons
    addEventForXButtons();
}

function addVersionEvent(event) {
    const unformattedDate = new Date();
    const formattedDate = `${unformattedDate.getFullYear()}-${unformattedDate.getMonth() + 1 < 10 ? `0${unformattedDate.getMonth() + 1}` : `${unformattedDate.getMonth() + 1}`}-${unformattedDate.getDate()}`;
    const versionNr = packageSchema.releases[0].version.split(".").map((v, idx) => {
        if (idx === 2) {
            return (Number(v) + 1).toString();
        } else {
            return v;
        }
    }).join(".");
    console.log(formattedDate, versionNr);
    packageSchema.releases.unshift({date: formattedDate, version: versionNr});

    // add new version to HTML
    document.querySelector(".releases").insertAdjacentHTML("afterbegin", 
        `<div id="releases" class=_${versionNr.replaceAll(".", "")}>
            ${versionNr}
            <button id="X">X</button>
            <input type="text" id="relInp" value="${versionNr}">
            <input type="date" id="relInp" value="${formattedDate}">
        </div>`);
    // console.log(packageSchema);

    // add delete event for X buttons
    addEventForXButtons();
}

function addEventForReleasesInputs() {
    // change an already added version change the packageSchema as well
    document.querySelector('input#relInp[type="text"]').addEventListener("input", (event) => {
        const versionNrAsArray = event.target.value.split(".");
        if (versionNrAsArray.length === 3 && versionNrAsArray[versionNrAsArray.length - 1] !== "") {
            packageSchema.releases[0].version = versionNrAsArray.join(".");
        }
        // console.log(packageSchema);
    })

    document.querySelector('input#relInp[type="date"]').addEventListener("change", (event) => {
        const typedDateAsArray = event.target.value.split("-");
        if (typedDateAsArray.length === 3 
         && typedDateAsArray[0].length === 4
         && typedDateAsArray[1].length === 2
         && typedDateAsArray[2].length === 2) {
            packageSchema.releases[0].date = typedDateAsArray.join("-");
        };
        console.log(packageSchema);
    })
}

async function makeRequest(url = "", method, data = {}) {
    console.log("url", url);
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    return response.json();
  }

function submitEvent(event) {
    if (event.target[0].value === "" 
     || event.target[4].value === ""
     || event.target[4].value.split(".").length !== 3
     || event.target[4].value.split(".")[event.target[4].value.split(".").length - 1] === ""
     || event.target[5].value === "") {
        alert("Name Field, Version Number Field and Version Date Field are Mandatory and must type in correct form !");
        return;
     };
    // update the packageSchema object
    packageSchema.name = event.target[0].value;
    packageSchema.description = event.target[1].value;
    const newDependency = event.target[2].value.split("--")[0];

    if (newDependency !== "" && !packageSchema.dependencies.includes(newDependency)) {
        packageSchema.dependencies.push(newDependency);
    }

    const versionObj = {
        date: event.target[5].value,
        version: event.target[4].value
    };

    if (packageSchema.releases.length === 0 && versionObj.version.split(".").length === 3 && versionObj.date.length === 10) {
        packageSchema.releases.push(versionObj);
    } else if (versionObj.version.split(".").length === 3
        && versionObj.date.length === 10
        && !packageSchema.releases.includes(versionObj) 
        && new Date(versionObj.date).getTime() >= new Date(packageSchema.releases[0].date).getTime()
        && versionObj.version.split(".").filter((v, idx) => Number(v) >= packageSchema.releases[0].version.split(".")[idx]).length === 3) {
        packageSchema.releases.push(versionObj);
    }
    
    // delete anterior packageSchema from HTML and add new packageSchema
    document.querySelector(".package-schema").remove();
    document.querySelector("#root").insertAdjacentHTML("afterbegin", PackageSchemaAsHTML(packageSchema));
    // console.log(packageSchema);

    // add delete event for X buttons
    addEventForXButtons();
    // add functionality for releases inputs
    addEventForReleasesInputs();

    // make a put request to server
    const LastSectionOfURL = window.location.href.split("/")[window.location.href.split("/").length - 1];
    if (Number.isInteger(Number(LastSectionOfURL))) {
        makeRequest(`/api/package/${LastSectionOfURL}`, "PUT", packageSchema)
            .then(resp => {
                if (resp.message === "DONE") {
                    document.querySelector("#root > form").remove();
                    console.log(resp.updatedObj);
                    document.querySelector("#root").insertAdjacentHTML("beforeend", form(resp.updatedObj));
                    alert("PUT REQUEST WAS SUCCESFULL!");
                }
            })
            .catch(err => alert(err));
    // make a post request to the server
    } else if (window.location.pathName = "/edit/package" && LastSectionOfURL === "package") {
        makeRequest("/api/package", "POST", packageSchema)
            .then(resp => {
                fetch(`/edit/package/${resp.id}`)
                    .then(resp => window.location = resp.url);
            })
            .catch(err => alert(err));
        
    }

    event.preventDefault();
}

const loadEvent = _ => {
    const rootElement = document.querySelector("#root");
    // insert Package Schema and Form in HTML
    rootElement.insertAdjacentHTML("beforeend", PackageSchemaAsHTML(packageSchema));
    rootElement.insertAdjacentHTML("beforeend", form(packageSchema));

    // add submit event listener for form
    const formTag = document.querySelector("form");
    formTag.addEventListener("submit", submitEvent);

    // add input event listener for Dependency input
    const DependencyInput = document.querySelector("#dep");
    DependencyInput.addEventListener("input", DepInputEvent);
    DependencyInput.addEventListener("change", DepInputChangeEvent);

    const addVersion = document.querySelector("button#rel");
    addVersion.addEventListener("click", addVersionEvent);
};

window.addEventListener("load", loadEvent);
