<script lang="ts" context="module">
    export const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

    const attribNames = abilities.reduce((acc, curr) => {
        acc.push(curr)
        acc.push(curr + '_mod')
        acc.push(curr + '_save_bonus')
        return acc
    }, [] as string[])

    const npcAttribNames = abilities.reduce((acc, curr) => {
        acc.push(curr)
        acc.push(curr + '_mod')
        acc.push('npc_' + curr.substr(0, 3) + '_save')
        return acc
    }, [] as string[])
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { isAttribEmpty, sendCharacterAttribRoll } from './roll20'
    import { modifier, sendAbilityModifierRoll, sendDescription, sendNpcAbilityModifierRoll, sendNpcAbilitySaveRoll } from './dnd'
    import { capitalize } from './tools/string'
    import AttribListener from './AttribListener.svelte'

    let attribs: AttribRecord = {}

    function sendModifier(ability: string) {
        if ($isNpc) sendNpcAbilityModifierRoll($cid, ability)
        else sendAbilityModifierRoll($cid, ability)
    }

    function sendSaveModifier(ability: string) {
        if ($isNpc) sendNpcAbilitySaveRoll($cid, ability, attribs['npc_' + ability.substr(0, 3) + '_save']?.current)
        else sendCharacterAttribRoll($cid, ability + '_save_roll')
    }

    function getSaveModifier(ability: string) {
        let mod: AttribValue
        if ($isNpc) {
            mod = attribs['npc_' + ability.substr(0, 3) + '_save']?.current
            if (isAttribEmpty(mod)) mod = attribs[ability + '_mod']?.current
        } else {
            mod = attribs[ability + '_save_bonus']?.current
        }
        return modifier(mod || '0')
    }
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs />

<div class="abilities">
    {#each abilities as ability (ability)}
        <div class="ability">
            <div
                class="name"
                on:contextmenu={() =>
                    sendDescription(
                        $cid,
                        capitalize(ability),
                        `Value: ${attribs[ability]?.current || 10}\nModifier: ${modifier(
                            attribs[ability + '_mod']?.current || 0
                        )}\nSave: ${getSaveModifier(ability)}`
                    )}
            >
                {ability}
            </div>
            <div>{attribs[ability]?.current || 10}</div>
            <div class="modifiers">
                <div class="modifier" on:click={() => sendModifier(ability)}>{modifier(attribs[ability + '_mod']?.current || 0)}</div>
                <div />
                <div class="modifier" on:click={() => sendSaveModifier(ability)}>{attribs && getSaveModifier(ability)}</div>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .abilities {
        flex-shrink: 0;
        width: 90px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        border-right: 2px groove white;
        border-radius: 10% 2px 2px 10%/10% 6% 6% 10%;
    }

    .ability {
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: space-around;

        &:not(:last-child) {
            border-bottom: 2px groove white;
            border-radius: 2% 2% 30% 30%/2% 2px 2px 2px;
        }
    }

    .name {
        text-transform: Capitalize;
        font-weight: bold;
        align-items: center;
        cursor: help;
    }

    .modifiers {
        display: flex;
        justify-content: space-evenly;
        line-height: 22px;
    }

    .modifier {
        cursor: pointer;
    }
</style>
