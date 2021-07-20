<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { characters, cid, selectCharacter } from './global'
    import { getAttribute } from './roll20'

    const dispatch = createEventDispatcher()

    function select(id: string) {
        selectCharacter(id)
        dispatch('close')
    }
</script>

<div class="background" on:click|self={() => dispatch('close')}>
    <div class="popup">
        {#each $characters.filter(x => x !== $cid) as id (id)}
            <div class="row" on:click={() => select(id)}>{getAttribute(id, 'name') ?? ''}</div>
        {/each}
    </div>
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .background {
        position: absolute;
        z-index: 99;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .popup {
        @include utils.scrollbar();

        min-width: 20%;
        max-width: 60%;
        background-color: colors.$bgcolor;
        border: 2px solid colors.$border;
        border-radius: 2px 2px 6px 9px/12px 9px 11px 4px;
        border-top: 0;
        box-shadow: 3px 3px 5px;
        padding: 6px;
    }

    .row {
        @include utils.hoverHighlight();

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        cursor: pointer;
    }
</style>
