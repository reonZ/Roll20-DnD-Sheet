<script lang="ts" context="module">
    interface Character {
        id: string
        isNpc: boolean
        name: string
        level?: string
        version?: number
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { addCharacter } from './global'
    import { getAttribByName, getAttribute, getOwnedCharacters } from './roll20'
    import { getCharacterLevel, isCharacterNpc } from './dnd'
    import SearchBox from './SearchBox.svelte'

    let filter = ''
    let characters: Character[] = []

    function getCharacterList() {
        characters = getOwnedCharacters().map(cid => {
            const isNpc = isCharacterNpc(cid)
            const character: Character = {
                id: cid,
                isNpc,
                name: (getAttribute(cid, 'name') as UString) ?? '',
                level: getCharacterLevel(cid, isNpc),
                version: (getAttribByName(cid, 'version')?.attributes.current as number) ?? undefined,
            }
            return character
        })
        setTimeout(getCharacterList, 1000)
    }

    $: filteredCharacters = characters.filter(x => x.name.toLowerCase().includes(filter.toLowerCase()))

    onMount(getCharacterList)
</script>

<div class="selection">
    <div class="header">
        <SearchBox bind:filter />
    </div>

    <div class="scroller">
        {#each filteredCharacters as character (character.id)}
            {#if character.version === undefined}
                <div class="row disabled">
                    <div class="npc">??</div>
                    <div class="name">{character.name || 'Unknown Creature'}</div>
                    <div class="level">??</div>
                </div>
            {:else}
                <div class="row clickable" on:click={() => addCharacter(character.id)}>
                    <div class="npc">
                        <div class="radio" class:selected={character.isNpc} />
                    </div>
                    <div class="name">{character.name || 'Unknown Creature'}</div>
                    <div class="level">{!character.level ? (character.isNpc ? '-' : '1') : character.level}</div>
                </div>
            {/if}
        {/each}
    </div>
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .selection {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 2px;
    }

    .header {
        padding: 10px 0 20px;
        width: 30%;
        margin: auto;
    }

    .scroller {
        @include utils.scrollbar();

        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-width: 40%;
        max-width: 80%;
        margin: auto;
        padding: 0 4px;
    }

    .row {
        @include utils.hoverHighlight();

        flex-shrink: 0;
        display: flex;
        padding: 2px 4px;
        gap: 8px;

        &.disabled {
            color: grey;
            background-color: transparent;
        }
    }

    .clickable {
        cursor: pointer;
    }

    .npc {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        width: 14px;
    }

    .radio {
        @include utils.radio(colors.$bgcolor-red);
    }

    .name {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .level {
        flex-shrink: 0;
        width: 30px;
        text-align: center;
    }
</style>
