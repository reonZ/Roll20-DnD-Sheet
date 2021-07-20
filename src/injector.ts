/// <reference types="chrome"/>

function addScript(uri: string, parent?: Node) {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL(uri)
    script.onload = () => script.remove()
    parent = parent ?? document.head ?? document.documentElement
    parent.appendChild(script)
}

function addLink(uri: string, parent?: Node) {
    const link = document.createElement('link')
    link.href = (uri.startsWith('http') && uri) || chrome.runtime.getURL(uri)
    link.rel = 'stylesheet'
    parent = parent ?? document.head ?? document.documentElement
    parent.appendChild(link)
}

function addRoot() {
    const anchor = document.createElement('lvk-root')
    anchor.style.position = 'absolute'
    anchor.style.zIndex = '999'
    anchor.style.pointerEvents = 'none'
    document.body.appendChild(anchor)
    return anchor.attachShadow({ mode: 'open' })
}

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node === document.head) {
                addScript('wshook.js')
                addLink('https://fonts.googleapis.com/css?family=Handlee')
                addLink('https://fonts.googleapis.com/css?family=Neucha')
            } else if (node === document.body) {
                const root = addRoot()
                if (!root) throw 'could not create shadow dom element'
                addLink('bundle.css', root)
                addScript('bundle.js', root)
                observer.disconnect()
            }
        }
    }
})
observer.observe(document, { attributes: false, childList: true, subtree: true })

export {}
