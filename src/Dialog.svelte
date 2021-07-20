<script lang="ts">
    import type { SvelteComponent } from 'svelte'

    let visible = false
    let content: SvelteComponent | undefined
    let header: string
    let props: Record<string, any> = {}

    export function open(slot: SvelteComponent, args: Record<string, any> = {}) {
        content = slot
        props = args
        visible = true
    }

    export function close() {
        visible = false
        content = undefined
        header = ''
        props = {}
    }
</script>

{#if visible}
    <div class="background" on:contextmenu|self={close} on:click|self={close}>
        <div class="dialog">
            {#if header}
                <div class="header">{header}</div>
            {/if}
            <svelte:component this={content} on:close={close} bind:header {...props} />
        </div>
    </div>
{/if}

<style lang="scss">
    @use 'colors';

    .background {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    .dialog {
        position: absolute;
        min-width: 20%;
        max-width: 90%;
        max-height: 90%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -54%);
        background-color: colors.$bgcolor;
        box-shadow: 2px 2px 4px;
        border-radius: 5px 5px 5px 5px/25px 25px 25px 5px;
        border: 2px solid #4b4a44;
        display: flex;
        flex-direction: column;
    }

    .header {
        border-bottom: 2px solid #4b4a44;
        border-radius: 2% 2% 31% 31%/4% 12% 5% 5%;
        text-align: center;
        font-weight: bold;
        padding-top: 2px;
        margin: 0 2px;
        flex-shrink: 0;
    }
</style>
