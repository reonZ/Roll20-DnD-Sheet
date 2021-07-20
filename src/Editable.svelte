<script lang="ts" context="module">
    const sanitizeRegex = /[^\w\d,-;\s]/g
</script>

<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
    import { roll20Input } from './tools/input'

    export let value: string | number
    export let min: number = 0
    export let max: number = 999

    export let multi = false
    export let textAlign = 'center'
    export let minWidth = '1ch'
    export let maxWidth = '10ch'
    export let padding = 0

    const type = typeof value
    const dispatch = createEventDispatcher()

    let hidden: HTMLSpanElement
    let input: HTMLInputElement | HTMLTextAreaElement

    function setSize() {
        if (!input) return

        hidden.textContent = input.value
        input.style.width = hidden.offsetWidth + 'px'

        if (multi) {
            input.style.height = ''
            input.style.height = input.scrollHeight + 'px'
        }
    }

    function onKeydown(event: KeyboardEvent) {
        const key = event.key

        if (key.length > 1 || event.ctrlKey) return

        if (type === 'number') {
            const hasSign = input.value.startsWith('-')
            const startSelection = input.selectionStart!
            const endSelection = input.selectionEnd!

            if (key === ' ' || key === '+') {
                event.preventDefault()
            } else if (key === '-') {
                if (min >= 0 || startSelection || (hasSign && !endSelection)) event.preventDefault()
            } else if (isNaN(Number(key))) {
                event.preventDefault()
            } else if (hasSign && !startSelection && input.selectionEnd === input.selectionStart) {
                event.preventDefault()
            }
        } else {
            if (key.match(sanitizeRegex)) event.preventDefault()
        }
    }

    function onPaste(event: ClipboardEvent) {
        event.preventDefault()
        event.stopPropagation()

        const startSelection = input.selectionStart!
        const endSelection = input.selectionEnd!

        //@ts-ignore
        let paste = (event.clipboardData || window.clipboardData).getData('text/plain').trim()

        if (type === 'number') {
            paste = Number(paste.replaceAll('+', ''))
            if (paste === -0) paste = 0
            if (isNaN(paste)) return
            if (paste < 0 && startSelection) return
        } else {
            paste = paste.replace(sanitizeRegex, '')
        }

        let newContent = input.value.slice(0, startSelection) + paste + input.value.slice(endSelection)

        if (type === 'number') {
            let clamped = Number(newContent)
            if (clamped < min) clamped = min
            else if (clamped > max) clamped = max
            newContent = clamped.toString()
        }

        input.value = newContent

        let caret = startSelection + paste.toString().length
        if (caret > newContent.length) caret = newContent.length
        input.setSelectionRange(caret, caret)

        setSize()
    }

    function onWheel(event: WheelEvent) {
        event.preventDefault()
        event.stopPropagation()

        let num = Number(input.value)

        if (event.deltaY > 0) num -= 1
        else if (event.deltaY < 0) num += 1

        if (num > max) num = max
        else if (num < min) num = min

        if (input.value !== num.toString()) {
            input.value = num.toString()
            setSize()
        }
    }

    function onFocus() {
        if (type === 'number') document.addEventListener('wheel', onWheel, { passive: false })
    }

    function onBlur() {
        onUpdate()
        cleanup()
    }

    function cleanup() {
        if (type === 'number') document.removeEventListener('wheel', onWheel)
    }

    function onUpdate() {
        let content = input.value
        if (type === 'number') {
            if (content === '' || content === '-0' || content === '-') content = '0'
            const num = Number(content)
            if (num < min) content = min.toString()
            else if (num > max) content = max.toString()
        } else {
        }
        input.textContent = content
        if (value !== content) {
            value = content
            dispatch('update', value)
        }
    }

    $: value != null && tick().then(setSize)
    $: max = max < min ? min + 1 : max

    onDestroy(cleanup)
</script>

<span class="hidden" bind:this={hidden} />
<textarea
    class="input"
    class:multi
    bind:this={input}
    use:roll20Input={{ keydown: onKeydown, skipReturn: multi }}
    type="text"
    {value}
    on:input={setSize}
    on:paste={onPaste}
    on:focus={onFocus}
    on:blur={onBlur}
    rows="1"
    style="text-align: {textAlign}; min-width: {minWidth}; max-width: {maxWidth}; padding-left: {padding}px; padding-right: {padding}px;"
/>

<style lang="scss">
    @use 'colors';

    .hidden,
    .input {
        border: 0;
    }

    .hidden {
        position: absolute;
        height: 0;
        overflow: hidden;
        white-space: pre;
        padding: 0 2px;
    }

    .input {
        font: inherit;
        margin: 0;
        padding: 0;
        color: inherit;
        background: inherit;
        outline: none;
        border-bottom: 1px solid colors.$border-verylight;
        resize: none;
        overflow: hidden;

        &:not(.multi) {
            white-space: nowrap;
            height: 18px;
            margin-bottom: 4px;
        }

        &:focus {
            border-color: colors.$border-light;
        }
    }
</style>
