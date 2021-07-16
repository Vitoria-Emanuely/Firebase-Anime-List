const db = firebase.firestore()
let animes = []
let currentUser = {}
let currentAnime = {}

function getUser(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user){
            currentUser.uid = user.uid
            readAnimes()
            let userLabel = document.getElementById("navbarDropdown")
            userLabel.innerHTML = user.email
        } else {
            swal.fire({
                icon: "success",
                title: "Redirecionando para a tela de autenticação",
            }).then(    () => {
                setTimeout( () => {
                    window.location.replace("login.html")
                }, 1000)
            })
        }
    })
}

function createDelButton(anime){
    const newButton = document.createElement('button')
    newButton.setAttribute("class", "btn btn-info ml-1")
    newButton.appendChild(document.createTextNode("Excluir"))
    newButton.setAttribute("onclick", `deleteAnime("${anime.id}")`)
    return newButton
}

function renderAnimes(){
    let itemList = document.getElementById("itemList")
    itemList.innerHTML = ""
    for (let anime of animes){
        const div = document.createElement("div")
        div.setAttribute("class", "row")
        itemList.appendChild(div)
        const newName = document.createElement("div")
        const newEp = document.createElement("div")
        const newEpT = document.createElement("div")
        const newStatus = document.createElement("div")
        const button = document.createElement("div")
        const bar = document.createElement("div")
        const buttonEdit = document.createElement("div")
        const inputId = document.createElement("input")
        newName.setAttribute("class", "ml-2 mt-4 col-3")
        newName.appendChild(document.createTextNode(anime.title))
        div.appendChild(newName)
        newEp.setAttribute("class", "ml-5 mt-4 col-1")
        newEp.appendChild(document.createTextNode(anime.ep))
        div.appendChild(newEp)
        bar.setAttribute("class", "mt-3 bar space")
        bar.appendChild(document.createTextNode("/"))
        div.appendChild(bar)
        newEpT.setAttribute("class", "ml-5 mt-4 col-1")
        newEpT.appendChild(document.createTextNode(anime.epTotal))
        div.appendChild(newEpT)
        newStatus.setAttribute("class", "mt-4 col-2 space")
        newStatus.appendChild(document.createTextNode(anime.status))
        button.setAttribute("class", "mt-4 col-1")
        button.appendChild(createDelButton(anime))
        div.appendChild(newStatus)
        div.appendChild(button)
        buttonEdit.setAttribute("class", "mt-4 col-1 space")
        buttonEdit.appendChild(createEditButton(anime))
        div.appendChild(buttonEdit)
        inputId.setAttribute("value", anime.id)
        inputId.setAttribute("type", "hidden")
        div.appendChild(inputId)
    }
}

async function readAnimes(){
    animes = []
    const logAnimes = await db.collection("animes").where("owner", "==", currentUser.uid).get()
    for (doc of logAnimes.docs){
        animes.push({
            id: doc.id,
            title: doc.data().title,
            ep: doc.data().ep,
            epTotal: doc.data().epTotal,
            status: doc.data().status
        })
    }
    renderAnimes()
}

async function addAnime(){
    const itemList = document.getElementById("itemList")
    const newName = document.createElement("div")
    const newEp = document.createElement("div")
    const newEpT = document.createElement("div")
    const newStatus = document.createElement("div")
    const div = document.createElement("div")
    div.setAttribute("class", "row")
    itemList.appendChild(div)
    newName.setAttribute("class", "ml-2 mt-4 col-3")
    newName.appendChild(document.createTextNode("Adicionando na nuvem..."))
    div.appendChild(newName)
    newEp.setAttribute("class", "ml-2 mt-4 col-1")
    div.appendChild(newEp)
    newEpT.setAttribute("class", "ml-2 mt-4 col-1")
    newEpT.setAttribute("id", "epT")
    div.appendChild(newEpT)
    newStatus.setAttribute("class", "ml-2 mt-4 col-1")
    div.appendChild(newStatus)

    const title = document.getElementById("newName").value
    const ep = document.getElementById("newEp").value
    const epT = document.getElementById("newEpT").value
    const status = document.getElementById("newStatus").value
    let result = await compairTitle(title)

    if (comparison() &&  result){
        await db.collection("animes").add({
            title: title,
            ep: ep,
            epTotal: epT,
            status: status,
            owner: currentUser.uid,
        })
        readAnimes()
    } else {
        div.removeChild(newName)
    }    
}

async function deleteAnime(id){
    await db.collection("animes").doc(id).delete()
    readAnimes()
}

function comparison(){
    const ep = document.getElementById("newEp").value
    const epT = document.getElementById("newEpT").value
    const status = document.getElementById("newStatus").value

    if (parseInt(ep) > parseInt(epT)){
        alert("Digite um número de episódios assistidos válido!")
        return false
    }    
    if (status == "Status"){
        alert("Selecione um status!")
        return false
    } 
    return true   
}

function comparisonModal(){
    const ep = document.getElementById("inputEp").value
    const epT = document.getElementById("inputEpT").value
    const status = document.getElementById("inputStatus").value

    if (parseInt(ep) > parseInt(epT)){
        alert("Digite um número de episódios assistidos válido!")
        return false
    }    
    if (status == "Status"){
        alert("Selecione um status!")
        return false
    } 
    return true   
}

function addStatus(){
    const ep = document.getElementById("newEp").value
    const epT = document.getElementById("newEpT").value
    const select = document.getElementById('newStatus')[0]
    const cpl = document.getElementById("newStatus")[2]
    const ass = document.getElementById("newStatus")[3]

    if (parseInt(ep) > 0 ){
        select.removeAttribute("selected")
        cpl.removeAttribute("selected")
        ass.setAttribute("selected", "")
    } 
    
    if (parseInt(ep) == parseInt(epT)){
        select.removeAttribute("selected")
        ass.removeAttribute("selected")
        cpl.setAttribute("selected", "")
    }  
}

function addStatusModal(){
    const ep = document.getElementById("inputEp").value
    const epT = document.getElementById("inputEpT").value
    const selectM = document.getElementById('inputStatus')[0]
    const cplM = document.getElementById("inputStatus")[2]
    const assM = document.getElementById("inputStatus")[3]

    if (parseInt(ep) > 0 ){
        selectM.removeAttribute("selected")
        cplM.removeAttribute("selected")
        assM.setAttribute("selected", "")
    }  

    if (parseInt(ep) == parseInt(epT)){
        selectM.removeAttribute("selected")
        assM.removeAttribute("selected")
        cplM.setAttribute("selected", "")
    }  
}

function createEditButton(anime){
    const newButton = document.createElement('button')
    newButton.setAttribute("class", "btn btn-info ml-1")
    newButton.setAttribute("data-toggle", "modal")
    newButton.setAttribute("data-target", "#modal")
    newButton.appendChild(document.createTextNode("Editar"))
    newButton.setAttribute("onclick", `getAnimeInfo("${anime.id}")`)
    return newButton
}

async function getAnimeInfo(id){
    const logAnimes = await db.collection("animes").where(firebase.firestore.FieldPath.documentId(), '==', id).get()   
    const animeData = logAnimes.docs[0]
    currentAnime.id = id
    currentAnime.title = animeData.data().title
    currentAnime.ep = animeData.data().ep
    currentAnime.epTotal = animeData.data().epTotal
    currentAnime.status = animeData.data().status
    document.getElementById("inputName").value = currentAnime.title
    document.getElementById("inputEp").value = currentAnime.ep
    document.getElementById("inputEpT").value = currentAnime.epTotal
    document.getElementById("inputStatus").value = currentAnime.status
}

async function saveAnime(){
    const title = document.getElementById("inputName").value
    const ep = document.getElementById("inputEp").value
    const epT = document.getElementById("inputEpT").value
    const status = document.getElementById("inputStatus").value

    if (comparisonModal()){
        await db.collection("animes").doc(currentAnime.id).update({
            title: title,
            ep: ep,
            epTotal: epT,
            status: status,
        })
        $('#modal').modal('hide');
        readAnimes()
    }    
}

async function compairTitle(name){
    const logAnimes = await db.collection("animes").where("owner", "==", currentUser.uid).get()
    for (doc of logAnimes.docs){
        if (doc.data().title.toLowerCase() == name.toLowerCase()){
            alert("Esse nome de anime já foi cadastrado!")
            return false
        }  
    }
    return true     
}

window.onload = function(){
    getUser()
}