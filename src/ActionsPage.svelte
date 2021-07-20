<script lang="ts" context="module">
    import { abilities } from './Abilities.svelte'

    const attribNames = [...abilities.map(x => x + '_mod'), 'pb', 'spell_save_dc', 'spell_dc_mod']

    const npcAttribNames = ['npc_mythic_actions', 'npc_mythic_actions_desc', 'npcreactionsflag', 'npc_legendary_actions']

    const attackSuffixes = [
        'atkname',
        'atkrange',
        'atk_desc',
        'atkdmgtype',
        'atkbonus',
        'atkflag',
        'saveflag',
        'savedc',
        'saveflat',
        'saveeffect',
        'saveattr',
        'spellid',
    ]

    const ncpActionSuffixes = ['name', 'attack_flag', 'attack_tohitrange', 'attack_onhit', 'description']

    const npcReactionSuffixes = ['name', 'description']

    const savedcRegex = /^\(@{(\w+)}/
    const npcDmgRegex = /\d+ \((?<damage>[\dd +-]+?)\) (?:(?<type>\w+) )?damage/g
    const feetRegex = /(feet|foot)/gi
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { isAttribEmpty, isAttribTrue, isAttribTrueOfDefault, sendCharacterAttribRoll } from './roll20'
    import { sendDescription } from './dnd'
    import AttribListener from './AttribListener.svelte'
    import RepeatingAttribListener, { changeSuffix } from './RepeatingAttribListener.svelte'

    let attribs: AttribRecord = {}

    function getRange(str: string | undefined | number) {
        if (typeof str !== 'string' || !str) str = '5 ft.'
        else str = str.replace(feetRegex, 'ft.')
        if (str === '5 ft.' || str === '10 ft.') return 'Reach: ' + str
        else return 'Range: ' + str
    }

    function getDC(attrib: AttribRecord) {
        const savedc = (attrib.savedc?.current || '(@{spell_save_dc})') as string
        if (savedc === '(@{spell_save_dc})') {
            return attribs.spell_save_dc?.current || 0
        } else if (savedc === '(@{saveflat})') {
            return attrib.saveflat?.current || 10
        } else {
            const mod = savedc.match(savedcRegex)?.[1] || 'strength_mod'
            return 8 + (Number(attribs[mod]?.current) || 0) + (Number(attribs.pb?.current) || 2) + (Number(attribs.spell_dc_mod?.current) || 0)
        }
    }

    function getNpcActionRange(str: string | undefined | number) {
        if (typeof str !== 'string' || !str) return '+0'
        return str.split(',').slice(1).join(',')
    }

    function getNpcDamage(str: string | undefined | number) {
        if (typeof str !== 'string' || !str) return '-'
        let results: string[] = []
        for (const match of str.matchAll(npcDmgRegex)) {
            let value = match.groups!.damage.replaceAll(' ', '')
            if (match.groups!.type) value += ' ' + match.groups!.type
            results.push(value + ' damage')
        }
        return results.join(' + ')
    }
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs />

<div class="page">
    <div class="scroller">
        {#if $isNpc}
            <RepeatingAttribListener prefix="npcaction" suffixes={ncpActionSuffixes} let:attribs={actions}>
                {#each actions as action (action.id)}
                    {#if action.name?.current}
                        <div class="action" on:click={() => sendCharacterAttribRoll($cid, changeSuffix(action.name.name, 'rollbase'))}>
                            <div class="row">
                                <div class="name">{action.name.current}</div>
                                {#if action.attack_flag?.current === 'on'}
                                    <div>{getNpcActionRange(action.attack_tohitrange?.current)}</div>
                                {/if}
                            </div>
                            {#if action.attack_flag?.current === 'on'}
                                <div class="row">
                                    <div>Hit: {action.attack_tohitrange?.current.toString().split(',')[0] || '+0'}</div>
                                    <div>Damage: {getNpcDamage(action.attack_onhit?.current)}</div>
                                </div>
                            {/if}
                            {#if action.description?.current}
                                <div class="row desc">{action.description?.current}</div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </RepeatingAttribListener>

            {#if attribs.npcreactionsflag?.current === '1'}
                <div class="header">Reactions</div>
                <RepeatingAttribListener prefix="npcreaction" suffixes={npcReactionSuffixes} let:attribs={actions}>
                    {#each actions as action (action.id)}
                        {#if action.name?.current && action.description?.current}
                            <div class="action" on:click={() => sendDescription($cid, action.name.current, action.description.current)}>
                                <div class="name">{action.name.current}</div>
                                <div class="description">{action.description.current}</div>
                            </div>
                        {/if}
                    {/each}
                </RepeatingAttribListener>
            {/if}

            {#if Number(attribs.npc_legendary_actions?.current) || 0 > 0}
                <div class="header">
                    Lengendary Actions ({attribs.npc_legendary_actions.current})
                </div>
                <RepeatingAttribListener prefix="npcaction-l" suffixes={ncpActionSuffixes} let:attribs={actions}>
                    {#each actions as action (action.id)}
                        {#if action.name?.current}
                            <div class="action" on:click={() => sendCharacterAttribRoll($cid, changeSuffix(action.name.name, 'rollbase'))}>
                                <div class="row">
                                    <div class="name">{action.name.current}</div>
                                    {#if action.attack_flag?.current === 'on'}
                                        <div>{getNpcActionRange(action.attack_tohitrange?.current)}</div>
                                    {/if}
                                </div>
                                {#if action.attack_flag?.current === 'on'}
                                    <div class="row">
                                        <div>Hit: {action.attack_tohitrange?.current.toString().split(',')[0] || '+0'}</div>
                                        <div>Damage: {getNpcDamage(action.attack_onhit?.current)}</div>
                                    </div>
                                {/if}
                                {#if action.description?.current}
                                    <div class="row desc">{action.description?.current}</div>
                                {/if}
                            </div>
                        {/if}
                    {/each}
                </RepeatingAttribListener>
            {/if}

            {#if attribs.npc_mythic_actions?.current === '1' && attribs.npc_mythic_actions_desc?.current}
                <div class="header">Mythic Actions</div>
                <div class="action" on:click={() => sendDescription($cid, 'Mythic Actions', attribs.npc_mythic_actions_desc.current)}>
                    <div class="description">{attribs.npc_mythic_actions_desc.current}</div>
                </div>
            {/if}
        {:else}
            <RepeatingAttribListener prefix="attack" suffixes={attackSuffixes} let:attribs={attacks}>
                {#each attacks.sortAttribs('atkname') as attack (attack.id)}
                    {#if isAttribEmpty(attack.spellid?.current) && attack.atkname?.current}
                        <div class="action" on:click={() => sendCharacterAttribRoll($cid, changeSuffix(attack.atkname.name, 'rollbase'))}>
                            <div class="row">
                                <div class="name">{attack.atkname.current}.</div>
                                <div>{getRange(attack.atkrange?.current)}</div>
                            </div>
                            <div class="row">
                                {#if isAttribTrueOfDefault(attack.atkflag?.current)}
                                    <div>Hit: {attack.atkbonus?.current || '+0'}</div>
                                {/if}
                                {#if isAttribTrue(attack.saveflag?.current)}
                                    <div>
                                        Save: {attack.saveattr?.current || 'Strength'} DC{attribs && getDC(attack)}
                                        {#if attack.saveeffect?.current}
                                            ({attack.saveeffect?.current})
                                        {/if}
                                    </div>
                                {/if}
                                {#if attack.atkdmgtype?.current}
                                    <div>Damage: {attack.atkdmgtype?.current}</div>
                                {/if}
                            </div>
                            {#if attack.atk_desc?.current}
                                <div class="row desc">{attack.atk_desc?.current}</div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </RepeatingAttribListener>
        {/if}
    </div>
</div>

<style lang="scss">
    @use "colors";
    @use "utils";

    .page {
        overflow: hidden;
        flex-grow: 1;
        display: flex;
    }

    .scroller {
        @include utils.scrollbar();

        flex-grow: 1;
        padding: 4px 12px 4px 6px;
        margin-bottom: 2px;
        display: flex;
        flex-direction: column;
    }

    .action {
        @include utils.hoverHighlight();

        cursor: pointer;
        display: flex;
        flex-direction: column;
        padding: 2px 4px;
        line-height: 18px;
    }

    .header {
        font-weight: bold;
        display: flex;
        align-items: center;
        border: 2px solid colors.$color;
        border-radius: 2% 2% 4% 8% / 4% 12% 10% 8%;
        padding: 0 8px;
        margin-top: 8px;
    }

    .row {
        display: flex;
        gap: 0.25em;

        > div:not(.name):not(:last-child)::after {
            content: ',';
        }
    }

    .name {
        font-weight: bold;
    }

    .desc {
        font-style: italic;
        font-size: 0.9em;
        padding: 0 2px;
    }
</style>
