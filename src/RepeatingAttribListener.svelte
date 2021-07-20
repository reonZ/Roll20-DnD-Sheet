<script lang="ts" context="module">
    export const sortCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

    export function changeSuffix(str: string, suffix: string) {
        return str.split('_').slice(0, 3).join('_') + '_' + suffix
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { attribListener, cid } from './global'
    import { getCharacterById, setAttrib as setRoll20Attrib } from './roll20'

    export let prefix: string
    export let suffixes: string[]

    prefix = 'repeating_' + prefix

    const repeatingRegex = new RegExp(`^${prefix}_[\\w\\d-]+?_(${suffixes.join('|')})$`)

    let attribIds: StringUObject = {}
    let attribs: AttribRecord = {}

    function onAttribChange(id: string, name: UString, data: AttribEventCallbackData) {
        if (id in attribIds) {
            if (!data) {
                delete attribs[attribIds[id]!]
                delete attribIds[id]
                attribs = attribs
            } else if (name) {
                attribs[name] = { ...attribs[name], ...data }
            }
        } else if (data && name && name.match(repeatingRegex)) {
            attribIds[id] = name
            attribs[name] = { ...data } as Attrib
        }
    }

    function updateAttribs() {
        attribIds = {}
        attribs = {}
        getCharacterById($cid)?.attribs.forEach(attr => {
            const name = attr.attributes.name
            if (name && name.match(repeatingRegex)) {
                attribIds[attr.id] = name
                attribs[name] = { ...attr.attributes }
            }
        })
    }

    function getAttribList(attribs: AttribRecord) {
        const collection: Record<string, RepeatingAttribRecord> = {}
        for (const attrib in attribs) {
            const split = attrib.split('_')
            const id = split[2]
            const suffix = split.slice(3).join('_')
            collection[id] = collection[id] || { id }
            collection[id][suffix] = attribs[attrib]
        }
        const list = Object.values(collection) as RepeatingAttribRecordList
        list.setAttrib = (name: string, value: string | number, prop: 'current' | 'max' = 'current') => {
            if (!name) return
            if (name in attribs) attribs[name][prop] = value
            setRoll20Attrib($cid, name, value, prop)
        }
        list.filterBySuffix = (suffix: string, values: Array<string | undefined> | string | undefined) => {
            values = typeof values !== 'object' ? [values] : values
            return list.filter(x => values!.includes(x[suffix]?.current?.toString().toLowerCase()!))
        }
        list.sortAttribs = (suffix: string) =>
            [...list].sort((a, b) => sortCollator.compare(a[suffix]?.current?.toString() || '', b[suffix]?.current?.toString() || ''))
        return list
    }

    $: $cid, updateAttribs()
    $: attribList = getAttribList(attribs)

    onMount(() => {
        attribListener.subscribe(onAttribChange)
        return () => attribListener.unsubscribe(onAttribChange)
    })
</script>

<slot attribs={attribList} />
