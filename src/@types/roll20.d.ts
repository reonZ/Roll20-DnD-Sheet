declare interface Roll20Collection<T> extends Array<T> {
    _byId: { [x: string]: T }
}

declare interface ROll20Attributes {
    id: string
    name: string
}

declare interface Roll20Model<T> {
    id: string
    attributes: T
}

declare interface Roll20AttribAttributes extends ROll20Attributes {
    current: string | number
    max: string | number
}

declare interface Roll20Attrib extends Roll20Model<Roll20AttribAttributes> {
    set(key: keyof Roll20AttribAttributes, value: any): void
    save(attributes?: Omit<Roll20AttribAttributes, 'id'>): void
    destroy(): void
}

declare interface ROll20CharacterAttributes extends ROll20Attributes {
    controlledby: string
    archived: boolean
    avatar: string
}

declare interface Roll20Character extends Roll20Model<ROll20CharacterAttributes> {
    attribsHaveArrived: Promise<boolean>
    attribs: Roll20Collection<Roll20Attrib> & {
        create(attributes?: Omit<Partial<Roll20AttribAttributes>, 'id'>): Roll20Attrib
    }
    updateTokensByName(attrib: string, id: string): void
}

declare interface Roll20Token {
    character: Roll20Character | false
}

declare interface Roll20CharacterToken {
    character: Roll20Character
}

declare type Roll20wsType = 'characters' | 'char-blobs' | 'char-attribs' | 'players'

declare interface Roll20Campaign {
    activePage: () => {
        thegraphics: Roll20Collection<Roll20Token>
    }
    activeCharacters: () => Roll20Collection<Roll20Character>
    characters: Roll20Collection<Roll20Character>
}
