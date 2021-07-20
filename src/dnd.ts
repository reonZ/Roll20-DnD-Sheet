import { getAttribByName, getAttribs, getCurrentAttribByName, isAttribEmpty, isAttribTrue, sendCharacterRoll, setAttrib } from './roll20'

export const npcInfosRegex = /^(?<size>tiny|small|medium|large|huge|gargantuan) (?<race>[\w \(\)]+?)(?:, (?<alignment>[\w ]+))?$/i
export const npcSpeedRegex = /(?:(\w+?) )?(\d.)/g
const itemModifiersRegex = /^(?:item type: (?<type>[\w ]+?), )?(?<modifiers>[\w\d, +-:]+?)$/
const itemModifiersAcRegex = /ac(?<isAc>:)? *(?<value>[+-\d ]+)/g

export function isCharacterNpc(cid: string): boolean {
    return isAttribTrue(getCurrentAttribByName(cid, 'npc'))
}

export function getCharacterLevel(cid: string, isNpc?: boolean) {
    return isNpc ?? isCharacterNpc(cid) ? getCurrentAttribByName(cid, 'npc_challenge') : getCurrentAttribByName(cid, 'level')
}

export function modifier(value: string | number) {
    if (Number(value) < 0) return value.toString()
    return `+${value}`
}

export function sendDescription(cid: string, name: string | number, desc: string | number | undefined, source: string | number = '') {
    if (!desc) return
    const roll = `@{wtype}&{template:traits} {{name=${name}}} {{source=${source}}} {{description=${desc}}}`
    sendCharacterRoll(cid, roll)
}

const npcInitRoll =
    '@{wtype}&{template:npc} @{npc_name_flag} {{rname=^{init}}} {{mod=[[[[@{initiative_bonus}]][DEX]]]}} {{r1=[[@{d20}+[[@{initiative_bonus}]][DEX] &{tracker}]]}} {{normal=1}} {{type=Initiative}}'
const initRoll =
    '@{wtype}&{template:simple} {{rname=^{init-u}}} {{mod=@{initiative_bonus}}} {{r1=[[@{initiative_style}+@{initiative_bonus}@{pbd_safe}[INIT] &{tracker}]]}} {{normal=1}} @{charname_output}'
export function rollInit(cid: string, isNpc: boolean) {
    sendCharacterRoll(cid, isNpc ? npcInitRoll : initRoll)
}

export function rollHitDie(cid: string, die: string | number = '@{hitdieroll}') {
    const roll = `@{wtype}&{template:simple} {{rname=^{hit-dice-u}}} {{mod=D${die}+[[@{constitution_mod}[CON]]]}} {{r1=[[1d${die}+[[@{constitution_mod}]][CON]]]}} {{normal=1}} @{charname_output}`
    sendCharacterRoll(cid, roll)
}

export function isMulticlassed(cid: string) {
    return (
        isAttribTrue(getAttribByName(cid, 'multiclass1_flag')?.attributes.current) ||
        isAttribTrue(getAttribByName(cid, 'multiclass2_flag')?.attributes.current) ||
        isAttribTrue(getAttribByName(cid, 'multiclass3_flag')?.attributes.current)
    )
}

export function tracksHitDicePerClass(cid: string) {
    return isAttribTrue(getAttribByName(cid, 'use_per_class_hit_dice')?.attributes.current) && isMulticlassed(cid)
}

function shortAbility(ability: string) {
    return ability.substr(0, 3).toUpperCase()
}

export function sendAbilityModifierRoll(cid: string, ability: string) {
    const short = shortAbility(ability)
    const roll = `@{wtype}&{template:simple} {{rname=^{${ability}-u}}} {{mod=@{${ability}_mod}@{jack_bonus}}} {{r1=[[@{d20}+@{${ability}_mod}@{jack_attr}[${short}]]]}} @{rtype}+@{${ability}_mod}@{jack_attr}[${short}]]]}} @{charname_output}`
    sendCharacterRoll(cid, roll)
}

export function sendNpcAbilityModifierRoll(cid: string, ability: string) {
    const short = shortAbility(ability)
    const roll = `@{wtype}&{template:npc} @{npc_name_flag} {{rname=^{${ability}}}} {{mod=[[[[@{${ability}_mod}]][${short}]]]}} {{r1=[[@{d20}+[[@{${ability}_mod}]][${short}]]]}} @{rtype}+[[@{${ability}_mod}]][${short}]]]}} {{type=Ability}}`
    sendCharacterRoll(cid, roll)
}

export function sendNpcAbilitySaveRoll(cid: string, ability: string, save?: string | number) {
    const short = shortAbility(ability)
    const mod = !isAttribEmpty(save) ? 'npc_' + ability.substr(0, 3) + '_save' : ability + '_mod'
    const roll = `@{wtype}&{template:npc} @{npc_name_flag} {{rname=^{${ability}-save}}} {{mod=[[[[@{${mod}}]][${short} SAVE]]]}} {{r1=[[@{d20}+[[@{${mod}}]][${short} SAVE]]]}} @{rtype}+[[@{${mod}}]][${short} SAVE]]]}} {{type=Save}}`
    sendCharacterRoll(cid, roll)
}

export function sendNpcSkillSaveRoll(cid: string, skill: { name: string; ability: string }, save?: string | number) {
    const mod = !isAttribEmpty(save) ? 'npc_' + skill.name : skill.ability + '_mod'
    const roll = `@{wtype}&{template:npc} @{npc_name_flag} {{rname=^{${skill.name}}}} {{mod=@{${mod}}}} {{r1=[[@{d20}+@{${mod}}]]}} @{rtype}+@{${mod}}]]}} {{type=Skill}}`
    sendCharacterRoll(cid, roll)
}

export function sendSpellDescription(cid: string, level: string, spell: AttribRecord) {
    sendCharacterRoll(
        cid,
        `@{wtype}&{template:spelloutput} {{level=${spell.spellschool?.current || 'abjuration'} ${level}}} {{name=${
            spell.spellname?.current || ''
        }}} {{castingtime=${spell.spellcastingtime?.current || ''}}} {{range=${spell.spellrange?.current || ''}}} {{target=${
            spell.spelltarget?.current || ''
        }}} ${spell.spellcomp_v?.current || '{{v=1}}'} ${spell.spellcomp_s?.current || '{{s=1}}'} ${
            spell.spellcomp_m?.current || '{{m=1}}'
        } {{material=${spell.spellcomp_materials?.current || ''}}} {{duration=${spell.spellduration?.current || ''}}} {{description=${
            spell.spelldescription?.current || ''
        }}} {{athigherlevels=${spell.spellathigherlevels?.current || ''}}} ${spell.spellritual?.current || '0'} {{innate=${
            spell.innate?.current || ''
        }}} {{savedc=}} ${spell.spellconcentration?.current || '0'} @{charname_output}`
    )
}

export function calculateAc(cid: string) {
    const option = getCurrentAttribByName(cid, 'custom_ac_flag')
    if (option == '2') return

    const dexModifier = Number(getCurrentAttribByName(cid, 'dexterity_mod')) || 0

    let baseAc = 0
    let shieldAc = 0
    let bonusAc = 0
    let globalAc = 0
    let canUseShied = true

    if (option == '1') {
        canUseShied = getCurrentAttribByName(cid, 'custom_ac_shield') !== '0'
        let customBase = Number(getCurrentAttribByName(cid, 'custom_ac_base'))
        customBase = isNaN(customBase) ? 10 : customBase
        const ability1 = (getCurrentAttribByName(cid, 'custom_ac_part1') || 'none') as string
        const ability2 = (getCurrentAttribByName(cid, 'custom_ac_part2') || 'none') as string
        const part1 = ability1 !== 'none' ? Number(getCurrentAttribByName(cid, ability1.toLowerCase() + '_mod')) || 10 : 0
        const part2 = ability2 !== 'none' ? Number(getCurrentAttribByName(cid, ability2.toLowerCase() + '_mod')) || 10 : 0
        baseAc = customBase + part1 + part2
    } else {
        baseAc = 10 + dexModifier
    }

    getAttribs(cid)?.forEach(attr => {
        const name = attr.attributes.name
        const current = (attr.attributes.current as string).toLowerCase()

        if (name.endsWith('_global_ac_active_flag') && current === '1') {
            globalAc += Number(getCurrentAttribByName(cid, name.split('_').slice(0, 5).join('_') + '_val')) || 0
            return
        }

        if (!name.endsWith('_itemmodifiers') || !current.includes('ac')) return
        if (getCurrentAttribByName(cid, name.split('_').slice(0, 3).join('_') + '_equipped') === '0') return

        const match = current.match(itemModifiersRegex)
        if (!match) return
        const type = match.groups!.type?.trim() || 'mod'
        const mods = match.groups!.modifiers

        let ac = 0
        let bonus = 0
        for (const mod of mods.matchAll(itemModifiersAcRegex)) {
            const value = Number(mod.groups!.value) || 0
            if (mod.groups!.isAc && value > ac) ac = value
            else if (!mod.groups!.isAc) bonus += value
        }

        if (type === 'shield') {
            const total = ac + bonus
            if (total > shieldAc) shieldAc = total
        } else if (type.endsWith(' armor')) {
            let total = 0
            if (type.startsWith('light ')) total = ac + bonus + dexModifier
            else if (type.startsWith('medium ')) total = ac + bonus + Math.min(dexModifier, 2)
            else if (type.startsWith('heavy ')) total = ac + bonus
            if (total > baseAc) baseAc = total
        } else {
            bonusAc += bonus
        }
    })

    let totalAc = baseAc + bonusAc + globalAc
    totalAc = canUseShied ? totalAc + shieldAc : totalAc

    setAttrib(cid, 'ac', totalAc, 'current', true)
}

const globalDmgRegex = /({{globaldamage=).+?(}} )/
const globalCritRegex = /({{globaldamagecrit=).+?(}} )/
export function updateGlobalDamages(cid: string) {
    const dmg = `$1[[${getCurrentAttribByName(cid, 'global_damage_mod_roll') || '0'}]]$2`
    const crit = `$1[[${getCurrentAttribByName(cid, 'global_damage_mod_crit') || '0'}]]$2`
    getAttribs(cid)?.forEach(attr => {
        const name = attr.attributes.name
        const content = (attr.attributes.current || '') as string
        if (!name || !content || !name.startsWith('repeating_attack_')) return
        if (name.endsWith('_rollbase') || name.endsWith('_rollbase_dmg') || name.endsWith('_rollbase_crit')) {
            let newContent = content.replace(globalDmgRegex, dmg)
            newContent = newContent.replace(globalCritRegex, crit)
            setAttrib(cid, attr.attributes.name, newContent)
        }
    })
}
