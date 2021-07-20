<script lang="ts" context="module">
    const exhaustions = [
        'Disadvantage on ability checks',
        'Speed halved',
        'Disadvantage on attack rolls and saving throws',
        'Hit point maximum halved',
        'Speed reduced to 0',
        'Death',
    ]

    const immunities = [
        { name: 'npc_immunities', label: 'Damage Immunities' },
        { name: 'npc_resistances', label: 'Damage Resistances' },
        { name: 'npc_vulnerabilities', label: 'Damage Vulnerabilties' },
        { name: 'npc_condition_immunities', label: 'Condition Immunities' },
    ]

    const attribNames = [
        'inspiration',
        'exhaustion_level',
        'deathsave_successes',
        'deathsave_fails',
        'size',
        'npc_senses',
        'class_resource_name',
        'class_resource',
        'other_resource_name',
        'other_resource',
        ...immunities.map(x => x.name),
    ]

    const npcAttribNames = ['npc_type', 'npc_languages', 'npc_senses', ...immunities.map(x => x.name)]

    const proficiencySuffixes = ['name', 'prof_type']

    const toolsSuffixes = ['toolname']

    const resourceSuffixes = ['resource_left_name', 'resource_left', 'resource_right_name', 'resource_right']

    const npcSizeRegex = /^(tiny|small|medium|large|huge|gargantuan) /i
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { sendDescription } from './dnd'
    import { sendCharacterAttribRoll } from './roll20'
    import { clamp } from './tools/math'
    import Abilities from './Abilities.svelte'
    import Skills from './Skills.svelte'
    import Editable from './Editable.svelte'
    import AttribListener from './AttribListener.svelte'
    import RepeatingAttribListener, { changeSuffix } from './RepeatingAttribListener.svelte'

    const _npcSizeRegex = npcSizeRegex

    let attribs: AttribRecord = {}
    let setAttrib: SetAttribFunction

    function toggleInspiration() {
        if (attribs.inspiration?.current === 'on') setAttrib('inspiration', '')
        else setAttrib('inspiration', 'on')
    }

    function deathSaveDesc() {
        sendDescription($cid, 'Death Saves', `Success: ${deathSuccesses || 0}\nFail: ${deathFails}`)
    }

    function changeExhaustion(value: 1 | -1) {
        const newValue = clamp(0, 6, exhaustion + value)
        if (exhaustion !== newValue) setAttrib('exhaustion_level', newValue.toString())
    }

    function changeDeathValue(name: 'deathsave_successes' | 'deathsave_fails', value: 1 | -1) {
        const current = Number(attribs[name]?.current) || 0
        const newValue = clamp(0, 3, current + value)
        if (newValue !== current) setAttrib(name, newValue)
    }

    $: deathSuccesses = attribs.deathsave_successes?.current || 0
    $: deathFails = attribs.deathsave_fails?.current || 0
    $: exhaustion = Number(attribs.exhaustion_level?.current) || 0
    $: npcSize = attribs.npc_type?.current.toString().match(_npcSizeRegex)?.[1] || 'Medium'
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs bind:setAttrib />

<div class="attributes">
    <Abilities />
    <Skills />
    <div class="scroller">
        {#if !$isNpc}
            <div class="section">
                {#each ['class_resource', 'other_resource'] as resourceName (resourceName)}
                    {#if attribs[resourceName]?.current || attribs[resourceName]?.max}
                        <div class="row">
                            <div
                                class="left clickable"
                                on:click={() => {
                                    const curr = Number(attribs[resourceName]?.current) || 0
                                    if (curr > 0) setAttrib(resourceName, curr - 1)
                                }}
                                on:contextmenu={() =>
                                    sendDescription(
                                        $cid,
                                        attribs[resourceName + '_name']?.current ||
                                            (resourceName === 'class_resource' ? 'Class Resource' : 'Other Resource'),
                                        attribs[resourceName]?.max
                                            ? (attribs[resourceName]?.current || 0) + ' / ' + attribs[resourceName]?.max
                                            : attribs[resourceName]?.current || 0
                                    )}
                            >
                                {attribs[resourceName + '_name']?.current ||
                                    (resourceName === 'class_resource' ? 'Class Resource' : 'Other Resource')}
                            </div>
                            <div class="right">
                                <Editable
                                    value={Number(attribs[resourceName]?.current) || 0}
                                    min={0}
                                    max={Number(attribs[resourceName]?.max) || undefined}
                                    maxWidth="4ch"
                                    on:update={({ detail: value }) => setAttrib(resourceName, value)}
                                />
                                {#if attribs[resourceName]?.max}
                                    &nbsp;/&nbsp;
                                    {attribs[resourceName]?.max}
                                    <!-- <Editable
                                        value={Number(attribs[resourceName]?.max)}
                                        min={0}
                                        max={9999}
                                        maxWidth="4ch"
                                        on:update={({ detail }) => {
                                            const value = Number(detail)
                                            setAttrib(resourceName, value, 'max')
                                            if ((Number(attribs[resourceName]?.current) || 0) > value) setAttrib(resourceName, value)
                                        }}
                                    /> -->
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/each}

                <RepeatingAttribListener prefix="resource" suffixes={resourceSuffixes} let:attribs={resources}>
                    {#each resources as resource (resource.id)}
                        {#each ['resource_left', 'resource_right'] as resourceName (resourceName)}
                            {#if resource[resourceName]?.current || resource[resourceName]?.max}
                                <div class="row">
                                    <div
                                        class="left clickable"
                                        on:click={() => {
                                            const curr = Number(resource[resourceName]?.current) || 0
                                            if (curr > 0) resources.setAttrib(resource[resourceName].name, curr - 1)
                                        }}
                                        on:contextmenu={() =>
                                            sendDescription(
                                                $cid,
                                                resource[resourceName + '_name']?.current || 'Unknown Resource',
                                                resource[resourceName]?.max
                                                    ? (resource[resourceName]?.current || 0) + ' / ' + resource[resourceName]?.max
                                                    : resource[resourceName]?.current || 0
                                            )}
                                    >
                                        {resource[resourceName + '_name']?.current || 'Unknown Resource'}
                                    </div>
                                    <div class="right">
                                        <Editable
                                            value={Number(resource[resourceName]?.current) || 0}
                                            min={0}
                                            max={Number(resource[resourceName]?.max) || undefined}
                                            maxWidth="4ch"
                                            on:update={({ detail: value }) =>
                                                resource[resourceName] && resources.setAttrib(resource[resourceName].name, value)}
                                        />
                                        {#if resource[resourceName]?.max}
                                            &nbsp;/&nbsp;
                                            {resource[resourceName]?.max}
                                            <!-- <Editable
                                                value={Number(resource[resourceName]?.max)}
                                                min={0}
                                                max={9999}
                                                maxWidth="4ch"
                                                on:update={({ detail }) => {
                                                    if (!resource[resourceName]) return
                                                    const value = Number(detail)
                                                    resources.setAttrib(resource[resourceName].name, value, 'max')
                                                    if ((Number(resource[resourceName]?.current) || 0) > value)
                                                        resources.setAttrib(resource[resourceName].name, value)
                                                }}
                                            /> -->
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {/each}
                </RepeatingAttribListener>

                <div class="separator" />
            </div>

            <div class="section">
                <div class="row">
                    <div
                        class="left clickable"
                        on:contextmenu={() => sendDescription($cid, 'inspiration', attribs.inspiration?.current === 'on' ? 'Available' : 'Used')}
                        on:click={toggleInspiration}
                    >
                        Inspiration
                    </div>
                    <div class="right clickable checkbox" on:click={toggleInspiration}>
                        [&nbsp;&nbsp;]
                        <div>
                            {#if attribs.inspiration?.current === 'on'}
                                &#10003;
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div
                        class="left clickable"
                        on:contextmenu={deathSaveDesc}
                        on:click={() => {
                            deathSaveDesc()
                            sendCharacterAttribRoll($cid, 'death_save_roll')
                        }}
                    >
                        Death Saves
                    </div>
                    <div class="right">
                        <span
                            class="clickable"
                            on:contextmenu={() => changeDeathValue('deathsave_successes', -1)}
                            on:click={() => changeDeathValue('deathsave_successes', 1)}
                        >
                            &#10004; <span class="char">{deathSuccesses}</span>
                        </span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span
                            class="clickable"
                            on:contextmenu={() => changeDeathValue('deathsave_fails', -1)}
                            on:click={() => changeDeathValue('deathsave_fails', 1)}
                        >
                            &#10008; <span class="char">{deathFails}</span>
                        </span>
                    </div>
                </div>

                <div class="row">
                    <div
                        class="left"
                        on:contextmenu={() =>
                            sendDescription(
                                $cid,
                                `Exhaustion (${exhaustion})`,
                                !exhaustion ? 'Nothing' : exhaustions.slice(0, exhaustion).join('\n')
                            )}
                    >
                        Exhaustion (<span class="char">{exhaustion}</span>)
                    </div>
                    <div class="right clickable" on:contextmenu={() => changeExhaustion(-1)} on:click={() => changeExhaustion(1)}>
                        {#if !exhaustion}
                            Nothing
                        {:else}
                            {#each { length: exhaustion } as _, i}
                                {exhaustions[i]}<br />
                            {/each}
                        {/if}
                    </div>
                </div>

                <div class="separator" />
            </div>
        {/if}

        {#if $isNpc}
            <div class="row">
                <div class="left" on:contextmenu={() => sendDescription($cid, 'Size', npcSize)}>Size</div>
                <div class="right">{npcSize}</div>
            </div>

            <div class="row">
                <div class="left" on:contextmenu={() => sendDescription($cid, 'Languages', attribs.npc_languages?.current || '')}>Languages</div>
                <div class="right">{attribs.npc_languages?.current || ''}</div>
            </div>

            <div class="row">
                <div class="left" on:contextmenu={() => sendDescription($cid, 'Senses', attribs.npc_senses?.current || '')}>Senses</div>
                <div class="right">{attribs.npc_senses?.current || ''}</div>
            </div>

            <div class="section">
                <div class="separator" />

                {#each immunities as immunity (immunity.name)}
                    {#if attribs[immunity.name]?.current}
                        <div class="row">
                            <div class="left" on:contextmenu={() => sendDescription($cid, immunity.label, attribs[immunity.name]?.current || '')}>
                                {immunity.label}
                            </div>
                            <div class="right">{attribs[immunity.name]?.current || ''}</div>
                        </div>
                    {/if}
                {/each}
            </div>
        {:else}
            <div class="row">
                <div class="left" on:contextmenu={() => sendDescription($cid, 'Size', attribs.size?.current || 'Medium')}>Size</div>
                <div class="right">{attribs.size?.current || 'Medium'}</div>
            </div>

            <RepeatingAttribListener prefix="proficiencies" suffixes={proficiencySuffixes} let:attribs={proficiencies}>
                <div class="row">
                    <div
                        class="left"
                        on:contextmenu={() =>
                            sendDescription(
                                $cid,
                                'Languages',
                                proficiencies
                                    .filterBySuffix('prof_type', ['language', undefined])
                                    .map(x => x.name?.current)
                                    .sort()
                                    .join(', ')
                            )}
                    >
                        Languages
                    </div>
                    <div class="right">
                        {proficiencies
                            .filterBySuffix('prof_type', ['language', undefined])
                            .map(x => x.name?.current)
                            .sort()
                            .join(', ')}
                    </div>
                </div>

                <div class="row">
                    <div class="left" on:contextmenu={() => sendDescription($cid, 'Senses', attribs.npc_senses?.current || '')}>Senses</div>
                    <div class="right">
                        <Editable
                            value={attribs.npc_senses?.current || ''}
                            minWidth="320px"
                            maxWidth="320px"
                            textAlign="right"
                            multi={true}
                            on:update={({ detail: value }) => setAttrib('npc_senses', value)}
                        />
                    </div>
                </div>

                <div class="separator" />

                {#each immunities as immunity (immunity.name)}
                    <div class="row">
                        <div class="left" on:contextmenu={() => sendDescription($cid, immunity.label, attribs[immunity.name]?.current || '')}>
                            {immunity.label}
                        </div>
                        <div class="right">
                            <Editable
                                value={attribs[immunity.name]?.current || ''}
                                minWidth="320px"
                                maxWidth="320px"
                                textAlign="right"
                                multi={true}
                                on:update={({ detail: value }) => setAttrib(immunity.name, value)}
                            />
                        </div>
                    </div>
                {/each}

                <div class="separator" />

                <div class="row">
                    <div
                        class="left"
                        on:contextmenu={() =>
                            sendDescription(
                                $cid,
                                'Weapon Proficiencies',
                                proficiencies
                                    .filterBySuffix('prof_type', 'weapon')
                                    .map(x => x.name?.current)
                                    .join(', ')
                            )}
                    >
                        Weapon Proficiencies
                    </div>
                    <div class="right">
                        {proficiencies
                            .filterBySuffix('prof_type', 'weapon')
                            .map(x => x.name?.current)
                            .join(', ')}
                    </div>
                </div>

                <div class="row">
                    <div
                        class="left"
                        on:contextmenu={() =>
                            sendDescription(
                                $cid,
                                'Armor Proficiencies',
                                proficiencies
                                    .filterBySuffix('prof_type', 'armor')
                                    .map(x => x.name?.current)
                                    .join(', ')
                            )}
                    >
                        Armor Proficiencies
                    </div>
                    <div class="right">
                        {proficiencies
                            .filterBySuffix('prof_type', 'armor')
                            .map(x => x.name?.current)
                            .join(', ')}
                    </div>
                </div>
            </RepeatingAttribListener>

            <RepeatingAttribListener prefix="tool" suffixes={toolsSuffixes} let:attribs={tools}>
                <div class="row">
                    <div
                        class="left"
                        on:contextmenu={() =>
                            sendDescription(
                                $cid,
                                'Tool Proficiencies',
                                tools
                                    .sortAttribs('toolname')
                                    .map(x => x.toolname?.current)
                                    .join(', ')
                            )}
                    >
                        Tool Proficiencies
                    </div>
                    <div class="right">
                        {#each tools.sortAttribs('toolname') as tool (tool.id)}
                            <span
                                class="tool clickable"
                                on:click={() => tool.toolname && sendCharacterAttribRoll($cid, changeSuffix(tool.toolname.name, 'toolroll'))}
                                >{tool.toolname?.current || ''}</span
                            >
                        {/each}
                    </div>
                </div>
            </RepeatingAttribListener>
        {/if}
    </div>
</div>

<style lang="scss">
    @use "colors";
    @use "utils";

    .attributes {
        overflow: hidden;
        flex-grow: 1;
        display: flex;
    }

    .scroller {
        @include utils.scrollbar();

        flex-grow: 1;
        padding: 0px 6px;
        margin-bottom: 2px;
        display: flex;
        flex-direction: column;
    }

    .section {
        display: flex;
        flex-direction: column;
    }

    .row {
        @include utils.hoverHighlight;

        display: flex;
        justify-content: space-between;
        gap: 10px;

        > div {
            display: flex;
            align-items: center;
        }
    }

    .separator {
        border-bottom: 2px groove white;
        border-radius: 2% 2% 10% 10% / 2% 2px 2px 2px;
        margin: 4px 0;
        display: none;

        &:not(:only-child) {
            display: block;
        }
    }

    .left {
        font-weight: bold;
        padding-left: 2px;
        height: 24px;
        flex-shrink: 0;
        cursor: help;
    }

    .right {
        text-align: end;
        padding-right: 4px;
    }

    .checkbox {
        position: relative;
        margin-top: 2px;

        > div {
            position: absolute;
            left: 4px;
            top: -1px;
        }
    }

    .clickable {
        cursor: pointer;
    }

    .char {
        @include utils.char();
    }

    .tool:not(:last-child) {
        padding-right: 0.25em;

        &::after {
            content: ',';
        }
    }
</style>
