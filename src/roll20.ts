export function isAttribTrue(value: string | number | undefined | null) {
    return (value || '0') !== '0'
}

export function isAttribTrueOfDefault(value: string | number | undefined | null) {
    return isAttribTrue(value ?? 'on')
}

export function isAttribEmpty(value: string | number | undefined | null) {
    return value === undefined || value === null || value === ''
}

export function isGM() {
    return window.is_god || window.is_gm
}

export function getPlayerId() {
    return window.currentPlayer?.id
}

export function getCampaign() {
    return window.Campaign
}

export function getCharacterById(cid: string) {
    return getCampaign()?.characters?._byId[cid]
}

export function isOwned(character: string | Roll20Character | undefined) {
    if (isGM()) return true
    character = typeof character !== 'string' ? character : getCharacterById(character)
    const controlledby = character?.attributes.controlledby ?? ''
    return controlledby.indexOf('all') !== -1 || controlledby.indexOf(getPlayerId()!) !== -1
}

export function getOwnedCharacters() {
    return (
        getCampaign()?.characters?.reduce((acc, curr) => {
            if (!curr.attributes.archived && isOwned(curr)) acc.push(curr.id)
            return acc
        }, [] as Array<string>) ?? []
    )
}

export function getAttributes(cid: string) {
    return getCharacterById(cid)?.attributes
}

export function getAttribute(cid: string, name: keyof ROll20CharacterAttributes) {
    return getAttributes(cid)?.[name]
}

export function getAttribs(cid: string) {
    return getCharacterById(cid)?.attribs
}

export function getAttribById(cid: string, id: string) {
    return getAttribs(cid)?._byId[id]
}

export function getAttribName(cid: string, id: string) {
    return getAttribById(cid, id)?.attributes.name
}

export function getAttribByName(cid: string, name: string) {
    return getAttribs(cid)?.find(x => x.attributes.name === name)
}

export function getCurrentAttribByName(cid: string, name: string) {
    return getAttribByName(cid, name)?.attributes.current
}

let chatInput: HTMLTextAreaElement
function getChatInput() {
    chatInput = chatInput || document.querySelector('#textchat-input textarea')
    return chatInput
}

let chatBtn: HTMLButtonElement
function getChatButton() {
    chatBtn = chatBtn || document.querySelector('#textchat-input button')
    return chatBtn
}

export function sendChatMsg(msg: string) {
    const input = getChatInput()
    const btn = getChatButton()
    if (!input || !btn) return
    const oldValue = input.value
    input.value = msg
    btn.click()
    input.value = oldValue
}

const nameRegex = /@{/g
export function sendCharacterRoll(cid: string, action: string) {
    const name = getAttribute(cid, 'name')
    if (!name) return
    action = action.replace(nameRegex, `@{${name}|`)
    sendChatMsg(action)
}

export function sendCharacterAttribRoll(cid: string, attrib: string) {
    sendCharacterRoll(cid, `@{${attrib}}`)
}

export function setAttrib(cid: string, attrib: string, value: AttribValue, prop: 'current' | 'max' = 'current', updateToken = false) {
    const character = getCharacterById(cid)
    if (!character) return

    const attribs = character.attribs
    if (!attribs) return

    let attr = attribs.find(x => x.attributes.name === attrib)
    if (!attr) attr = attribs.create({ name: attrib })

    attr.set(prop, value)
    attr.save()

    if (updateToken) character.updateTokensByName(attrib, attr.id)
}
