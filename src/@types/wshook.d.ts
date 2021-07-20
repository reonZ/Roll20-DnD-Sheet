declare interface WsHookMessage {
    characterId: string
    attribId: UString
    data: null | Partial<Roll20AttribAttributes> | Partial<ROll20CharacterAttributes> | { [x: string]: Roll20AttribAttributes }
}

declare type WsHookEvent = CustomEvent<WsHookMessage>
