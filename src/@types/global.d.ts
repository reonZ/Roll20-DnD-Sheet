declare interface Window {
    process?: {
        env: StringObject
    }
    Campaign?: Roll20Campaign
    currentPlayer?: {
        id: string
    }
    is_god?: boolean
    is_gm?: boolean
}

declare interface Point {
    x: number
    y: number
}

declare type UString = string | undefined
declare type StringObject = Record<string, string>
declare type StringUObject = Record<string, UString>

declare type AttribEventCallbackData = Partial<Roll20AttribAttributes> | null
declare type AttribEventCallback = (id: string, name: UString, data: AttribEventCallbackData) => void

declare type AttribValue = string | number | { current?: string | number; max?: string | number }
declare type Attrib = Roll20AttribAttributes
declare type AttribRecord = Record<string, Attrib>
declare type RepeatingAttribRecord = AttribRecord & { id: string }
declare type RepeatingAttribRecordList = RepeatingAttribRecord[] & {
    setAttrib: (name: string, value: string | number, prop?: 'current' | 'max') => void
    sortAttribs: (suffix: string) => RepeatingAttribRecord[]
    filterBySuffix: (suffix: string, values: Array<string | undefined> | string | undefined) => RepeatingAttribRecord[]
}
declare type SetAttribFunction = (name: string, value: string | number, prop: 'current' | 'max' = 'current', updateToken = false) => void

declare interface Popup {
    open<T extends Record<string, any>>(slot: SvelteComponent, args?: T): void
    close(): void
}

declare interface ConfirmPopup {
    title?: string
    text: string
    accept?: Function
}

declare type HtmlInputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement
    data: string
    inputType: 'insertText' | 'deleteContentBackward' | 'deleteContentForward'
}
