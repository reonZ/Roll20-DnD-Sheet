export function roll20Input(
    input: HTMLInputElement | HTMLTextAreaElement,
    { keydown, skipReturn }: { keydown?: (event: KeyboardEvent) => void; skipReturn?: boolean } = {}
) {
    input.autocomplete = 'off'
    input.spellcheck = false

    function callback(event: KeyboardEvent) {
        const key = event.key

        if (!skipReturn && key === 'Enter') {
            event.preventDefault()
            input.blur()
            return
        }

        const content = input.value

        if (key === 'Backspace') {
            event.stopPropagation()
            event.preventDefault()

            const startSelection = input.selectionStart!
            const endSelection = input.selectionEnd!

            let caret = -1
            if (startSelection !== endSelection) {
                input.value = content.slice(0, startSelection) + content.slice(endSelection)
                caret = startSelection
            } else if (startSelection) {
                input.value = content.slice(0, startSelection - 1) + content.slice(endSelection)
                caret = startSelection - 1
            }

            if (caret >= 0) input.setSelectionRange(caret, caret)
        } else if (keydown) {
            keydown(event)
        }

        if (input.value !== content) {
            input.dispatchEvent(
                new Event('input', {
                    bubbles: true,
                    cancelable: true,
                })
            )
        }
    }

    input.addEventListener('keydown', callback)

    return {
        destroy() {
            input.removeEventListener('keydown', callback)
        },
    }
}
