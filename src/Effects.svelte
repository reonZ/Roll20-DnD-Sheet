<script lang="ts" context="module">
    type ModType = 'save' | 'skill' | 'attack' | 'damage' | 'ac'

    type ModSuffixType = 'active_flag' | 'damage' | 'critical_damage' | 'type' | 'val' | 'roll'

    type ModGlobals = Record<ModSuffixType, Roll20AttribAttributes> & { mod: ModType; attribId: string }

    interface GlobalMod {
        name: string
        globals: ModGlobals[]
    }

    const repeatingRegex =
        /^repeating_(?:savemod|skillmod|tohitmod|damagemod|acmod)_[\w\d-]+?_global_[a-z]+_(name|active_flag|roll|damage|critical_damage|type|val)$/
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { calculateAc, updateGlobalDamages } from './dnd'
    import { attribListener, cid, defaultAttributes } from './global'
    import { getAttribs, isAttribTrue, setAttrib as setRoll20Attrib } from './roll20'

    let globalIds: StringUObject = {}
    let globals: AttribRecord = {}

    function onAttribChange(id: string, name: UString, data: AttribEventCallbackData) {
        if (id in globalIds) {
            if (!data) {
                delete globals[globalIds[id]!]
                delete globalIds[id]
                globals = globals
            } else if (name) {
                globals[name] = { ...globals[name], ...data }
            }
        } else if (data && name && name.match(repeatingRegex)) {
            globalIds[id] = name
            globals[name] = { ...data } as Attrib
        }
    }

    function updateAttribs() {
        globalIds = {}
        globals = {}
        getAttribs($cid)?.forEach(attr => {
            const name = attr.attributes.name
            if (name && name.match(repeatingRegex)) {
                globalIds[attr.id] = name
                globals[name] = { ...attr.attributes }
            }
        })
    }

    function getGlobalMods(globalsValues: Roll20AttribAttributes[]) {
        const byAttrib: Record<string, ModGlobals> = {}
        const byNames: Record<string, GlobalMod> = {}
        for (const global of globalsValues) {
            const split = global.name.split('_')
            const attribId = split.slice(0, 3).join('_')
            const suffix = split.slice(5).join('_')
            byAttrib[attribId] = byAttrib[attribId] || { mod: split[4], attribId: split.slice(0, 5).join('_') }
            if (suffix === 'name') {
                const name = (global.current as string).toLowerCase()
                byNames[name] = byNames[name] || { name, globals: [] }
                byNames[name].globals.push(byAttrib[attribId])
            } else {
                byAttrib[attribId][suffix] = global
            }
        }
        return Object.values(byNames)
    }

    function setGlobal(name: string, value: string) {
        globals[name] = globals[name] || { ...defaultAttributes }
        globals[name].current = value
        setRoll20Attrib($cid, name, value)
    }

    function calculateMods(mods: Set<ModType>) {
        mods.forEach(mod => {
            const ids = globalsValues
                .filter(x => x.name.endsWith(`global_${mod}_active_flag`) && x.current === '1')
                .map(x => x.name.split('_').slice(0, 5).join('_'))

            if (mod === 'ac') {
                calculateAc($cid)
            } else if (mod === 'damage') {
                const dmgs: string[] = []
                const crits: string[] = []
                const types: string[] = []
                ids.forEach(x => {
                    const dmg = globals[x + '_damage']?.current
                    if (dmg) dmgs.push(`${dmg}[${globals[x + '_name']?.current}]`)
                    const crit = globals[x + '_critical_damage']?.current
                    if (crit) crits.push(`${crit}[${globals[x + '_name']?.current}]`)
                    const type = globals[x + '_type']?.current
                    if (type) types.push(type as string)
                })
                setRoll20Attrib($cid, 'global_damage_mod_roll', dmgs.join('+'))
                setRoll20Attrib($cid, 'global_damage_mod_crit', crits.join('+'))
                setRoll20Attrib($cid, 'global_damage_mod_type', types.join('/'))
                updateGlobalDamages($cid)
            } else {
                let mods: string[] = []
                ids.forEach(x => {
                    const roll = globals[x + '_roll']?.current
                    if (roll) mods.push(`${roll}[${globals[x + '_name']?.current}]`)
                })
                const final = mods.length ? `[[${mods.join('+')}]]` : ''
                setRoll20Attrib($cid, `global_${mod}_mod`, final)
            }
        })
    }

    function toggleModGlobals(mod: GlobalMod) {
        const disabled = mod.globals.filter(x => x.active_flag?.current !== '1')
        let mods = new Set<ModType>()
        if (disabled.length) {
            disabled.forEach(x => {
                mods.add(x.mod)
                setGlobal(x.attribId + '_active_flag', '1')
            })
        } else {
            mod.globals.forEach(x => {
                mods.add(x.mod)
                setGlobal(x.attribId + '_active_flag', '0')
            })
        }
        calculateMods(mods)
    }

    $: $cid, updateAttribs()
    $: globalsValues = Object.values(globals)

    onMount(() => {
        attribListener.subscribe(onAttribChange)
        return () => attribListener.unsubscribe(onAttribChange)
    })
</script>

<div class="effects">
    {#each getGlobalMods(globalsValues) as mod}
        <div class="effect">
            <div class="name capitalize" on:click={() => toggleModGlobals(mod)}>{mod.name}</div>
            {#each mod.globals as global}
                <div class="row">
                    <div class="active"><div class:selected={isAttribTrue(global.active_flag?.current)} /></div>
                    {#if global.mod === 'ac'}
                        <div>AC: {global.val?.current || 0}</div>
                    {:else if global.mod === 'damage'}
                        {#if global.damage?.current}
                            <div>Damage: {global.damage?.current},</div>
                        {/if}
                        {#if global.critical_damage?.current}
                            <div>Crit: {global.critical_damage?.current},</div>
                        {/if}
                        <div>Type: {global.type?.current || ''}</div>
                    {:else}
                        <div><span class="capitalize">{global.mod}: </span>{global.roll?.current || ''}</div>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .effects {
        flex-grow: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 20px 0;
        justify-content: space-evenly;
        overflow: overlay;
        align-content: flex-start;
        padding: 10px 0;
    }

    .effect {
        display: flex;
        flex-direction: column;
        width: 360px;
        flex-shrink: 0;
    }

    .row {
        display: flex;
        gap: 0.5em;
        font-size: 0.95em;

        &:not(:nth-child(2)) {
            margin-top: -2px;
        }
    }

    .active {
        display: flex;
        justify-content: center;

        > div {
            @include utils.radio();
        }
    }

    .capitalize {
        text-transform: capitalize;
    }

    .name {
        font-weight: bold;
        cursor: pointer;
        border-bottom: 2px solid #4b4a44;
        border-radius: 0px 5px 43px 30px/25px 6px 3px 3px;
        padding: 0 4px;
        height: 22px;
    }
</style>
