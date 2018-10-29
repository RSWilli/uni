function letterCount(string) {
    const text = string.split("")

    const letterCounts = new Map()

    text.forEach(char => {
        letterCounts.has(char) ? letterCounts.set(char,letterCounts.get(char) + 1) : letterCounts.set(char, 1)
    });

    return letterCounts
}

let btn = document.getElementById("encrypt")
let decrypt = document.getElementById("decrypt")
let cyphertext = document.getElementById("cyphertext")
let input = document.getElementById("cleartext")
let key = document.getElementById("key")
let output = document.getElementById("output")
let maxLetterInput = document.getElementById("maxLetter")
let dirCheckBox = document.getElementById("dir")
let decryptedOut = document.getElementById("decryptedText")
let guessedKey = document.getElementById("guessedKey")

input.addEventListener("change", function(){
    this.value = this.value.toUpperCase().replace(/[^A-Z]/g, "")
})

const offset = "A".charCodeAt(0)

const modulo = "Z".charCodeAt(0) - ("A".charCodeAt(0) -  1)

/**
 * 
 * @param {String} input Text to en-/decrypt
 * @param {String} key Key
 * @param {Boolean} direction True = decrypt, False = encrypt
 */
function vigenere(input, key, direction) {
    const text = input.match(/./g)

    const keyArray = key.match(/./g)

    const keyLength = keyArray.length

    return text.map((char, index) => {
        const charCode = char.charCodeAt(0) - offset

        let keyCode = keyArray[index % keyLength].charCodeAt(0) - offset

        if(direction) keyCode *= -1

        let viginiereCode = charCode + keyCode

        viginiereCode %= modulo

        viginiereCode = viginiereCode < 0 ? viginiereCode + modulo : viginiereCode

        return String.fromCharCode(viginiereCode + offset)
    }).join("")
}

btn.addEventListener("click", function () {
    output.value = vigenere(input.value, key.value, dirCheckBox.checked)
})

decrypt.addEventListener("click", function () {
    const text = cyphertext.value;

    console.log(text.length)

    const distances = new Map()

    for (let i = 0; i < text.length - 3; i++) {
        const chunk = text.substr(i, 3)

        let k = i + 1

        while(k < text.length - 3){
            const substr = text.substr(k, 3)

            if(chunk === substr ){
                if (!distances.has(chunk)) {
                    distances.set(chunk, [k - i])
                }else{
                    distances.get(chunk).push(k - i)
                }
                break;
            }

            k++;
        }
        
    }

    console.log(distances)

    const uniqueDistances = new Set()

    distances.forEach((val, key) => {
        val.forEach(dist => uniqueDistances.add(dist))
    })

    const uniqueDistArray = [...uniqueDistances]

    console.log(uniqueDistances)

    const divisibleMap = new Map()

    for (let i = 0; i < uniqueDistances.size; i++) {
        let possibleKeyLength = uniqueDistArray[i]

        let divisibleCounter = 0

        uniqueDistances.forEach(distance => {
            divisibleCounter += distance % possibleKeyLength === 0 ? 1 : 0
        });

        divisibleMap.set(possibleKeyLength, divisibleCounter/uniqueDistances.size)
    }

    const tmpMaxKeyLength = [...divisibleMap.entries()].reduce((max, x) => max[1] > x[1] ? max : x)[0]

    for (let possibleKeyLength = 2; possibleKeyLength < (tmpMaxKeyLength / 2) + 1; possibleKeyLength++) {
        
        if (tmpMaxKeyLength % possibleKeyLength !== 0) {
            continue;
        }

        let divisibleCounter = 0

        uniqueDistances.forEach(distance => {
            divisibleCounter += distance % possibleKeyLength === 0 ? 1 : 0
        });

        divisibleMap.set(possibleKeyLength, divisibleCounter/uniqueDistances.size)
    }

    if(divisibleMap.has(1)) divisibleMap.delete(1)

    const keyLength = [...divisibleMap.entries()].reduce((max, x) => max[1] > x[1] ? max : x)[0]

    const chunks = text.match(new RegExp(`.{${keyLength}}`, "g"))

    const rotatedChunks = new Array(keyLength).fill("");

    chunks.forEach(chunk => {
        chunk.match(new RegExp(`.`, "g")).forEach((letter, index) => {
            rotatedChunks[index] += letter
        })
    })

    console.log(rotatedChunks)
    
    const letterCountsPerChunk = rotatedChunks.map(chunk => letterCount(chunk))

    console.log(letterCountsPerChunk)

    const keys = letterCountsPerChunk.map(letterCount => {
        const maxLetter = [...letterCount.entries()].reduce((max, x) => max[1] > x[1] ? max : x)[0]

        const definedMaxLetter = maxLetterInput.value

        const key = ((maxLetter.charCodeAt(0) - definedMaxLetter.charCodeAt(0))) % modulo

        const normKey = key < 0 ? key + modulo : key

        return normKey
    });

    console.log(keys)

    console.log(keys.map(key => String.fromCharCode(key + offset)).join(""))

    const key = keys.map(key => String.fromCharCode(key + offset)).join("")

    decryptedOut.value = vigenere(cyphertext.value, key, true)

    guessedKey.value = key
})