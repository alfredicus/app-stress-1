function changeSigma(s1, s2, s3) {
    document.querySelector("div.sigma-1").querySelector("p.card-text").innerHTML = 'σ1: ' + (0.5 - Math.random()).toFixed(3)
    document.querySelector("div.sigma-2").querySelector("p.card-text").innerHTML = 'σ2: ' + (0.5 - Math.random()).toFixed(3)
    document.querySelector("div.sigma-3").querySelector("p.card-text").innerHTML = 'σ3: ' + (0.5 - Math.random()).toFixed(3)
}

// ===========================================================

function fullScreen() {
    var element = document.querySelector("body")
    element.requestFullscreen()
}
