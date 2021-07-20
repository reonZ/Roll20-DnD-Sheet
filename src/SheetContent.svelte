<script lang="ts" context="module">
    const menuLabels = ['Attributes', 'Actions', 'Spellbook', 'Features', 'Equipment', 'Effects']

    const attribNames = []

    const npcAttribNames = ['npcspellcastingflag']

    const avatarRegex = /\/(med|max)./
    const largeAvatarRegex = /\/(mini|med)./
</script>

<script lang="ts">
    import type { SvelteComponent } from 'svelte'
    import { setContext } from 'svelte'
    import { attributes, isNpc, selectedMenu, selectMenu } from './global'
    import { sendChatMsg } from './roll20'
    import AttributesPage from './AttributesPage.svelte'
    import ActionsPage from './ActionsPage.svelte'
    import Spells from './Spells.svelte'
    import Feats from './Feats.svelte'
    import Equipment from './Equipment.svelte'
    import Effects from './Effects.svelte'
    import PageHeaderTop from './PageHeaderTop.svelte'
    import PageHeaderBottom from './PageHeaderBottom.svelte'
    import Dialog from './Dialog.svelte'
    import AttribListener from './AttribListener.svelte'

    const _avatarRegex = avatarRegex
    const _largeAvatarRegex = largeAvatarRegex
    const menus: Array<typeof SvelteComponent> = [AttributesPage, ActionsPage, Spells, Feats, Equipment, Effects]

    let dialog: Dialog
    let attribs: AttribRecord = {}

    setContext('popup', { open: (slot: SvelteComponent, args?: Record<string, any>) => dialog.open(slot, args), close: () => dialog.close() })

    $: avatar = $attributes.avatar?.replace(_avatarRegex, '/mini.')
    $: largeAvatar = $attributes.avatar?.replace(_largeAvatarRegex, '/max.')
    $: disabledMenus = $isNpc ? [...(attribs.npcspellcastingflag?.current === 1 ? [] : [2]), 4, 5] : []
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs />

<div class="sheet">
    <div class="header">
        <div
            class="left"
            class:help={avatar}
            style={avatar ? 'background-image: url(' + avatar + ');' : ''}
            on:contextmenu={() => avatar && sendChatMsg(`[x](${largeAvatar + '#.png'})`)}
        />
        <div class="right">
            <PageHeaderTop />
            <PageHeaderBottom />
        </div>
    </div>
    <div class="navigation">
        {#each menuLabels as menu, i}
            {#if disabledMenus.includes(i)}
                <div class="btn disabled"><div>{menu}</div></div>
            {:else}
                <div class="btn" class:selected={$selectedMenu === i} on:click={() => selectMenu(i)}><div>{menu}</div></div>
            {/if}
        {/each}
    </div>
    <svelte:component this={menus[$selectedMenu]} />
    <Dialog bind:this={dialog} />
</div>

<style lang="scss">
    @use "colors";
    @use "avatar";

    .help {
        cursor: help;
    }

    .sheet {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }

    .header {
        display: flex;
        height: 100px;
        flex-shrink: 0;
        border-bottom: 2px groove white;
        border-radius: 2% 2% 10% 10% / 2% 2px 2px 2px;

        .left {
            flex-shrink: 0;
            width: 98px;
            border-right: 2px groove white;
            border-radius: 10% 2% 2% 10% / 10% 49% 49% 10%;
            background-repeat: no-repeat;
            background-size: 96%;
            background-position: 50%;
            background-image: avatar.$url;
        }

        .right {
            display: flex;
            overflow: hidden;
            flex-direction: column;
            flex-grow: 1;
        }
    }

    .navigation {
        display: flex;
        height: 36px;
        flex-shrink: 0;
        border-bottom: 2px groove white;
        border-radius: 2% 2% 10% 10% / 2% 2px 2px 2px;
        padding: 0 30px;
        gap: 30px;

        .btn {
            flex-grow: 1;
            margin: auto;
            cursor: pointer;
            width: 15%;

            > div {
                border-radius: 2% 2% 30% 30%/2% 2px 2px 2px;
                border-bottom: 4px solid colors.$border-verylight;
                text-align: center;
                line-height: 1em;
                font-weight: bold;
            }

            &:not(.disabled).selected > div {
                border-bottom-color: colors.$border-light;
            }

            &.disabled {
                cursor: default;

                > div {
                    color: colors.$color-verylight;
                }
            }
        }
    }
</style>
