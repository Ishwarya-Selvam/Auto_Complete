// import fetchFromApi from "./fetchDataModule"

const inputBox = document.querySelector(".searchInput")

inputBox.addEventListener("input", debounce(handleSuggestions))

async function handleSuggestions(e){
    const keyword = e.target.value
    console.log(keyword)
    //make an api call
    const suggestions = await getCountries(keyword)
    console.log(suggestions)
    populateSuggestions(suggestions)
}

function populateSuggestions(suggestions){

    const suggestionBox = document.querySelector(".suggestionBox")

    suggestionBox.innerHTML = ""

    if(!suggestions.length){
        return
    }

    
    suggestionBox.classList.add("visible")

    const fragment = document.createDocumentFragment()

    suggestions.forEach((countryName) => {
        const li = document.createElement("li")
        li.innerText = countryName
        fragment.appendChild(li)
    })

    suggestionBox.appendChild(fragment)
    
}

async function getCountries(keyword){
    const countriesData = await fetchFromApi(keyword)
    const countryNames =  countriesData.map((country) => country.name.common)
    return countryNames
}

let currentFetchController = null

async function fetchFromApi(keyword){
    try{
        
        if(currentFetchController !== null){
            console.log("Cancelling the ongoing fetch request")
            currentFetchController.abort()
        }

        let abortController = new AbortController()
        
        currentFetchController = abortController

        const rawRes = await fetch(`https://restcountries.com/v3.1/name/${keyword}`, {
            signal: abortController.signal
        })

        currentFetchController = null

        const res = await rawRes.json()

        if(rawRes.status === 200)
            return res

        if(rawRes.status === 404){
            console.log("Page not found")
            return []
        }

        return []
    }
    catch(err){
        console.log("error", err)
    }
}

function debounce(fnToMakeNetworkCall, delay=500){

    let timerId=null;

    return function(e){

        if(timerId){
            clearTimeout(timerId);
        }

        timerId = setTimeout(()=>{
            fnToMakeNetworkCall(e);
            timerId=null;
        },delay)

    }

}

// If we have made 3 requests a, ab, abc
// There is no way to predict which req will complete first 
// If in any case we have got the results of abc first, there is no need in getting the result of a and ab
// we can abort the req of a and ab

// TO IMPLEMENT ABORTCONTROLLER:
// Attach a abort signal to the fetch request