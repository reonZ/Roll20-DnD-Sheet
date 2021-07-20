<script lang="ts" context="module">
    const levels = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

    const allLevels = ['cantrip', ...levels]

    const spellSuffixes = [
        'spellprepared',
        'spellname',
        'spellcomp_v',
        'spellcomp_s',
        'spellcomp_m',
        'spellritual',
        'spellschool',
        'spelllevel',
        'innate',
        'spellcomp_materials',
        'spellduration',
        'spellconcentration',
        'spelldescription',
        'spellathigherlevels',
        'spellcastingtime',
        'spellrange',
        'spelltarget',
    ]

    const attribNames = levels.reduce((acc, curr) => {
        acc.push(`lvl${curr}_slots_total`)
        acc.push(`lvl${curr}_slots_expended`)
        return acc
    }, [] as string[])
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { clamp } from './tools/math'
    import { isAttribTrue, sendCharacterAttribRoll } from './roll20'
    import { sendSpellDescription } from './dnd'
    import SpellDescription from './SpellDescription.svelte'
    import AttribListener from './AttribListener.svelte'
    import RepeatingAttribListener, { changeSuffix } from './RepeatingAttribListener.svelte'

    let attribs: AttribRecord = {}
    let setAttrib: SetAttribFunction
    let selectedSpell: AttribRecord | undefined

    function changeSlots(level: string, value: 1 | -1) {
        const max = Number(attribs[`lvl${level}_slots_total`].current)
        const current = Number(attribs[`lvl${level}_slots_expended`]?.current ?? max)
        const newValue = clamp(0, max, current + value)
        if (current !== newValue) setAttrib(`lvl${level}_slots_expended`, newValue)
    }

    $: $cid, (selectedSpell = undefined)
</script>

<AttribListener names={$isNpc ? [] : attribNames} bind:attribs bind:setAttrib />

<div class="page">
    <div class="left">
        <div class="scroller">
            {#each allLevels as level, i}
                <RepeatingAttribListener prefix={'spell-' + level} suffixes={spellSuffixes} let:attribs={spells}>
                    {#if spells.length}
                        <div class="section">
                            <div class="header">
                                <div class="level">{i}</div>
                                <div class="infos">
                                    {#if !i}
                                        Cantrips
                                    {:else if !$isNpc && (Number(attribs[`lvl${level}_slots_total`]?.current) || 0 > 0)}
                                        <span class="slots" on:contextmenu={() => changeSlots(level, 1)} on:click={() => changeSlots(level, -1)}>
                                            <span class="char">
                                                {attribs[`lvl${level}_slots_expended`]?.current ?? attribs[`lvl${level}_slots_total`].current}
                                            </span>
                                            /
                                            <span class="char">{attribs[`lvl${level}_slots_total`].current}</span>
                                        </span>
                                    {/if}
                                </div>
                            </div>
                            {#each spells as spell (spell.id)}
                                {#if spell.spellname?.current}
                                    <div class="spell" on:mouseenter={() => (selectedSpell = spell)}>
                                        <div class="prepared">
                                            {#if level !== 'cantrip'}
                                                <div
                                                    class:npc={$isNpc}
                                                    class:selected={$isNpc || isAttribTrue(spell.spellprepared?.current)}
                                                    on:click={() =>
                                                        !$isNpc &&
                                                        spells.setAttrib(
                                                            changeSuffix(spell.spellname.name, 'spellprepared'),
                                                            spell.spellprepared?.current !== '1' ? '1' : '0'
                                                        )}
                                                />
                                            {/if}
                                        </div>
                                        <div
                                            class="name"
                                            on:click={() => sendCharacterAttribRoll($cid, changeSuffix(spell.spellname.name, 'rollcontent'))}
                                            on:contextmenu={() => sendSpellDescription($cid, level, spell)}
                                        >
                                            {spell.spellname.current}
                                        </div>
                                        <div class="details">
                                            <div class="top">
                                                {#if isAttribTrue(spell.spellconcentration?.current)}
                                                    <div>C</div>
                                                {/if}
                                                {#if isAttribTrue(spell.spellritual?.current)}
                                                    <div>R</div>
                                                {/if}
                                            </div>
                                            <div class="bottom">
                                                {#if isAttribTrue(spell.spellcomp_v?.current ?? '{{v=1}}')}
                                                    <div>V</div>
                                                {/if}
                                                {#if isAttribTrue(spell.spellcomp_s?.current ?? '{{s=1}}')}
                                                    <div>S</div>
                                                {/if}
                                                {#if isAttribTrue(spell.spellcomp_m?.current ?? '{{m=1}}')}
                                                    <div>M</div>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </RepeatingAttribListener>
            {/each}
        </div>
    </div>
    <SpellDescription spell={selectedSpell} />
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .page {
        flex-grow: 1;
        display: flex;
        overflow: hidden;
    }

    .left {
        overflow: hidden;
        width: 40%;
        padding-left: 2px;
        flex-shrink: 0;
    }

    .scroller {
        @include utils.scrollbar();

        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 4px 12px 4px 6px;
        margin-bottom: 2px;
    }

    .section {
        &:not(:first-child) {
            margin-top: 8px;
        }
    }

    .header {
        display: none;
        font-weight: bold;
        align-items: center;
        border: 2px solid colors.$color;
        border-radius: 2% 2% 4% 8% / 4% 12% 10% 8%;
        line-height: normal;
        position: relative;

        &:not(:only-child) {
            display: flex;
        }
    }

    .level {
        width: 40px;
        text-align: center;
        border-right: 2px solid colors.$color;
        border-radius: 6% 4% 2% 8% / 4% 34% 2% 8%;
    }

    .infos {
        flex-grow: 1;
        text-align: center;
        position: absolute;
        width: 100%;
    }

    .slots {
        cursor: pointer;
    }

    .spell {
        @include utils.hoverHighlight();

        padding: 2px 4px;
        display: flex;
        grid-gap: 4px;
        height: 24px;
    }

    .prepared {
        display: flex;
        justify-content: center;
        width: 20px;
        flex-shrink: 0;

        > div {
            @include utils.radio();

            &:not(.npc) {
                cursor: pointer;
            }
        }
    }

    .name {
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
    }

    .details {
        width: 30px;
        font-size: 0.5em;
        font-weight: bold;
        height: 100%;
        position: relative;

        > div {
            display: flex;
            justify-content: center;
            position: absolute;
            width: 100%;
            left: 0;
            line-height: 11px;
            height: 11px;
        }

        .top {
            top: 0;

            > div {
                background-color: colors.$bgcolor-verydark;
                border-radius: 50%;
                color: colors.$color-inverted;
                width: 11px;
                height: 11px;
                text-align: center;
                padding-top: 1px;
            }
        }

        .bottom {
            top: 12px;
        }
    }

    .char {
        @include utils.char;
    }
</style>
