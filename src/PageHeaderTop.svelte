<script lang="ts" context="module">
    const attribNames = ['race_display', 'class_display', 'multiclass1_flag', 'multiclass2_flag', 'multiclass3_flag', 'alignment', 'level', 'pb']
    const npcAttribNames = ['npc_type', 'npc_name', 'npc_challenge', 'npc_xp']

    const alignmentRegex = /any /i
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { npcInfosRegex, sendDescription } from './dnd'
    import { isAttribTrue } from './roll20'
    import Banner from './Banner.svelte'
    import AttribListener from './AttribListener.svelte'

    let attribs: AttribRecord = {}

    function getNpcAlignment() {
        return npcInfos.alignment?.replace(alignmentRegex, '') || 'neutral'
    }

    function getClass() {
        return (attribs.class_display?.current.toString() || 'Peasant').split(' ').slice(0, -1).join(' ')
    }

    function getClassesDesc() {
        return (attribs.class_display?.current.toString() || 'Peasant')
            .split(',')
            .map(x => x.trim())
            .join('\n')
    }

    $: npcInfos = $isNpc ? { ...attribs.npc_type?.current.toString().match(npcInfosRegex)?.groups } : ({} as NpcInfos)
    $: isMulticlassed = $isNpc
        ? false
        : isAttribTrue(attribs.multiclass1_flag?.current) ||
          isAttribTrue(attribs.multiclass2_flag?.current) ||
          isAttribTrue(attribs.multiclass3_flag?.current)
</script>

<AttribListener names={$isNpc ? npcAttribNames : attribNames} bind:attribs />

<div class="top">
    {#if $isNpc}
        <div class="section" on:contextmenu={() => sendDescription($cid, 'Race', npcInfos.race || 'Humanoid')}>
            <Banner>{npcInfos.race || 'Humanoid'}</Banner>
        </div>
        <div class="section" on:contextmenu={() => sendDescription($cid, 'Type', attribs.npc_name?.current || 'Poring')}>
            <Banner>{attribs.npc_name?.current || 'Poring'}</Banner>
        </div>
        <div class="section" on:contextmenu={() => sendDescription($cid, 'Alignment', getNpcAlignment())}>
            {npcInfos && getNpcAlignment()}
        </div>
        <div
            class="section spread"
            on:contextmenu={() =>
                sendDescription($cid, 'Challenge Rating', `CR ${attribs.npc_challenge?.current || '-'}\nexp. ${attribs.npc_xp?.current || '-'}`)}
        >
            <div>CR {attribs.npc_challenge?.current || '-'}</div>
            <div>exp. {attribs.npc_xp?.current || '-'}</div>
        </div>
    {:else}
        <div class="section" on:contextmenu={() => sendDescription($cid, 'Race', attribs.race_display?.current || 'Human')}>
            <Banner>{attribs.race_display?.current || 'Human'}</Banner>
        </div>
        <div
            class="section"
            on:contextmenu={() => (isMulticlassed ? sendDescription($cid, 'Classes', getClassesDesc()) : sendDescription($cid, 'Class', getClass()))}
        >
            <Banner>
                {#if isMulticlassed}
                    {attribs.class_display?.current || 'Peasant'}
                {:else}
                    {attribs && getClass()}
                {/if}
            </Banner>
        </div>
        <div class="section" on:contextmenu={() => sendDescription($cid, 'Alignment', attribs.alignment?.current || 'Neutral')}>
            {attribs.alignment?.current || 'Neutral'}
        </div>
        <div
            class="section spread"
            on:contextmenu={() => sendDescription($cid, 'Level', `Level ${attribs.level?.current || '1'}\nPB +${attribs.pb?.current || '2'}`)}
        >
            <div>Level {attribs.level?.current || '1'}</div>
            <div>PB +{attribs.pb?.current || '2'}</div>
        </div>
    {/if}
</div>

<style lang="scss">
    .top {
        border-bottom: 2px groove white;
        border-radius: 2% 2% 10% 10% / 2% 2px 2px 2px;
        display: flex;
        flex: 0 0 28px;
    }

    .section {
        white-space: nowrap;
        text-transform: capitalize;
        overflow: hidden;
        padding: 4px 6px 0;
        flex: 0 1 25%;
        cursor: help;

        &:not(:last-child) {
            border-right: 2px groove white;
            border-radius: 10% 2px 2px 10% / 10% 49% 49% 10%;
        }

        &:last-child {
            width: 162px;
        }
    }

    .spread {
        display: flex;
        justify-content: space-between;
    }
</style>
