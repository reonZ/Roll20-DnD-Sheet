import Sheet from './Sheet.svelte'

const root = document.querySelector('lvk-root')?.shadowRoot
if (!root) throw 'could not find shadowroot of "lvk-root" element'

const sheet = new Sheet({
    target: root as unknown as Element,
})

export default sheet
