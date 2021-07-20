<script lang="ts" context="module">
    const skills = [
        { name: 'acrobatics', ability: 'dexterity' },
        { name: 'animal_handling', ability: 'wisdom' },
        { name: 'arcana', ability: 'intelligence' },
        { name: 'athletics', ability: 'strength' },
        { name: 'deception', ability: 'charisma' },
        { name: 'history', ability: 'intelligence' },
        { name: 'insight', ability: 'wisdom' },
        { name: 'intimidation', ability: 'charisma' },
        { name: 'investigation', ability: 'intelligence' },
        { name: 'medicine', ability: 'wisdom' },
        { name: 'nature', ability: 'intelligence' },
        { name: 'perception', ability: 'wisdom' },
        { name: 'performance', ability: 'charisma' },
        { name: 'persuasion', ability: 'charisma' },
        { name: 'religion', ability: 'intelligence' },
        { name: 'sleight_of_hand', ability: 'dexterity' },
        { name: 'stealth', ability: 'dexterity' },
        { name: 'survival', ability: 'wisdom' },
    ]

    const attribNames = skills.reduce((acc, curr) => {
        acc.push(curr.name + '_prof')
        acc.push(curr.name + '_bonus')
        return acc
    }, [] as string[])

    const npcAttribNames = skills.reduce((acc, curr) => {
        acc.push(curr.ability + '_mod')
        acc.push('npc_' + curr.name)
        return acc
    }, [] as string[])

    function uppercase(str: string) {
        if (str === 'of') return str
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    function snakecase(str: string) {
        return str.split('_').map(uppercase).join(' ')
    }
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { isAttribEmpty, isAttribTrue, sendCharacterAttribRoll } from './roll20'
    import { modifier, sendDescription, sendNpcSkillSaveRoll } from './dnd'
    import AttribListener from './AttribListener.svelte'

    let attribs: AttribRecord = {}

    function isProficient(skill: string) {
        if ($isNpc) return !isAttribEmpty(attribs['npc_' + skill]?.current)
        else return isAttribTrue(attribs[skill + '_prof']?.current)
    }

    function getModifier(skill: typeof skills[0]) {
        let mod: AttribValue
        if ($isNpc) {
            mod = attribs['npc_' + skill.name]?.current
            if (isAttribEmpty(mod)) mod = attribs[skill.ability + '_mod']?.current
        } else {
            mod = attribs[skill.name + '_bonus']?.current
        }
        return modifier(mod || '0')
    }

    function sendModifier(skill: typeof skills[0]) {
        if ($isNpc) sendNpcSkillSaveRoll($cid, skill, attribs['npc_' + skill.name]?.current)
        else sendCharacterAttribRoll($cid, skill.name + '_roll')
    }
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs />

<div class="skills">
    {#each skills as skill (skill.name)}
        <div class="skill">
            <div class="proficiency" class:selected={attribs && isProficient(skill.name)} />
            <div
                class="name"
                on:contextmenu={() =>
                    sendDescription(
                        $cid,
                        snakecase(skill.name),
                        `Value: ${getModifier(skill)}\n${$isNpc ? 'Modified' : 'Proficient'}: ${isProficient(skill.name) ? 'Yes' : 'No'}`,
                        skill.ability
                    )}
            >
                {snakecase(skill.name)}
            </div>
            <div class="ability">{skill.ability.substr(0, 3)}</div>
            <div class="modifier" on:click={() => sendModifier(skill)}>{attribs && getModifier(skill)}</div>
        </div>
    {/each}
</div>

<style lang="scss">
    @use "colors";
    @use "utils";

    .skills {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        width: 200px;
        border-right: 2px groove white;
        border-radius: 10% 2px 2px 10%/10% 6% 6% 10%;
        padding: 0 4px;
        justify-content: space-around;
    }

    .skill {
        @include utils.hoverHighlight();

        display: flex;
        gap: 6px;
        height: 22px;
    }

    .proficiency {
        @include utils.radio();

        cursor: pointer;
    }

    .name {
        flex-grow: 1;
        white-space: nowrap;
        cursor: help;
    }

    .ability {
        text-transform: uppercase;
        text-align: center;
        font-size: 13px;
        font-weight: bold;
        flex-shrink: 0;
        width: 32px;
        color: colors.$color-light;
        padding-top: 1px;
    }

    .modifier {
        flex-shrink: 0;
        width: 2.5ch;
        cursor: pointer;
    }
</style>
