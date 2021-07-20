<script lang="ts" context="module">
    const attribNames = ['hp', 'hp_temp', 'hit_dice', 'ac', 'speed', 'initiative_bonus']
    const npcAttribNames = ['hp', 'npc_hpformula', 'npc_ac', 'npc_actype', 'npc_speed', 'initiative_bonus']
</script>

<script lang="ts">
    import { getContext } from 'svelte'
    import { cid, isNpc } from './global'
    import { getAttribs, getCurrentAttribByName, setAttrib as setRoll20Attrib } from './roll20'
    import { modifier, npcSpeedRegex, rollHitDie, rollInit, sendDescription, tracksHitDicePerClass } from './dnd'
    import Banner from './Banner.svelte'
    import HitDiceDialog from './HitDiceDialog.svelte'
    import AttribListener from './AttribListener.svelte'
    import ConfirmationDialog from './ConfirmationDialog.svelte'
    import Editable from './Editable.svelte'
    import { sortCollator } from './RepeatingAttribListener.svelte'

    const popup = getContext<Popup>('popup')

    let attribs: AttribRecord = {}
    let setAttrib: SetAttribFunction

    function getCurrentHp() {
        return Math.min(Number(attribs.hp?.current) || 0, Number(attribs.hp?.max) || 1)
    }

    function getCurrentHitDice() {
        return Math.min(Number(attribs.hit_dice?.current) || 0, Number(attribs.hit_dice?.max) || 1)
    }

    function hitDice() {
        if (tracksHitDicePerClass($cid)) {
            const dice = getAttribs($cid)?.filter(x => x.attributes.name?.startsWith('repeating_hd_') && x.attributes.name?.endsWith('_type'))
            if (dice && dice.length > 1) {
                popup.open(HitDiceDialog)
                return
            }
        }
        rollHitDie($cid)
        const dice = Number(attribs.hit_dice?.current) || 0
        if (dice) setAttrib('hit_dice', dice - 1)
    }

    function rest() {
        popup.open<ConfirmPopup>(ConfirmationDialog, {
            title: 'Long Rest',
            text: 'Resting will restore Health Points to full, half the Hit Dice and all Spell Slots.',
            accept: onRest,
        })
    }

    function getHitDiceDesc() {
        if (tracksHitDicePerClass($cid)) {
            const hdAttribs = getAttribs($cid)?.filter(x => x.attributes.name?.startsWith('repeating_hd_'))
            if (hdAttribs && hdAttribs.length) {
                let str = ''
                hdAttribs
                    .filter(x => x.attributes.name!.endsWith('type'))
                    .sort((a, b) => sortCollator.compare(a.attributes.current?.toString() || '', b.attributes.current?.toString() || ''))
                    .forEach(attr => {
                        const id = attr.attributes.name!.split('_')[2]
                        const typeDice = Number(hdAttribs.find(x => x.attributes.name === `repeating_hd_${id}_type`)?.attributes.current) || 4
                        const currDice = Number(hdAttribs.find(x => x.attributes.name === `repeating_hd_${id}_available`)?.attributes.current) || 0
                        const maxDice = Number(hdAttribs.find(x => x.attributes.name === `repeating_hd_${id}_size`)?.attributes.current) || 1
                        str += `\nD${typeDice}: ${Math.min(Number(currDice) || 0, Number(maxDice) || 1)} / ${maxDice}`
                    })
                return str.replace('\n', '')
            }
        }

        return `HD: ${getCurrentHitDice()} / ${attribs.hit_dice?.max || 1}`
    }

    function onRest() {
        const maxDice = Number(attribs.hit_dice?.max) || 1
        const currDice = Number(attribs.hit_dice?.current) || 0
        const maxRecover = Math.floor(maxDice / 2) || 1

        if (tracksHitDicePerClass($cid)) {
            const hdAttribs = getAttribs($cid)?.filter(x => x.attributes.name?.startsWith('repeating_hd_'))
            if (!hdAttribs || !hdAttribs.length) return

            let recoverLeft = maxRecover
            let total = 0

            hdAttribs
                .filter(x => x.attributes.name!.endsWith('type'))
                .sort((a, b) => sortCollator.compare(b.attributes.current?.toString() || '', a.attributes.current?.toString() || ''))
                .forEach(attr => {
                    const id = attr.attributes.name!.split('_')[2]
                    const name = `repeating_hd_${id}_available`
                    const maxDice = Number(hdAttribs.find(x => x.attributes.name === `repeating_hd_${id}_size`)?.attributes.current) || 1
                    const currDice = Number(hdAttribs.find(x => x.attributes.name === name)?.attributes.current) || 0

                    if (currDice < maxDice) {
                        const recoverable = Math.min(maxDice - currDice, recoverLeft)
                        if (recoverable > 0) {
                            setRoll20Attrib($cid, name, currDice + recoverable)
                            recoverLeft -= recoverable
                            total += recoverable
                        }
                    }

                    total += currDice
                })

            if (total > 0) setAttrib('hit_dice', total)
        } else {
            const recover = Math.min(maxRecover, maxDice - currDice)
            if (recover > 0) setAttrib('hit_dice', currDice + recover)
        }

        const currHp = Number(attribs.hp?.current) || 0
        const maxHp = Number(attribs.hp?.max) || 1
        if (currHp < maxHp) setAttrib('hp', maxHp.toString(), 'current', true)

        getAttribs($cid)?.forEach(attr => {
            if (attr.attributes.name.startsWith('lvl') && attr.attributes.name.endsWith('slots_expended')) {
                const max = getCurrentAttribByName($cid, attr.attributes.name.split('_')[0] + '_slots_total')
                if (max != null) setRoll20Attrib($cid, attr.attributes.name, max)
            }
        })
    }

    function updateMaxHp({ detail }: CustomEvent<string>) {
        const value = Number(detail)
        setAttrib('hp', value, 'max', true)
        if ((Number(attribs.hp?.current) || 0) > value) setAttrib('hp', value, 'current', true)
    }

    $: npcSpeeds = $isNpc ? (attribs.npc_speed?.current.toString() || '30').match(npcSpeedRegex)?.map(x => (x = x + ' ft.')) || [] : []
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs bind:setAttrib />

<div class="bottom">
    {#if $isNpc}
        <div class="section">
            <div
                class="name"
                on:contextmenu={() => sendDescription($cid, 'Hit Points', `Average: ${attribs.hp?.max || 1}`, attribs.npc_hpformula?.current)}
            >
                Hit Points
            </div>
            <div class="values">{attribs.hp?.max || 1}</div>
            <div class="special"><Banner>{attribs.npc_hpformula?.current}</Banner></div>
        </div>
        <div class="section">
            <div class="name" />
            <div class="values" />
            <div class="special" />
        </div>
        <div class="section">
            <div
                class="name"
                on:contextmenu={() => sendDescription($cid, 'Armor Class', `Ac: ${attribs.npc_ac?.current || 10}`, attribs.npc_actype?.current)}
            >
                Armor Class
            </div>
            <div class="values">{attribs.npc_ac?.current || 10}</div>
            <div class="special"><Banner>{attribs.npc_actype?.current}</Banner></div>
        </div>
        <div class="section">
            <div class="name" on:contextmenu={() => sendDescription($cid, 'Movement', npcSpeeds.join(', '))}>Movement</div>
            <div class="values">{npcSpeeds[0]}</div>
            <div class="special">
                {#if npcSpeeds.length > 1}
                    <Banner>{npcSpeeds.slice(1).join(', ')}</Banner>
                {:else}
                    &nbsp;
                {/if}
            </div>
        </div>
    {:else}
        <div class="section">
            <div
                class="name"
                on:contextmenu={() =>
                    sendDescription($cid, 'Hit Points', `HP: ${getCurrentHp()} / ${attribs.hp?.max || 1}\nTemp: ${attribs.hp_temp?.current || 0}`)}
            >
                Hit Points
            </div>
            <div class="values editable">
                <Editable
                    value={attribs && getCurrentHp()}
                    min={-99}
                    max={Number(attribs.hp?.max) || 1}
                    maxWidth="4ch"
                    on:update={({ detail: value }) => setAttrib('hp', value, 'current', true)}
                />
                / {attribs.hp?.max || 1}
                <!-- <Editable
                    value={attribs.hp?.max || 1}
                    min={1}
                    max={999}
                    maxWidth="4ch"
                    on:update={({ detail }) => {
                        const value = Number(detail)
                        setAttrib('hp', value, 'max', true)
                        if ((Number(attribs.hp?.current) || 0) > value) setAttrib('hp', value, 'current', true)
                    }}
                /> -->
            </div>
            <div class="special editable">
                temp&nbsp;&nbsp;<Editable
                    value={attribs.hp_temp?.current || 0}
                    min={0}
                    max={99}
                    maxWidth="3ch"
                    on:update={({ detail: value }) => setAttrib('hp_temp', value, 'current', true)}
                />
            </div>
        </div>
        <div class="section">
            <div class="name action" on:click={hitDice} on:contextmenu={() => sendDescription($cid, 'Hit Dice', getHitDiceDesc())}>Hit Dice</div>
            <div class="values">
                {attribs && getCurrentHitDice()}
                /
                {attribs.hit_dice?.max || 1}
            </div>
            <div class="special clickable" on:click={rest}>rest</div>
        </div>
        <div class="section">
            <div class="name" on:contextmenu={() => sendDescription($cid, 'Armor Class', `Ac: ${attribs.ac?.current || 10}`)}>Armor Class</div>
            <div class="values">{attribs.ac?.current || 10}</div>
            <div class="special">&nbsp;</div>
        </div>
        <div class="section">
            <div class="name" on:contextmenu={() => sendDescription($cid, 'Movement', `${attribs.speed?.current || 30} ft.`)}>Movement</div>
            <div class="values">{attribs.speed?.current || 30} ft.</div>
            <div class="special">&nbsp;</div>
        </div>
    {/if}
    <div class="section">
        <div
            class="name action"
            on:click={() => rollInit($cid, $isNpc)}
            on:contextmenu={() => sendDescription($cid, 'Initiative', `Modifier: ${modifier(attribs.initiative_bonus?.current || 0)}`)}
        >
            Initiative
        </div>
        <div class="values">{modifier(attribs.initiative_bonus?.current || 0)}</div>
        <div class="special">&nbsp;</div>
    </div>
</div>

<style lang="scss">
    .bottom {
        flex-grow: 1;
        display: flex;
    }

    .section {
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: space-around;
        flex: 0 1 20%;
        overflow: hidden;

        &:not(:last-child) {
            border-right: 2px groove white;
            border-radius: 10% 2px 2px 10% / 10% 49% 49% 10%;
        }

        &:last-child {
            width: 140px;
        }

        > .editable {
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .name {
        text-transform: Capitalize;
        font-weight: bold;
        cursor: help;

        &.action {
            cursor: pointer;
        }
    }

    .special {
        font-size: 14px;
        line-height: 20px;
        margin: 0 4px;
        text-transform: lowercase;
    }

    .clickable {
        cursor: pointer;
    }
</style>
