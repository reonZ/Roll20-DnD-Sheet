import { derived, writable } from 'svelte/store'
import { isCharacterNpc } from './dnd'
import { getAttribName, getAttributes, isAttribTrue } from './roll20'

export const defaultAttributes = { id: '', name: '', controlledby: '', archived: false, avatar: '' }
export const defaultAttrib = { id: '', name: '', current: '', max: '' }

const _attribListeners = new Set<AttribEventCallback>()

const _characters = writable([''])
const _selectedCharacter = writable(0)
const _selectedMenus = writable([0])
const _isNpc = writable(false)
const _attributes = writable<ROll20CharacterAttributes>({ ...defaultAttributes })

export const cid = derived([_characters, _selectedCharacter], ([characters, selectedCharacter]) => characters[selectedCharacter])
export const characters = derived(_characters, characters => characters.slice(1))
export const nbCharacters = derived(_characters, characters => characters.length - 1)
export const selectedMenu = derived([_selectedMenus, _selectedCharacter], ([selectedMenus, selectedCharacter]) => selectedMenus[selectedCharacter])

let $cid: string
let $characters: string[]
let $selectedCharacter: number

cid.subscribe(x => {
    $cid = x
    _attributes.set(getAttributes($cid) ?? { ...defaultAttributes })
    _isNpc.set($cid ? isCharacterNpc($cid) : false)
})
_characters.subscribe(x => ($characters = x))
_selectedCharacter.subscribe(x => ($selectedCharacter = x))

function selectLastCharacter() {
    _selectedCharacter.set($characters.length - 1)
}

function moveSelectedCharacter(value: 1 | -1) {
    _selectedCharacter.update(x => {
        x = x + value
        if (x >= $characters.length) x = 1
        else if (x < 1) x = $characters.length - 1
        return x
    })
}

function removeCharacter(index: number) {
    if (index < 1) return
    _characters.update(x => {
        x.splice(index, 1)
        return x
    })
    _selectedMenus.update(x => {
        x.splice(index, 1)
        return x
    })
    if ($selectedCharacter >= $characters.length) selectLastCharacter()
}

function dispatchAttribs(id: string, name: UString, data: AttribEventCallbackData) {
    for (const callback of _attribListeners) callback(id, name, data)
}

function wshook({ detail: { attribId, characterId, data } }: WsHookEvent) {
    if (!attribId && !data) return removeCharacter($characters.indexOf(characterId))
    if (characterId !== $cid) return
    if (attribId) {
        const name = getAttribName($cid, attribId)
        if (name === 'npc') _isNpc.set(isAttribTrue((data as Roll20AttribAttributes)?.current))
        else dispatchAttribs(attribId, name, data)
    } else if (data) {
        _attributes.update(x => ({ ...x, ...data }))
    }
}

window.addEventListener('lvk-ws', wshook)

export const isNpc = { subscribe: _isNpc.subscribe }
export const attributes = { subscribe: _attributes.subscribe }
export const attribListener = {
    subscribe: (callback: AttribEventCallback) => _attribListeners.add(callback),
    unsubscribe: (callback: AttribEventCallback) => _attribListeners.delete(callback),
}

export function newCharacter() {
    _selectedCharacter.set(0)
}

export function deleteCharacter() {
    if ($selectedCharacter === 0 && $characters.length > 1) selectLastCharacter()
    else removeCharacter($selectedCharacter)
}

export function nextCharacter() {
    moveSelectedCharacter(1)
}

export function previousCharacter() {
    moveSelectedCharacter(-1)
}

export function addCharacter(cid: string) {
    const index = $characters.indexOf(cid)
    if (index === -1) {
        _characters.update(x => {
            x.push(cid)
            return x
        })
        _selectedMenus.update(x => {
            x.push(0)
            return x
        })
        selectLastCharacter()
    } else {
        _selectedCharacter.set(index)
    }
}

export function selectMenu(index: number) {
    _selectedMenus.update(x => {
        x[$selectedCharacter] = index
        return x
    })
}

export function selectCharacter(cid: string) {
    const index = $characters.indexOf(cid)
    if (index !== -1) _selectedCharacter.set(index)
}
