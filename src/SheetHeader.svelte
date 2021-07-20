<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { attributes, cid, deleteCharacter, isNpc, nbCharacters, newCharacter, nextCharacter, previousCharacter } from './global'

    const dispatch = createEventDispatcher<{ startDrag: MouseEvent; toggleCollapsed: void; characterSelection: void }>()

    $: isNotRemovable = $nbCharacters === 0 || ($nbCharacters === 1 && $cid === '')
    $: isNavigable = $nbCharacters > 1 || ($nbCharacters === 1 && $cid === '')
</script>

<div class="header" on:dblclick={() => dispatch('toggleCollapsed')} on:mousedown={e => dispatch('startDrag', e)}>
    {#if $cid === ''}
        <div class="fake-btn" />
    {:else}
        <div class="btn add" on:click={newCharacter} on:mousedown|stopPropagation on:dblclick|stopPropagation>+</div>
    {/if}
    <div class="spacer" />
    {#if isNavigable}
        <div class="nav previous" on:click={previousCharacter} on:mousedown|stopPropagation on:dblclick|stopPropagation />
    {/if}
    <div class="title" on:contextmenu={() => dispatch('characterSelection')}>
        <div>
            {$attributes.name || ($isNpc ? 'Unknown Creature' : 'Nameless One')}
        </div>
    </div>
    {#if isNavigable}
        <div class="nav next" on:click={nextCharacter} on:mousedown|stopPropagation on:dblclick|stopPropagation />
    {/if}
    <div class="spacer" />
    {#if isNotRemovable}
        <div class="fake-btn" />
    {:else}
        <div class="btn remove" on:click={deleteCharacter} on:mousedown|stopPropagation on:dblclick|stopPropagation>x</div>
    {/if}
</div>

<style lang="scss">
    @use "colors";
    @use "icons";

    $height: 32px;

    .header {
        height: $height;
        flex-shrink: 0;
        position: relative;
        border-bottom: 2px solid colors.$border;
        border-radius: 2% 2% 15% 12% / 4% 12% 5% 5%;
        display: flex;
        align-items: center;

        > div {
            text-align: center;
        }
    }

    .fake-btn {
        width: $height;
    }

    .btn {
        width: $height;
        font-size: 2em;
        cursor: pointer;
    }

    .remove {
        right: 0;
    }

    .title {
        max-width: 60%;
        width: 60%;
        font-size: 1.2em;
        font-weight: bold;
        padding-top: 1px;

        > div {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .nav {
        width: $height;
        height: $height;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        filter: colors.$color-filter;
        background-size: 60%;
        cursor: pointer;

        &.previous {
            background-image: icons.$previous;
        }

        &.next {
            background-image: icons.$next;
        }
    }

    .spacer {
        flex-grow: 1;
    }
</style>
