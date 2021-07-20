<script lang="ts">
    import { tick } from 'svelte'
    import { cid, nbCharacters, nextCharacter } from './global'
    import SheetHeader from './SheetHeader.svelte'
    import CharacterSelect from './CharacterSelect.svelte'
    import CharacterSelectPopup from './CharacterSelectPopup.svelte'
    import SheetContent from './SheetContent.svelte'

    const offset = { x: 0, y: 0 }
    const origin = { x: 0, y: 0 }

    let sheetEl: HTMLDivElement
    let backgroundEl: HTMLDivElement

    let isCollapsed = false
    let hasDragged = false
    let isFastSelecting = false

    function startDrag(event: MouseEvent) {
        if (event.button !== 0) return
        const elRect = sheetEl.getBoundingClientRect()
        origin.x = event.clientX
        origin.y = event.clientY
        offset.x = event.clientX - elRect.left
        offset.y = event.clientY - elRect.top
        document.addEventListener('mousemove', drag)
        document.addEventListener('mouseup', endDrag)
    }

    function updateConstraints(location: Point = sheetEl.getBoundingClientRect()) {
        const viewport = { w: backgroundEl.clientWidth, h: backgroundEl.clientHeight }
        if (location.x < 0) location.x = 0
        else if (location.x + sheetEl.offsetWidth > viewport.w) location.x = viewport.w - sheetEl.offsetWidth
        if (location.y < 0) location.y = 0
        else if (location.y + sheetEl.offsetHeight > viewport.h) location.y = viewport.h - sheetEl.offsetHeight
        sheetEl.style.left = location.x + 'px'
        sheetEl.style.top = location.y + 'px'
    }

    function drag(event: MouseEvent) {
        const current = { x: event.clientX, y: event.clientY }
        if (!hasDragged) {
            if (Math.hypot(current.x - origin.x, current.y - origin.y) < 10) return
            hasDragged = true
        }
        updateConstraints({ x: current.x - offset.x, y: current.y - offset.y })
    }

    function endDrag() {
        hasDragged = false
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', endDrag)
    }

    async function toggleCollapsed() {
        isCollapsed = !isCollapsed
        await tick()
        updateConstraints()
    }

    function characterSelection() {
        if ($nbCharacters < 1) return
        if ($nbCharacters === 1 && $cid === '') nextCharacter()
        else if ($nbCharacters === 2 && $cid !== '') nextCharacter()
        else if ($nbCharacters > 1) isFastSelecting = true
    }

    $: $cid, (isFastSelecting = false)
</script>

<div bind:this={backgroundEl} class="background">
    <div bind:this={sheetEl} class="sheet" class:collapsed={isCollapsed} on:contextmenu|preventDefault>
        {#if isCollapsed}
            <div class="expand" on:mousedown={startDrag} on:dblclick={toggleCollapsed} />
        {:else}
            <SheetHeader on:toggleCollapsed={toggleCollapsed} on:startDrag={e => startDrag(e.detail)} on:characterSelection={characterSelection} />
            <div class="body">
                {#if $cid}
                    <SheetContent />
                {:else}
                    <CharacterSelect />
                {/if}
                {#if isFastSelecting}
                    <CharacterSelectPopup on:close={() => (isFastSelecting = false)} />
                {/if}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    @use 'colors';
    @use 'icons';

    .background {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .sheet {
        position: fixed;
        top: 100px;
        left: 200px;
        width: 800px;
        height: 600px;
        pointer-events: all;
        user-select: none;
        font-family: 'Handlee', 'Neucha';
        font-size: 16px;
        line-height: 22px;
        border-radius: 5px 5px 5px 5px/25px 25px 25px 5px;
        border: 3px solid colors.$border;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        color: colors.$color;
        background-color: colors.$bgcolor;
        overflow: hidden;
        box-shadow: 3px 3px 5px;
        box-sizing: border-box;

        &.collapsed {
            width: fit-content !important;
            height: fit-content !important;
            min-height: 0;
            min-width: 0;
        }

        :global(*) {
            box-sizing: border-box;
        }
    }

    .body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        position: relative;
    }

    .expand {
        height: 32px;
        width: 40px;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        filter: colors.$color-filter;
        background-size: 60%;
        background-image: icons.$expand;
    }
</style>
