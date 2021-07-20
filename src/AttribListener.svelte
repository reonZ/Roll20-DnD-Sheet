<script lang="ts">
    import { onMount } from 'svelte'
    import { attribListener, cid, defaultAttrib } from './global'
    import { getAttribByName, setAttrib as setRoll20Attrib } from './roll20'

    export let names: string[]
    export let attribs: AttribRecord

    function onAttribChange(_id: string, name: UString, data: AttribEventCallbackData) {
        if (!name || !data || !names.includes(name)) return
        attribs[name] = { ...attribs[name], ...data }
    }

    function updateAttribs() {
        attribs = {}
        for (const name of names) {
            const attrib = getAttribByName($cid, name)?.attributes
            attribs[name] = attrib ? { ...attrib } : { ...defaultAttrib, name }
        }
    }

    export function setAttrib(name: string, value: string | number, prop: 'current' | 'max' = 'current', updateToken = false) {
        attribs[name] = attribs[name] || { ...defaultAttrib, name }
        if (attribs[name][prop] == value) return
        attribs[name][prop] = value
        setRoll20Attrib($cid, name, value, prop, updateToken)
    }

    $: $cid, names && updateAttribs()

    onMount(() => {
        attribListener.subscribe(onAttribChange)
        return () => attribListener.unsubscribe(onAttribChange)
    })
</script>
